import { Button } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

import { createTemplateAtom } from '../atoms/template';
import { editTemplateDisclosure } from '../atoms/ui';

export function CreateTemplateButton(): JSX.Element {
  const { t } = useTranslation();
  const createTemplate = useSetAtom(createTemplateAtom);
  const startEdit = useSetAtom(editTemplateDisclosure.onOpen);

  return (
    // div to prevent dragging the MainTab
    <div onPointerDown={(e) => e.stopPropagation()}>
      <Button
        onClick={async () => {
          const atom = await createTemplate();
          startEdit(atom);
        }}
        w="full"
        colorScheme="blackAlpha"
        bgColor="black"
      >
        {t('createTemplateButton')}
      </Button>
    </div>
  );
}
