import {
  Button,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

import { type TemplateAtom } from '../atoms/template';
import { colorsForTemplate } from '../colors';

import { AutoSizeInput } from './AutoSizeInput';

interface Props {
  templateAtom: TemplateAtom;
}

export function EditTemplateName({ templateAtom }: Props): JSX.Element {
  const { t } = useTranslation();
  const [{ name, color }, setTemplate] = useAtom(templateAtom);

  return (
    <HStack display="inline-flex" gap="0">
      <Popover placement="bottom-start">
        <PopoverTrigger>
          <Button
            size="xs"
            mr="2"
            bgColor={color}
            _hover={{ bgColor: color, opacity: 0.8 }}
          />
        </PopoverTrigger>

        <PopoverContent maxW="100vw" w="auto">
          <PopoverArrow />
          <PopoverBody>
            <SimpleGrid columns={6} spacing={2}>
              {colorsForTemplate.map((c) => (
                <Button
                  key={c}
                  size="xs"
                  bgColor={c}
                  _hover={{ bgColor: c, opacity: 0.8 }}
                  onClick={() => setTemplate({ color: c })}
                />
              ))}
            </SimpleGrid>
          </PopoverBody>
        </PopoverContent>
      </Popover>

      <AutoSizeInput
        maxW={['60vw', 'sm']}
        fontSize={['md', 'lg']}
        value={name}
        placeholder={t('template.defaultName')}
        onChange={(e) => {
          setTemplate({ name: e.target.value });
        }}
      />
    </HStack>
  );
}
