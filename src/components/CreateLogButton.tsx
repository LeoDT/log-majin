import { Button } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';

import { TemplateAtom } from '../atoms/template';
import { useThemeBasedTemplateColor } from '../utils/template';

interface Props {
  templateAtom: TemplateAtom;
}

export function CreateLogButton({ templateAtom }: Props): JSX.Element {
  const t = useAtomValue(templateAtom);
  const colors = useThemeBasedTemplateColor(t.color);

  return (
    <Button
      h="16"
      p="1.5"
      justifyContent="flex-start"
      alignItems="flex-end"
      bgColor={colors.bg}
      color={colors.fgAlt}
      bgGradient={colors.bgGradient}
      _hover={{ bgColor: colors.bgAlt, color: colors.fgAlt }}
    >
      {t.name}
    </Button>
  );
}
