import { atom, type WritableAtom } from 'jotai';
import { atomFamily, atomWithStorage, unwrap } from 'jotai/utils';
import { omit } from 'lodash-es';
import { nanoid } from 'nanoid';

import { randomColorForTemplate } from '../colors';
import { i18n } from '../i18n';
import { createIDBStorageForAtom } from '../utils/atom';
import { db } from '../utils/storage';

export enum SlotType {
  Text = 'text',
  TextInput = 'text-input',
  Select = 'select',
  Number = 'number',
}

export const needInputSlotTypes = [
  SlotType.TextInput,
  SlotType.Select,
  SlotType.Number,
];

export const needRecordHistorySlotTypes = [SlotType.TextInput];

export interface BaseSlot {
  kind: SlotType;
  id: string;
  name: string;
}

export interface TextSlot extends BaseSlot {
  kind: SlotType.Text;
  content: string;
}

export interface TextInputSlot extends BaseSlot {
  kind: SlotType.TextInput;
  placeholder?: string;
}

export interface SelectSlot extends BaseSlot {
  kind: SlotType.Select;
  options: string[];
  multiple: boolean;
}

export interface NumberSlot extends BaseSlot {
  kind: SlotType.Number;
  placeholder?: string;
}

export type Slot = TextSlot | TextInputSlot | SelectSlot | NumberSlot;

export type NeedInputSlot = TextInputSlot | SelectSlot | NumberSlot;

export interface Template {
  id: string;
  name: string;
  slots: Array<Slot>;
  createAt: Date;
  updateAt: Date;
  color: string;
  icon: string;
  archiveAt?: Date;
}

export interface TemplateRevision
  extends Omit<Template, 'archiveAt' | 'updateAt'> {
  templateId: string;
}

export function makeDefaultTemplate(id: string): Template {
  const timestamp = new Date();

  return {
    id,
    name: i18n.t('template.defaultName'),
    slots: [
      {
        name: i18n.t('slot.defaultNameForText'),
        kind: SlotType.Text,
        id: nanoid(),
        content: '',
      },
      {
        name: i18n.t('slot.defaultNameForTextInput'),
        kind: SlotType.TextInput,
        id: nanoid(),
      },
      {
        name: i18n.t('slot.defaultNameForNumber'),
        kind: SlotType.Number,
        id: nanoid(),
      },
      {
        name: i18n.t('slot.defaultNameForSelect'),
        kind: SlotType.Select,
        options: [`${i18n.t('slot.option')} 1`, `${i18n.t('slot.option')} 2`],
        multiple: false,
        id: nanoid(),
      },
    ],
    createAt: timestamp,
    updateAt: timestamp,
    color: randomColorForTemplate(),
    icon: './Business/archive.svg',
  };
}

export const templateStorage = createIDBStorageForAtom(db, 'template');

export interface TemplateUpdateParams extends Partial<Template> {
  shouldUpdateTimestamp?: boolean;
}

export type TemplateAtom = WritableAtom<Template, [TemplateUpdateParams], void>;

export const templateAtomFamily = atomFamily<string | void, TemplateAtom>(
  (id: string | void) => {
    const key = id ?? nanoid();
    const defaults = makeDefaultTemplate(key);

    const baseAtom = atomWithStorage(key, defaults, templateStorage, {
      getOnInit: true,
    });
    const unwrapped = unwrap(baseAtom, (prev) => prev ?? defaults);

    if (import.meta.env.DEV) {
      baseAtom.debugPrivate = true;
      unwrapped.debugPrivate = true;
    }

    const anAtom = atom(
      (get) => get(unwrapped),
      (
        get,
        set,
        { shouldUpdateTimestamp, ...update }: TemplateUpdateParams,
      ) => {
        const newTemplate: Template = {
          ...get(unwrapped),
          ...update,
        };

        if (shouldUpdateTimestamp) {
          newTemplate.updateAt = new Date();
        }

        set(unwrapped, newTemplate);
      },
    );

    if (import.meta.env.DEV) {
      anAtom.debugLabel = `templateAtom.${id}`;
    }

    return anAtom;
  },
  (a, b) => a === b,
);

export const templateIdsAtom = atom(() => db.getAllKeys('template'));

export interface CreateTemplateParams extends Omit<Template, 'id'> {}

// newly created atomWithStorage will not persist
// use this to create new atom and persist
export const createTemplateAtom = atom(
  null,
  (_get, set, create: CreateTemplateParams) => {
    const id = nanoid();
    const anAtom = templateAtomFamily(id);

    set(anAtom, create);

    return anAtom;
  },
);

export const archiveTemplateAtom = atom(
  null,
  async (get, set, { templateAtom }: { templateAtom: TemplateAtom }) => {
    set(templateAtom, {
      ...get(templateAtom),
      archiveAt: new Date(),
    });
  },
);

export function hashSlot(s: Slot) {
  return `${s.id}.${s.kind}.${s.name}`;
}

export function hashTemplate(t: Template | TemplateRevision) {
  return `${t.name}:${t.color}:${t.icon}:${t.slots.map(hashSlot).join('|')}`;
}

export function makeTemplateRevision(t: Template): TemplateRevision {
  return {
    ...omit(t, ['updateAt', 'archiveAt']),
    id: nanoid(),
    templateId: t.id,
    createAt: new Date(),
  };
}

export function getSlotDefaults(kind: SlotType, id: string = nanoid()): Slot {
  switch (kind) {
    case SlotType.Select:
      return {
        id,
        kind,
        name: i18n.t('slot.defaultNameForSelect'),
        options: [i18n.t('slot.selectDefaultOption')],
        multiple: false,
      };

    case SlotType.Text:
      return { id, kind, content: '', name: i18n.t('slot.defaultNameForText') };

    case SlotType.TextInput:
      return { id, kind, name: i18n.t('slot.defaultNameForTextInput') };
    case SlotType.Number:
      return { id, kind, name: i18n.t('slot.defaultNameForNumber') };
  }
}
