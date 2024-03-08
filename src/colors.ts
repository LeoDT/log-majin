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
  .map((c) => [`${c}.300`, `${c}.500`, `${c}.700`])
  .flat();

export function randomColorForTemplate() {
  return sample(colorsForTemplate) as string;
}
