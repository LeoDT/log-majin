import { Box, SimpleGrid } from '@chakra-ui/react';
import { range } from 'lodash-es';

import { ScreenId, useScreenShownEffect } from '../atoms/ui';

import { CreateTemplateButton } from './CreateTemplateButton';

export const id: ScreenId = 'template';
export const name = 'createTab';

export function Screen(): JSX.Element {
  useScreenShownEffect(
    id,
    () => {
      console.log('template tab');
    },
    [],
  );

  return (
    <Box px="4" pb="2">
      <SimpleGrid columns={2} spacing={4}>
        {range(1, 10).map((i) => (
          <Box key={i} bgColor={`red.${i}00`} borderRadius="md" h="24" />
        ))}
        {range(1, 10).map((i) => (
          <Box key={i} bgColor={`blue.${i}00`} borderRadius="md" h="24" />
        ))}
      </SimpleGrid>

      <Box mt="4">
        <CreateTemplateButton />
      </Box>
    </Box>
  );
}

Screen.displayName = 'TemplateScreen';
