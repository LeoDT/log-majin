import { Box, Button, HStack, IconButton, Input, Icon } from '@chakra-ui/react';
import { PrimitiveAtom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { SlClose } from 'react-icons/sl';

import { SelectSlot } from '../../atoms/template';

interface Props {
  slotAtom: PrimitiveAtom<SelectSlot>;
  onUpdate?: () => void;
}

export function SlotEditorSelect({ slotAtom, onUpdate }: Props): JSX.Element {
  const { t } = useTranslation();
  const [slot, setSlot] = useAtom(slotAtom);
  const { options } = slot;

  return (
    <Box>
      {options.map((o, i) => (
        <HStack key={i}>
          <Input
            variant="flushed"
            size="sm"
            value={o}
            onChange={(e) => {
              const options = [...slot.options];
              options.splice(i, 1, e.target.value);

              setSlot({
                ...slot,
                options,
              });

              onUpdate?.();
            }}
          />
          <IconButton
            aria-label="Delete Option"
            colorScheme="blackAlpha"
            icon={<Icon as={SlClose} color="red.300" />}
            size="sm"
            variant="link"
            onClick={() => {
              const options = [...slot.options];
              options.splice(i, 1);

              setSlot({
                ...slot,
                options,
              });

              onUpdate?.();
            }}
          />
        </HStack>
      ))}

      <Button
        variant="link"
        colorScheme="blue"
        size="sm"
        my="1"
        onClick={() => {
          setSlot({
            ...slot,
            options: [...slot.options, t('slot.selectDefaultOption')],
          });

          onUpdate?.();
        }}
      >
        {t('slot.addSelectOption')}
      </Button>
    </Box>
  );
}
