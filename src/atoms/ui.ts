import { atom, useAtomValue } from 'jotai';
import { DependencyList, EffectCallback, useEffect } from 'react';

import { TemplateAtom } from './template';

export type ScreenId = 'template' | 'log' | 'stats';
export const DEFAULT_SCREENS: ScreenId[] = ['template'];

export const activeScreensAtom = atom<ScreenId[]>(DEFAULT_SCREENS);

export function useScreenShownEffect(
  id: ScreenId,
  effect: EffectCallback,
  deps: DependencyList,
) {
  const activeScreens = useAtomValue(activeScreensAtom);

  useEffect(() => {
    if (activeScreens.includes(id)) {
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effect, activeScreens, id, ...deps]);
}

interface DisclosureWithContext<T> {
  isOpen: boolean;
  context?: T;
}

// should be used with chakra modal
export function disclosureAtomWithContext<T>(initial?: T) {
  const base = atom<DisclosureWithContext<T>>({
    isOpen: false,
    context: initial,
  });

  const onOpen = atom(null, (_get, set, context: T) => {
    set(base, { isOpen: true, context });
  });

  const onClose = atom(null, (_get, set) => {
    set(base, (v) => ({ ...v, isOpen: false }));
  });

  const onCloseComplete = atom(null, (_get, set) => {
    set(base, { isOpen: false, context: undefined });
  });

  return { base, onOpen, onClose, onCloseComplete };
}

export const editTemplateDisclosure = disclosureAtomWithContext<TemplateAtom>();

export const createLogDisclosure = disclosureAtomWithContext<TemplateAtom>();
