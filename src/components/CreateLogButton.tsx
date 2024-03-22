import { Box, Button, Icon, IconButton, Text } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { LuMoreHorizontal } from 'react-icons/lu';

import { commitNoInputLogAtom } from '../atoms/log';
import { TemplateAtom, isNoInputTemplate } from '../atoms/template';
import { createLogDisclosure, editTemplateDisclosure } from '../atoms/ui';
import { useLogCreatedToast } from '../utils/log';
import { useThemeBasedTemplateColor } from '../utils/template';

interface Props {
  templateAtom: TemplateAtom;
}

export function CreateLogButton({ templateAtom }: Props): JSX.Element {
  const template = useAtomValue(templateAtom);
  const toast = useLogCreatedToast(template.name);
  const colors = useThemeBasedTemplateColor(template.color);
  const startEdit = useSetAtom(editTemplateDisclosure.onOpen);
  const startLog = useSetAtom(createLogDisclosure.onOpen);
  const commitNoInputLog = useSetAtom(commitNoInputLogAtom);

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
        onClick={() => {
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
        onClick={() => {
          if (isNoInputTemplate(template)) {
            const p = commitNoInputLog({ templateAtom });

            toast(p);

            return;
          }

          startLog(templateAtom);
        }}
      >
        <Text noOfLines={2}>{template.name}</Text>
      </Button>
    </Box>
  );
}
