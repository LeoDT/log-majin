import { sample } from 'lodash-es';

export const colorsForTemplate = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'cyan',
  'purple',
  'pink',
]
  .map((c) => [`${c}.400`, `${c}.600`, `${c}.800`])
  .flat();

export function randomColorForTemplate() {
  return sample(colorsForTemplate) as string;
}
