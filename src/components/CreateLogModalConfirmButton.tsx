import { Button } from '@chakra-ui/react';
import { PrimitiveAtom, atom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useMemoOne } from 'use-memo-one';

import { SlotValue, validateSlotValues } from '../atoms/log';

interface Props {
  slotValuesAtom: PrimitiveAtom<SlotValue[]>;
  onConfirm: () => void;
}

export function CreateLogModalConfirmButton({
  slotValuesAtom,
  onConfirm,
}: Props): JSX.Element {
  const { t } = useTranslation();
  const slotValuesAllFilledAtom = useMemoOne(() => {
    const a = atom((get) => validateSlotValues(get(slotValuesAtom)));

    if (import.meta.env.DEV) {
      a.debugLabel = 'slotValuesAllFilledAtom';
    }

    return a;
  }, [slotValuesAtom]);

  const slotValuesAllFilled = useAtomValue(slotValuesAllFilledAtom);

  return (
    <Button
      isDisabled={!slotValuesAllFilled}
      variant="link"
      colorScheme="blue"
      onClick={() => {
        if (slotValuesAllFilled) {
          onConfirm();
        }
      }}
      ml="1"
      flexShrink={0}
    >
      {t('confirm')}
    </Button>
  );
}
