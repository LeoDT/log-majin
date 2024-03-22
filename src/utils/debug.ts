import { getDefaultStore } from 'jotai';
import { sample, sampleSize, uniq } from 'lodash-es';

import { commitLogAtom } from '../atoms/log';
import {
  Slot,
  SlotType,
  Template,
  templateAtomFamily,
} from '../atoms/template';

import { db } from './storage';

const baseTemplates = [
  {
    id: 'MO77iiCpwM-2NnYlebrGz',
    name: '坐地铁',
    slots: [
      { name: '从', kind: 'text', id: 'p4R-BdDW5nvGTC7JyUJJ-' },
      { name: '出发地', kind: 'text-input', id: 'eG2kgEUUQmn6YZUMTp_vz' },
      { id: '_2uZjS-qXEhFvdgEVRmnf', kind: 'text', name: '到' },
      { id: 'PN2O1Y3DjrpB-GqmC5h_M', kind: 'text-input', name: '目的地' },
    ],
    createAt: '2024-03-15T08:20:08.130Z',
    updateAt: '2024-03-15T08:20:08.130Z',
    color: 'blue.400',
    icon: './Business/archive.svg',
  },
  {
    id: 'NDaQbKzjd5kI04Bu6YagW',
    name: '☕',
    slots: [
      { name: '在', kind: 'text', id: 'H21yD-vw_Cew-Hb2CjWBM' },
      { name: '地点', kind: 'text-input', id: 'Y68Rx-KRP9X4bijSqFz3d' },
      { id: 'f6pU_O4RaB-1cyT0OZwAH', kind: 'text', name: '喝了一杯' },
      {
        id: '6IJhWN1L9DehGpV10k-Rq',
        kind: 'select',
        name: '咖啡',
        options: ['美式', '拿铁', '其他'],
        multiple: false,
      },
    ],
    createAt: '2024-03-15T08:18:46.507Z',
    updateAt: '2024-03-15T08:18:46.507Z',
    color: 'orange.800',
    icon: './Business/archive.svg',
  },
  {
    id: 'aPOHPmjqmiaqBCqdsXIq_',
    name: '饿了',
    slots: [{ name: '饿了', kind: 'text', id: 'Fhy9KBnIJjDeiKW2u_6IU' }],
    createAt: '2024-03-15T08:19:49.651Z',
    updateAt: '2024-03-15T08:19:49.651Z',
    color: 'green.400',
    icon: './Business/archive.svg',
  },
  {
    id: 'mBQA9b-qdSzjSRZZ6uzkM',
    name: '打车',
    slots: [
      { name: '从', kind: 'text', id: 'CsQx9ckKK-0hyZmqU8lky' },
      { name: '出发地', kind: 'text-input', id: 'jRcweSvvYQT-Iyc0nRh6P' },
      { id: '9bAOTu0bw7It8nvSJqiFT', kind: 'text', name: '到' },
      { id: 'n7q3YGwEN36n8lFLySrEU', kind: 'text-input', name: '目的地' },
      { id: 'rcdLrtJ8vvEsDYqZ7cMiw', kind: 'text', name: '花了' },
      { id: 'NOMN68KTFfE8bPXUJeZSY', kind: 'number', name: '多少钱' },
    ],
    createAt: '2024-03-15T08:20:46.133Z',
    updateAt: '2024-03-15T08:20:46.133Z',
    color: 'purple.400',
    icon: './Business/archive.svg',
  },
] as Template[];

const stringBase = uniq(
  '他转过身径直看向我举起右拳郑重敬了一个军礼透过标志性黄黑配色头盔如炬目光喷射着对终结族虫子的怒火以及对超级地球民主信仰的光芒我按下互动键效仿他举起了右拳手心沁出一层薄汗距离上一次执行任务已经过去了许多年',
);

function randomSlotValues(slots: Slot[]) {
  return slots.map((s) => {
    let value = '';
    if (s.kind === SlotType.Text) {
      value = s.name;
    }
    if (s.kind === SlotType.Number) {
      value = (Math.random() * 100).toFixed(0);
    }
    if (s.kind === SlotType.TextInput) {
      value = sampleSize(stringBase, 3).join('');
    }
    if (s.kind === SlotType.Select) {
      value = sample(s.options) ?? s.options[0];
    }

    return { slotId: s.id, value };
  });
}

export async function fillData(amount = 20) {
  const store = getDefaultStore();
  const templates = await db.getAll('template');

  if (templates.length === 0) {
    for (const t of baseTemplates) {
      await db.put('template', t);

      templates.push(t);
    }
  }

  for (let i = 0; i < amount; i++) {
    const t = sample(templates);

    if (t) {
      const templateAtom = templateAtomFamily(t);
      const slotValues = randomSlotValues(t.slots);

      await store.set(commitLogAtom, { slotValues, templateAtom });
    }
  }
}

window.fillData = fillData;
