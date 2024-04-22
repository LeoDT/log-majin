import { atom } from 'jotai';
import { uniq } from 'lodash-es';
import { nanoid } from 'nanoid';

import { KEYRANGE_MAX, KEYRANGE_MIN, db } from '../utils/storage';

import {
  SlotType,
  Template,
  TemplateAtom,
  TemplateRevision,
  hashTemplate,
  isNoInputTemplate,
  makeTemplateRevision,
  needRecordHistorySlotTypes,
} from './template';

const MAX_INPUT_HISTORY = 8;

export interface SlotValue {
  slotId: string;
  value: string;
}

export interface Log {
  id: string;
  createAt: Date;
  slotValues: Array<SlotValue>;
  content: string;
  templateId: string;
  templateRevisionId: string;
}

export interface LogWithTemplate extends Log {
  templateRevision: TemplateRevision;
}

export const logsAtom = atom<Log[]>([]);

export function makeLogLoader(pageSize: number = 20) {
  type Key = Date | undefined;

  // use openCursor with prev, so the lowerKey is the most recent
  let lower: Key;
  let upper: Key;

  const makeCursor = (lower: Key, upper: Key) => {
    let range: IDBKeyRange | undefined = undefined;

    if (lower && upper) {
      range = IDBKeyRange.bound(lower, upper, true, true);
    } else if (!lower && upper) {
      range = IDBKeyRange.upperBound(upper, true);
    } else if (lower && !upper) {
      range = IDBKeyRange.lowerBound(upper, true);
    }

    return db
      .transaction('log')
      .store.index('by-create')
      .openCursor(range, 'prev');
  };

  const loadNext = async () => {
    let cursor = await makeCursor(undefined, upper);

    const r: Log[] = [];

    while (cursor && r.length < pageSize) {
      if (!lower) {
        lower = cursor.key;
      }

      r.push(cursor.value);

      upper = cursor.key;

      cursor = await cursor.continue();
    }

    if (cursor?.key) {
      upper = cursor?.key;
    }

    return r;
  };

  const initedAtom = atom(false);
  const initAtom = atom(null, async (get, set) => {
    if (!get(initedAtom)) {
      set(logsAtom, []);
      await set(nextAtom);
      set(initedAtom, true);
    }
  });

  const nextAtom = atom(null, async (_get, set) => {
    const more = await loadNext();

    if (more.length > 0) {
      set(logsAtom, (logs) => [...logs, ...more]);

      return more;
    }

    return null;
  });

  return {
    initedAtom,
    initAtom,
    nextAtom,
  };
}

export function makeDefaultLog(template: Template): Log {
  const values = template.slots.map((s) => ({
    slotId: s.id,
    value: s.kind === SlotType.Text ? s.name : '',
  }));

  return {
    id: nanoid(),
    slotValues: values,
    createAt: new Date(),
    content: values.map((sv) => sv.value).join(' '),
    templateId: template.id,
    templateRevisionId: '',
  };
}

export function validateSlotValues(values: SlotValue[]) {
  return values.every(
    ({ value }) => value !== '' && value !== undefined && value !== null,
  );
}

export interface CommitLogParams {
  slotValues: Array<SlotValue>;
  templateAtom: TemplateAtom;
}
export const commitLogAtom = atom(
  null,
  async (get, set, { slotValues, templateAtom }: CommitLogParams) => {
    const template = get(templateAtom);
    const tx = db.transaction(
      ['template', 'templateRevision', 'log', 'inputHistory'],
      'readwrite',
    );

    const lastLog = await tx
      .objectStore('log')
      .index('by-create-content-template')
      .openCursor(
        IDBKeyRange.bound(
          [template.id, KEYRANGE_MIN, new Date(0)],
          [template.id, KEYRANGE_MAX, new Date()],
        ),
        'prev',
      ); // get last log logged with this template

    let maybeRevision: TemplateRevision | undefined = undefined;

    if (lastLog?.value) {
      maybeRevision = await tx
        .objectStore('templateRevision')
        .get(lastLog.value.templateRevisionId);

      if (!maybeRevision) {
        // should not happen
        console.warn(`template revision not found, creating`);

        const created = makeTemplateRevision(template);
        await tx.objectStore('templateRevision').put(created);
        maybeRevision = created;
      }
    }

    if (maybeRevision) {
      const templateHash = hashTemplate(template);
      const revisionHash = hashTemplate(maybeRevision);

      if (templateHash !== revisionHash) {
        // template changed since last log

        maybeRevision = makeTemplateRevision(template);
        await tx.objectStore('templateRevision').put(maybeRevision);
      }
    } else {
      maybeRevision = makeTemplateRevision(template);
      await tx.objectStore('templateRevision').put(maybeRevision);
    }

    if (!maybeRevision) throw Error('assert maybeRevision');

    const log: Log = {
      id: nanoid(),
      createAt: new Date(),
      templateId: template.id,
      templateRevisionId: maybeRevision.id,
      slotValues,
      content: slotValues.map((p) => p.value).join(' '),
    };

    await tx.objectStore('log').put(log);

    for (const sv of slotValues) {
      const slot = template.slots.find(({ id }) => id === sv.slotId);

      if (slot && needRecordHistorySlotTypes.includes(slot.kind)) {
        const inputHistory = (await tx
          .objectStore('inputHistory')
          .get(sv.slotId)) ?? { slotId: sv.slotId, history: [] };

        await tx.objectStore('inputHistory').put({
          slotId: inputHistory.slotId,
          history: uniq([sv.value, ...inputHistory.history]).slice(
            0,
            MAX_INPUT_HISTORY,
          ),
        });
      }
    }

    await tx.done;

    // add log to the head of logs
    set(logsAtom, (logs) => [log, ...logs]);

    return log;
  },
);

export const commitNoInputLogAtom = atom(
  null,
  async (get, set, { templateAtom }: { templateAtom: TemplateAtom }) => {
    const t = get(templateAtom);

    if (isNoInputTemplate(t)) {
      await set(commitLogAtom, {
        templateAtom,
        slotValues: t.slots.map((s) => ({
          slotId: s.id,
          value: s.name,
        })),
      });
    } else {
      throw TypeError('template need input');
    }
  },
);

export function makeInputHistoryAtom(slotId: string) {
  const a = atom(async () => {
    const ih = await db.get('inputHistory', slotId);

    if (ih) {
      return ih.history;
    }

    return [];
  });

  if (import.meta.env.DEV) {
    a.debugLabel = 'slot.${slotId}.inputHistoryAtom';
  }

  return a;
}
