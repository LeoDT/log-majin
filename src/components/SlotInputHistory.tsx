import { Text, Button, HStack } from '@chakra-ui/react';
import { type Atom } from 'jotai';
import { useAtomValue } from 'jotai/react';
import { useTranslation } from 'react-i18next';

interface Props {
  inputHistoryAtom: Atom<Promise<string[]>>;
  onSelect: (s: string) => void;
}

export function SlotInputHistory({
  inputHistoryAtom,
  onSelect,
}: Props): JSX.Element | null {
  const { t } = useTranslation();
  const inputHistory = useAtomValue(inputHistoryAtom);

  return inputHistory.length > 0 ? (
    <HStack flexWrap="wrap">
      <Text color="gray.600">{t('textInputHistoryLabel')}:</Text>
      {inputHistory.map((h, i) => (
        <Button
          key={i}
          variant="link"
          size="md"
          onClick={() => onSelect(h)}
          colorScheme="blue"
        >
          {h}
        </Button>
      ))}
    </HStack>
  ) : null;
}
