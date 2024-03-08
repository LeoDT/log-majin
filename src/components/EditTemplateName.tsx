import {
  Button,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
} from '@chakra-ui/react';
import { useAtom } from 'jotai';

import { type TemplateAtom } from '../atoms/template';
import { colorsForTemplate } from '../colors';

import { AutoSizeInput } from './AutoSizeInput';

interface Props {
  templateAtom: TemplateAtom;
}

export function EditTemplateName({ templateAtom }: Props): JSX.Element {
  const [{ name, color }, setTemplate] = useAtom(templateAtom);

  return (
    <HStack display="inline-flex" gap="0">
      <Popover>
        <PopoverTrigger>
          <Button size="xs" mr="2" bgColor={color} />
        </PopoverTrigger>

        <PopoverContent maxW="100vw" w="auto">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <SimpleGrid columns={6} spacing={2}>
              {colorsForTemplate.map((c) => (
                <Button
                  key={c}
                  size="xs"
                  bgColor={c}
                  onClick={() => setTemplate({ color: c })}
                />
              ))}
            </SimpleGrid>
          </PopoverBody>
        </PopoverContent>
      </Popover>

      <AutoSizeInput
        maxW={['50vw', 'sm']}
        value={name}
        onChange={(e) => {
          setTemplate({ name: e.target.value });
        }}
      />
    </HStack>
  );
}
