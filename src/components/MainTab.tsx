import { Box, HStack, Text } from '@chakra-ui/react';
import { a, useSprings } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { useSetAtom } from 'jotai';
import { clamp, range } from 'lodash-es';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { activeScreensAtom } from '../atoms/ui';

import * as LogScreen from './LogScreen';
import * as StatsScreen from './StatsScreen';
import * as TemplateScreen from './TemplateScreen';

const TABS = [TemplateScreen, LogScreen, StatsScreen].map(
  ({ id, name, Screen }) => ({
    id,
    name: name as 'logTab' | 'createTab' | 'statsTab',
    children: <Screen />,
  }),
);

const MAX_SCREEN_WIDTH = 414;
const TAB_HEIGHT = '40px';

export function MainTab(): JSX.Element {
  const { t } = useTranslation();

  const screenW = Math.min(MAX_SCREEN_WIDTH, window.innerWidth);
  const screensPerWindow = Math.floor(window.innerWidth / screenW);
  const maxScreenIndex = TABS.length - screensPerWindow;

  const activeScreenIndex = useRef(0);
  const setActiveScreens = useSetAtom(activeScreensAtom);
  const [tabsProps, api] = useSprings(TABS.length, (i) => ({
    x: i * screenW,
    opacity: i === activeScreenIndex.current ? 1 : 0.4,
  }));

  const updateActiveScreens = useCallback(() => {
    const lastScreenHalfShown = screensPerWindow * screenW < window.innerWidth;
    const screenIndexes = range(
      activeScreenIndex.current,
      clamp(
        activeScreenIndex.current +
          screensPerWindow +
          (lastScreenHalfShown ? 1 : 0),
        0,
        TABS.length,
      ),
    );

    setActiveScreens(screenIndexes.map((i) => TABS[i].id));
  }, [screenW, screensPerWindow, setActiveScreens]);

  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], cancel }) => {
      if (active && Math.abs(mx) > screenW / 2) {
        activeScreenIndex.current = clamp(
          activeScreenIndex.current + (xDir > 0 ? -1 : 1),
          0,
          maxScreenIndex,
        );
        cancel();

        // animation done, update ui
        updateActiveScreens();
      }
      api.start((i) => {
        const x = (i - activeScreenIndex.current) * screenW + (active ? mx : 0);
        const opacity = i === activeScreenIndex.current ? 1 : 0.4;

        return { x, opacity };
      });
    },
    { eventOptions: { passive: false } },
  );

  const jumpTo = useCallback(
    async (to: number) => {
      activeScreenIndex.current = clamp(to, 0, maxScreenIndex);

      await Promise.all(
        api.start((i) => {
          return {
            x: (i - activeScreenIndex.current) * screenW,
            opacity: i === activeScreenIndex.current ? 1 : 0.4,
          };
        }),
      );

      // animation done, update ui
      updateActiveScreens();
    },
    [api, maxScreenIndex, screenW, updateActiveScreens],
  );

  useEffect(() => {
    updateActiveScreens();
  }, [updateActiveScreens]);

  return (
    <Box pos="absolute" h="full" w="full">
      <HStack h={TAB_HEIGHT} alignItems="center" pl="2" gap="4">
        {TABS.map(({ id, name }, i) => (
          <a.div
            key={id}
            onClick={() => jumpTo(i)}
            style={{ opacity: tabsProps[i].opacity }}
          >
            <Text fontWeight="bold">{t(name)}</Text>
          </a.div>
        ))}
      </HStack>
      <Box
        pos="absolute"
        top={TAB_HEIGHT}
        left={0}
        w="full"
        h={`calc(100% - ${TAB_HEIGHT})`}
        overflow="hidden"
      >
        {TABS.map(({ id, children }, i) => (
          <a.div
            {...bind()}
            key={id}
            style={{
              position: 'absolute',
              height: '100%',
              width: `${screenW}px`,
              touchAction: 'pan-y',
              x: tabsProps[i].x,
              overflowY: 'auto',
            }}
          >
            {children}
          </a.div>
        ))}
      </Box>
    </Box>
  );
}
