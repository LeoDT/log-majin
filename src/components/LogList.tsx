import { Box } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList } from 'react-window';

import { Log, logsAtom } from '../atoms/log';
import { templateMapAtom } from '../atoms/template';
import { TextHeightCalculator } from '../utils/dom';

import { LogListItem } from './LogListItem';
import { useLogLoaderContext } from './LogLoaderContext';

const LOAD_MORE_THRESHOLD = 100;

export function LogList(): JSX.Element {
  const loader = useLogLoaderContext();
  const [ready, setReady] = useState(false);
  const logs = useAtomValue(logsAtom);
  const templateMap = useAtomValue(templateMapAtom);
  const textHeightCalculator = useRef(new TextHeightCalculator());
  const loadNext = useSetAtom(loader.nextAtom);

  const wrapperHeightRef = useRef(0);
  const wrapperHeightDiffRef = useRef(0);
  const calculatorBaseRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<VariableSizeList | null>(null);
  const listElRef = useRef<HTMLDivElement | null>(null);
  const firstLogRef = useRef<Log>(logs[0]);

  const handleScroll = useCallback(() => {
    if (listElRef.current) {
      const { scrollTop, scrollHeight, offsetHeight } = listElRef.current;

      if (scrollTop + offsetHeight >= scrollHeight - LOAD_MORE_THRESHOLD) {
        loadNext();
      }
    }
  }, [loadNext]);

  useEffect(() => {
    if (calculatorBaseRef.current && !ready) {
      const wrapperEl = calculatorBaseRef.current.firstChild;
      const textEl = wrapperEl?.firstChild?.firstChild;

      if (textEl && wrapperEl) {
        textHeightCalculator.current.setMeasureEl(
          textEl as HTMLParagraphElement,
        );

        const wrapperHeight = (wrapperEl as HTMLElement).getBoundingClientRect()
          .height;

        wrapperHeightRef.current = wrapperHeight;
        wrapperHeightDiffRef.current =
          wrapperHeight -
          textHeightCalculator.current.calculate('A', wrapperHeight);

        setReady(true);
      } else {
        throw Error('unexpected error.');
      }
    }
  }, [ready]);

  useEffect(() => {
    // check if there is newly added log, reset list cache
    // we can not add log to the end or the middle of the list
    // so it's safe for now
    if (firstLogRef.current !== logs[0]) {
      firstLogRef.current = logs[0];

      listRef.current?.resetAfterIndex(0);
    }
  }, [logs]);

  return ready ? (
    <>
      <AutoSizer disableWidth>
        {({ height }) => (
          <VariableSizeList
            width="100%"
            height={height}
            itemKey={(i, d) => d[i].id}
            itemData={logs}
            itemCount={logs.length}
            itemSize={(i) =>
              textHeightCalculator.current.calculate(
                logs[i].content,
                wrapperHeightRef.current,
              ) + wrapperHeightDiffRef.current
            }
            onScroll={handleScroll}
            ref={listRef}
            outerRef={listElRef}
          >
            {({ index, style, data }) => {
              const l = data[index];
              const t = templateMap.get(l.templateId);

              return (
                <div style={style}>
                  <LogListItem
                    key={l.id}
                    log={l}
                    name={t?.name}
                    color={t?.color}
                  />
                </div>
              );
            }}
          </VariableSizeList>
        )}
      </AutoSizer>
    </>
  ) : (
    <Box ref={calculatorBaseRef} overflowY="scroll">
      <LogListItem
        log={{ content: 'placeholder', createAt: new Date() } as Log}
      />
    </Box>
  );
}
