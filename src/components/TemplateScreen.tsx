import { Box, SimpleGrid } from '@chakra-ui/react';
import { useAtomValue } from 'jotai/react';
import { range } from 'lodash-es';
import { useMemoOne } from 'use-memo-one';

import { templateAtomFamily, templateIdsAtom } from '../atoms/template';
import { ScreenId, useScreenShownEffect } from '../atoms/ui';

import { CreateLogButton } from './CreateLogButton';
import { CreateTemplateButton } from './CreateTemplateButton';

export const id: ScreenId = 'template';
export const name = 'createTab';

export function Screen(): JSX.Element {
  const templateIds = useAtomValue(templateIdsAtom);
  const templateAtoms = useMemoOne(() => {
    return templateIds.map((id) => templateAtomFamily(id));
  }, [templateIds]);

  useScreenShownEffect(
    id,
    () => {
      console.log('template tab');
    },
    [],
  );

  return (
    <Box px="4" pb="2">
      <SimpleGrid columns={2} spacing={3}>
        {templateAtoms.map((a) => (
          <CreateLogButton key={a.toString()} templateAtom={a} />
        ))}
      </SimpleGrid>

      <Box mt="3">
        <CreateTemplateButton />
      </Box>
    </Box>
  );
}

Screen.displayName = 'TemplateScreen';
