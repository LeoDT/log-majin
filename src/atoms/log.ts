import { atom } from 'jotai';
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
} from './template';

export interface SlotValue<T = string> {
  id: string;
  value: T;
}

export interface SlotValueTypes {
  [SlotType.Text]: undefined;
  [SlotType.TextInput]: SlotValue<string>;
  [SlotType.Select]: SlotValue<string>;
  [SlotType.Number]: SlotValue<string>;
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
  const values = template.slots.map((p) => ({
    id: p.id,
    value: p.kind === SlotType.Text ? p.content : '',
  }));

  return {
    id: nanoid(),
    slotValues: values,
    createAt: new Date(),
    content: values.map((p) => p.value).join(' '),
    templateId: template.id,
    templateRevisionId: '',
  };
}

export interface CommitLogParams {
  slotValues: Array<SlotValue>;
  templateAtom: TemplateAtom;
}
export const commitLogAtom = atom(
  null,
  async (get, _set, { slotValues, templateAtom }: CommitLogParams) => {
    const template = await get(templateAtom);
    const tx = db.transaction(
      ['template', 'templateRevision', 'log'],
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
    await tx.done;

    return log;
  },
);
