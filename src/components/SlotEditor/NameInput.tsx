import { Input } from '@chakra-ui/react';
import { PrimitiveAtom, useAtom } from 'jotai';

import { Slot } from '../../atoms/template';

interface Props {
  slotAtom: PrimitiveAtom<Slot>;
}

export function NameInput({ slotAtom }: Props): JSX.Element {
  const [slot, setSlot] = useAtom(slotAtom);

  return (
    <Input
      size="md"
      variant="unstyled"
      borderRadius="none"
      border="none"
      value={slot.name}
      onChange={(e) => setSlot({ ...slot, name: e.target.value })}
    />
  );
}
