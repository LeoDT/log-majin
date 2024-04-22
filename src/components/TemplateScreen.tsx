import { Box, SimpleGrid } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai/react';
import { useCallback } from 'react';

import { loadTemplatesAtom, templateAtomsAtom } from '../atoms/template';
import {
  ScreenId,
  createLogDisclosure,
  editTemplateDisclosure,
  useScreenShownEffect,
} from '../atoms/ui';

import { CreateLogButton } from './CreateLogButton';
import { CreateLogModal } from './CreateLogModal';
import { CreateTemplateButton } from './CreateTemplateButton';
import { EditTemplateModal } from './EditTemplateModal';

export const id: ScreenId = 'template';
export const name = 'createTab';
export const scroll = true;

export function Screen(): JSX.Element {
  const loadTemplates = useSetAtom(loadTemplatesAtom);
  const templateAtoms = useAtomValue(templateAtomsAtom);

  const { context: templateModalContext, isOpen: templateModalIsOpen } =
    useAtomValue(editTemplateDisclosure.base);
  const templateModalOnClose = useSetAtom(editTemplateDisclosure.onClose);
  const templateModalOnCloseComplete = useSetAtom(
    editTemplateDisclosure.onCloseComplete,
  );

  const { context: logModalContext, isOpen: logModalIsOpen } = useAtomValue(
    createLogDisclosure.base,
  );
  const logModalOnClose = useSetAtom(createLogDisclosure.onClose);
  const logModalOnCloseComplete = useSetAtom(
    createLogDisclosure.onCloseComplete,
  );

  const effect = useCallback(() => {
    loadTemplates();
  }, [loadTemplates]);

  useScreenShownEffect(id, effect, []);

  return (
    <Box px="3" pb="2">
      <SimpleGrid columns={2} spacing={3}>
        {templateAtoms.map((a) => (
          <CreateLogButton key={a.toString()} templateAtom={a} />
        ))}
      </SimpleGrid>

      <Box mt="3">
        <CreateTemplateButton />
      </Box>

      {/* prevent event bubble up to the MainTab */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {templateModalContext ? (
          <EditTemplateModal
            isOpen={templateModalIsOpen}
            onClose={templateModalOnClose}
            onCloseComplete={templateModalOnCloseComplete}
            templateAtom={templateModalContext}
          />
        ) : null}

        {logModalContext ? (
          <CreateLogModal
            isOpen={logModalIsOpen}
            onClose={logModalOnClose}
            onCloseComplete={logModalOnCloseComplete}
            templateAtom={logModalContext}
          />
        ) : null}
      </div>
    </Box>
  );
}

Screen.displayName = 'TemplateScreen';
