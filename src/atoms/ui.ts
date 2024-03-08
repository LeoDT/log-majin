import { atom, useAtomValue } from 'jotai';
import { DependencyList, EffectCallback, useEffect } from 'react';

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
