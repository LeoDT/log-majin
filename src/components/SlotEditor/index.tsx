import { Box, Text } from '@chakra-ui/react';
import { PrimitiveAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

import { SelectSlot, Slot, SlotType } from '../../atoms/template';
import { useDraggableListItemUpdateContext } from '../DraggableListContext';

import { NameInput } from './NameInput';
import { SlotEditorSelect } from './Select';

interface Props {
  slotAtom: PrimitiveAtom<Slot>;
}

export function SlotEditor({ slotAtom }: Props): JSX.Element {
  const { t } = useTranslation();
  const slot = useAtomValue(slotAtom);
  const itemUpdate = useDraggableListItemUpdateContext();

  let child = null;
  switch (slot.kind) {
    case SlotType.Select:
      child = (
        <SlotEditorSelect
          slotAtom={slotAtom as PrimitiveAtom<SelectSlot>}
          onUpdate={itemUpdate}
        />
      );
      break;
  }

  return (
    <Box pos="relative">
      <NameInput slotAtom={slotAtom} />

      <Box>{child}</Box>

      <Text color="gray.400" fontSize="xs" lineHeight={1} mt="2">
        {t(`slotType.${slot.kind}`)}
      </Text>
    </Box>
  );
}
