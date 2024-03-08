import { Button, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useMemoOne } from 'use-memo-one';

import { templateAtomFamily } from '../atoms/template';

import { EditTemplateModal } from './EditTemplateModal';

export function CreateTemplateButton(): JSX.Element {
  const { t } = useTranslation();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const templateAtom = useMemoOne(() => {
    return templateAtomFamily();
  }, []);

  return (
    // div to prevent dragging the MainTab
    <div onPointerDown={(e) => e.stopPropagation()}>
      <Button
        onClick={onOpen}
        w="full"
        colorScheme="blackAlpha"
        bgColor="black"
      >
        {t('createTemplateButton')}
      </Button>

      <EditTemplateModal
        isOpen={isOpen}
        onClose={onClose}
        templateAtom={templateAtom}
      />
    </div>
  );
}
