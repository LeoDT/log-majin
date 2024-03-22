import { Box, HStack, Text } from '@chakra-ui/react';

import { Log } from '../atoms/log';

interface Props {
  log: Log;
  name?: string;
  color?: string;
}

export function LogListItem({ log, name, color }: Props): JSX.Element {
  return (
    <Box
      display="flex"
      alignItems="center"
      h="full"
      w="full"
      px="2"
      py="1"
      borderBottom="1px"
      borderColor="gray.300"
    >
      <Box w="full">
        <Text>{log.content}</Text>

        <HStack mt="0.5">
          {name && color ? (
            <Text fontSize="sm" color={color}>
              {name}
            </Text>
          ) : null}
          <Text color="gray.400" fontSize="sm" ml="auto">
            {log.createAt.toLocaleString()}
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}
