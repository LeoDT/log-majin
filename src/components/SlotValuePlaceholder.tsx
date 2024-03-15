import { Button } from '@chakra-ui/react';
import { PrimitiveAtom, useAtomValue } from 'jotai';

import { SlotValue } from '../atoms/log';
import { Slot } from '../atoms/template';
import { TemplateColors } from '../utils/template';

interface Props {
  slotValueAtom: PrimitiveAtom<SlotValue>;
  slot: Slot;
  colors: TemplateColors;
  active: boolean;
  onActivate: () => void;
}

export function SlotValuePlaceholder({
  slotValueAtom,
  slot,
  colors,
  active,
  onActivate,
}: Props): JSX.Element {
  const sv = useAtomValue(slotValueAtom);
  const value = sv.value && sv.value !== '' ? sv.value : slot.name;

  return (
    <Button
      size="sm"
      fontSize="md"
      whiteSpace="wrap"
      h="auto"
      px="2"
      py="1.5"
      mx="1"
      maxW="100%"
      overflow="hidden"
      bgColor={colors.bg}
      color={colors.fg}
      opacity={active ? 1 : 0.6}
      _hover={{
        bgColor: colors.bgAlt,
        color: colors.fg,
      }}
      onClick={() => onActivate()}
    >
      {value}
    </Button>
  );
}
