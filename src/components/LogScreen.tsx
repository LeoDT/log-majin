import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { useMemoOne } from 'use-memo-one';

import { makeLogLoader } from '../atoms/log';
import { ScreenId, useScreenShownEffect } from '../atoms/ui';

import { LogList } from './LogList';
import { LogLoaderContext } from './LogLoaderContext';

export const id: ScreenId = 'log';
export const name = 'logTab';

export function Screen(): JSX.Element {
  const loader = useMemoOne(() => makeLogLoader(20), []);
  const init = useSetAtom(loader.initAtom);
  const effect = useCallback(() => {
    init();
  }, [init]);

  useScreenShownEffect(id, effect, []);

  return (
    <LogLoaderContext.Provider value={loader}>
      <LogList />
    </LogLoaderContext.Provider>
  );
}

Screen.displayName = 'LogScreen';
