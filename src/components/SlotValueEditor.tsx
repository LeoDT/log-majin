import {
  Box,
  Input,
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
  VStack,
} from '@chakra-ui/react';
import { PrimitiveAtom, useAtom } from 'jotai';
import { Suspense } from 'react';
import { useMemoOne } from 'use-memo-one';

import { SlotValue, makeInputHistoryAtom } from '../atoms/log';
import { Slot, SlotType } from '../atoms/template';

import { SlotInputHistory } from './SlotInputHistory';

interface Props {
  slotValueAtom: PrimitiveAtom<SlotValue>;
  slot: Slot;
}

export function SlotValueEditor({ slotValueAtom, slot }: Props): JSX.Element {
  const [slotValue, setSlotValue] = useAtom(slotValueAtom);
  const inputHistoryAtom = useMemoOne(
    () => makeInputHistoryAtom(slotValue.slotId),
    [slotValue.slotId],
  );

  let child = null;

  switch (slot.kind) {
    case SlotType.Select:
      child = (
        <RadioGroup
          value={slotValue.value}
          onChange={(value) => {
            setSlotValue(({ slotId: id }) => ({ slotId: id, value }));
          }}
          w="full"
        >
          <VStack alignItems="flex-start" w="full">
            {slot.options.map((o, i) => (
              <Box
                key={`${slotValue.slotId}.${i}`}
                borderBottom="1px"
                borderColor="gray.300"
                _last={{ borderBottom: '0px' }}
                py="1"
                px="2"
                w="full"
              >
                <Radio w="full" value={o}>
                  {o}
                </Radio>
              </Box>
            ))}
          </VStack>
        </RadioGroup>
      );
      break;
    case SlotType.Number:
      child = (
        <Box px="2">
          <NumberInput
            variant="filled"
            value={slotValue.value}
            onChange={(value) =>
              setSlotValue(({ slotId: id }) => ({
                slotId: id,
                value,
              }))
            }
          >
            <NumberInputField autoFocus />
          </NumberInput>
        </Box>
      );
      break;
    case SlotType.TextInput:
      child = (
        <Box px="2">
          <Input
            autoFocus
            variant="filled"
            value={slotValue.value}
            onChange={(e) =>
              setSlotValue(({ slotId: id }) => ({
                slotId: id,
                value: e.currentTarget.value,
              }))
            }
          />

          <Suspense fallback={''}>
            <Box mt="1">
              <SlotInputHistory
                inputHistoryAtom={inputHistoryAtom}
                onSelect={(value) => {
                  setSlotValue(({ slotId: id }) => ({
                    slotId: id,
                    value,
                  }));
                }}
              />
            </Box>
          </Suspense>
        </Box>
      );
      break;
  }

  return <>{child}</>;
}
