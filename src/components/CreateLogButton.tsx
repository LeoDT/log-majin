import { Box, Button, Icon, IconButton, Text } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { LuMoreHorizontal } from 'react-icons/lu';

import { TemplateAtom } from '../atoms/template';
import { createLogDisclosure, editTemplateDisclosure } from '../atoms/ui';
import { useThemeBasedTemplateColor } from '../utils/template';

interface Props {
  templateAtom: TemplateAtom;
}

export function CreateLogButton({ templateAtom }: Props): JSX.Element {
  const t = useAtomValue(templateAtom);
  const colors = useThemeBasedTemplateColor(t.color);
  const startEdit = useSetAtom(editTemplateDisclosure.onOpen);
  const startLog = useSetAtom(createLogDisclosure.onOpen);

  return (
    <Box pos="relative">
      <IconButton
        position="absolute"
        top="1"
        right="1"
        variant="ghost"
        colorScheme={'whiteAlpha'}
        bgColor={colors.bgAlt}
        isRound
        aria-label="Template Menu"
        size="xs"
        h="6"
        minW="6"
        zIndex="1"
        icon={<Icon as={LuMoreHorizontal} boxSize="1.75em" color="white" />}
        onClick={(e) => {
          startEdit(templateAtom);
        }}
      />

      <Button
        h="20"
        p="1.5"
        w="full"
        justifyContent="flex-start"
        alignItems="flex-end"
        whiteSpace="wrap"
        textAlign="left"
        bgColor={colors.bg}
        color={colors.fg}
        bgGradient={colors.bgGradient}
        _hover={{ bgColor: colors.bgAlt, color: colors.fgAlt }}
        onClick={() => startLog(templateAtom)}
      >
        <Text noOfLines={2}>{t.name}</Text>
      </Button>
    </Box>
  );
}
