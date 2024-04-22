import { Box } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { useMemoOne } from 'use-memo-one';

import { makeLogLoader } from '../atoms/log';
import { ScreenId, useScreenShownEffect } from '../atoms/ui';

import { LogList } from './LogList';
import { LogLoaderContext } from './LogLoaderContext';

export const id: ScreenId = 'log';
export const name = 'logTab';
export const scroll = false;

export function Screen(): JSX.Element {
  const loader = useMemoOne(() => makeLogLoader(20), []);
  const init = useSetAtom(loader.initAtom);
  const inited = useAtomValue(loader.initedAtom);
  const effect = useCallback(() => {
    init();
  }, [init]);

  useScreenShownEffect(id, effect, []);

  return (
    <LogLoaderContext.Provider value={loader}>
      {inited ? (
        <Box h="full" display="flex" flexDir="column">
          <Box>123</Box>
          <Box flexGrow="1">
            <LogList />
          </Box>
        </Box>
      ) : (
        <div></div>
      )}
    </LogLoaderContext.Provider>
  );
}

Screen.displayName = 'LogScreen';
