import { createContextNoNullCheck } from '../utils/react';

export const [
  useDraggableListItemUpdateContext,
  DraggableListItemUpdateContext,
] = createContextNoNullCheck<() => void>(() => {});
