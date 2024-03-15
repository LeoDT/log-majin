import { atom } from 'jotai';
import { uniq } from 'lodash-es';
import { nanoid } from 'nanoid';

import { createIDBStorageForAtom } from '../utils/atom';
import { db } from '../utils/storage';

import {
  SlotType,
  Template,
  TemplateAtom,
  TemplateRevision,
  hashTemplate,
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

export const logStorage = createIDBStorageForAtom(db, 'log');

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
  async (get, _set, { slotValues, templateAtom }: CommitLogParams) => {
    const template = get(templateAtom);
    const tx = db.transaction(
      ['template', 'templateRevision', 'log', 'inputHistory'],
      'readwrite',
    );

    const lastLog = await tx
      .objectStore('log')
      .index('by-template-create')
      .openCursor(
        IDBKeyRange.bound(
          [template.id, new Date(0)],
          [template.id, new Date()],
        ),
        'prev',
      ); // get last log logged with this template

    let maybeRevision: TemplateRevision | undefined = undefined;

    if (lastLog) {
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

    const revision = maybeRevision ?? makeTemplateRevision(template);
    const templateHash = hashTemplate(template);
    const revisionHash = hashTemplate(revision);

    if (templateHash !== revisionHash) {
      // template changed since last log
      await tx.objectStore('templateRevision').put(revision);
    }

    const log: Log = {
      id: nanoid(),
      createAt: new Date(),
      templateId: template.id,
      templateRevisionId: revision.id,
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

    return log;
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
