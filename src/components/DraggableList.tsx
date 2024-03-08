import { Box, HStack, Icon } from '@chakra-ui/react';
import { a, useSprings, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { clamp } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LuGripVertical } from 'react-icons/lu';

import { move } from '../utils/array';

import { DraggableListItemUpdateContext } from './DraggableListContext';

interface Props<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => JSX.Element;

  getScrollBounds: () => {
    top: number;
    bottom: number;
    scrollTop: number;
  };
  onScroll: (dir: 1 | -1) => void;
  onDragEnd: (items: T[]) => void;
  itemGap?: number;
}

type OrderAndSize = Array<[string, number]>;
const SCROLL_THRESHOLD = 40;

export function DraggableList<T>({
  items,
  keyExtractor,
  renderItem,
  itemGap = 10,
  getScrollBounds,
  onScroll,
  onDragEnd,
}: Props<T>): JSX.Element {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const orderAndSize = useRef<OrderAndSize>(
    items.map((item) => [keyExtractor(item), 0]),
  );
  const calculateYWithIndex = useCallback((oas: OrderAndSize, i: number) => {
    return oas.reduce((acc, [, si], index) => {
      return acc + (index < i ? si : 0);
    }, 0);
  }, []);
  const calculateIndexWithY = useCallback((oas: OrderAndSize, y: number) => {
    let acc = 0;
    let i = 0;
    const breakPoints: number[] = [0];

    for (; i < oas.length; i++) {
      const h = oas[i][1];

      breakPoints.push(acc + h);

      acc += h;
    }

    if (y <= 0) {
      return 0;
    }

    if (y >= breakPoints[breakPoints.length - 1]) {
      return breakPoints.length - 2;
    }

    for (i = 0; i < breakPoints.length - 1; i++) {
      if (y >= breakPoints[i] && y < breakPoints[i + 1]) {
        break;
      }
    }

    return clamp(i, 0, oas.length - 1);
  }, []);
  const reorderItems = useCallback(
    (order: string[]) => {
      const results: T[] = [];

      order.forEach((id) => {
        const hit = items.find((item) => keyExtractor(item) === id);

        if (hit) {
          results.push(hit);
        }
      });

      return results;
    },
    [items, keyExtractor],
  );
  const springProps = useCallback(
    (i: number) => {
      return {
        id: keyExtractor(items[i]),
        y: 0,
        opacity: 1,
        shadow: 0,
        zIndex: 0,
        scale: 1,
      };
    },
    [items, keyExtractor],
  );
  const [springs, api] = useSprings(items.length, springProps, [items]);
  const bind = useDrag(
    ({
      args: [id, originalIndex],
      active,
      movement: [, y],
      xy: [, ry],
      memo,
    }) => {
      const scrollBounds = getScrollBounds();
      let scrolled = memo?.scrolled ?? 0;
      const lastScrollBounds = memo?.lastScrollBounds ?? 0;

      const curIndex = orderAndSize.current.findIndex(([i]) => id === i);
      const curY = calculateYWithIndex(orderAndSize.current, curIndex);
      const newIndex = calculateIndexWithY(
        orderAndSize.current,
        curY + y + scrolled,
      );
      const newOrder: OrderAndSize = move(
        orderAndSize.current,
        curIndex,
        newIndex,
      );

      if (scrollBounds) {
        if (
          ry - SCROLL_THRESHOLD < scrollBounds.top &&
          scrollBounds.scrollTop > 0
        ) {
          scrolled +=
            scrollBounds.scrollTop - (lastScrollBounds?.scrollTop ?? 0);
          onScroll?.(-1);
        }

        if (ry + SCROLL_THRESHOLD > scrollBounds.bottom) {
          scrolled +=
            scrollBounds.scrollTop - (lastScrollBounds?.scrollTop ?? 0);
          onScroll?.(1);
        }
      }

      const promise = api.start((i, c) => {
        if (active && i === originalIndex) {
          return {
            y: curY + y + scrolled,
            scale: 1.06,
            opacity: 0.8,
            zIndex: 1,
            shadow: 10,
            immediate: (key: string) => key === 'zIndex',
            config: (key: string) =>
              key === 'y' ? config.stiff : config.default,
          };
        } else {
          const id = c.springs.id.get();
          const index = newOrder.findIndex(([iid]) => iid === id);
          return {
            y: calculateYWithIndex(newOrder, index),
            scale: 1,
            opacity: 1,
            shadow: 0,
            zIndex: 0,
            immediate: false,
          };
        }
      });

      if (!active) {
        orderAndSize.current = newOrder;

        setTimeout(async () => {
          await Promise.all(promise);
          onDragEnd(reorderItems(newOrder.map(([id]) => id)));
        }, 0);

        return {
          scrolled: 0,
          lastScrollBounds: null,
        };
      }

      return { scrolled, lastScrollBounds: scrollBounds };
    },
  );

  const [itemUpdateContextValue, setItemUpdateContextValue] = useState(0);
  const itemUpdate = useCallback(() => {
    setItemUpdateContextValue((s) => s + 1);
  }, [setItemUpdateContextValue]);

  useEffect(() => {
    orderAndSize.current = items.map((item) => [keyExtractor(item), 0]);

    if (rootRef.current) {
      const root = rootRef.current;
      let height = 0;

      for (let i = 0; i < root.children.length; i++) {
        const c = root.children.item(i) as HTMLDivElement;
        const id = c?.dataset.draggableId;

        const oasIndex = orderAndSize.current.findIndex(([iid]) => iid === id);
        orderAndSize.current[oasIndex][1] = c.offsetHeight + itemGap;
        height += c.offsetHeight + itemGap;
      }

      rootRef.current.style.height = `${height}px`;

      api.start((i: number) => {
        return {
          y: calculateYWithIndex(orderAndSize.current, i) + 1,
          // maybe a react-spring bug, when the y is 0 and springs are added/removed, the y 0 one will not be moved, so change it to 1
          immediate: true,
          id: orderAndSize.current[i][0],
          shadow: 0,
          zIndex: 0,
          opacity: 1,
          scale: 1,
        };
      });
    }
  }, [
    items,
    api,
    calculateYWithIndex,
    itemGap,
    keyExtractor,
    itemUpdateContextValue,
  ]);

  return (
    <DraggableListItemUpdateContext.Provider value={itemUpdate}>
      <Box
        onPointerDown={(e) => e.stopPropagation()}
        ref={rootRef}
        pos="relative"
        userSelect="none"
      >
        {items.map((item, index) => {
          const id = keyExtractor(item);
          const { y, zIndex, scale, shadow, opacity } = springs[index];

          return (
            <a.div
              key={id}
              data-draggable-id={id}
              style={{
                y,
                zIndex,
                scale,
                opacity,
                transformOrigin: '50% 50% none',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: 'auto',
              }}
            >
              <HStack>
                <a.div
                  style={{
                    boxShadow: shadow.to(
                      (s) => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`,
                    ),
                    flexGrow: 1,
                  }}
                >
                  {renderItem(item, index)}
                </a.div>

                <Box
                  sx={{ touchAction: 'none' }}
                  cursor="grabbing"
                  {...bind(id, index)}
                >
                  <Icon as={LuGripVertical} boxSize="6" color="gray.600" />
                </Box>
              </HStack>
            </a.div>
          );
        })}
      </Box>
    </DraggableListItemUpdateContext.Provider>
  );
}
