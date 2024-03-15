import {
  Box,
  Button,
  Heading,
  Text,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  HStack,
  Stack,
  VStack,
} from '@chakra-ui/react';
import { atom, useAtomValue } from 'jotai';
import { splitAtom, useAtomCallback } from 'jotai/utils';
import { clamp } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMemoOne } from 'use-memo-one';

import { commitLogAtom, SlotValue } from '../atoms/log';
import { SlotType, TemplateAtom, needInputSlotTypes } from '../atoms/template';
import { useThemeBasedTemplateColor } from '../utils/template';

import { CreateLogModalConfirmButton } from './CreateLogModalConfirmButton';
import { SlotValueEditor } from './SlotValueEditor';
import { SlotValuePlaceholder } from './SlotValuePlaceholder';

interface Props extends Omit<ModalProps, 'children'> {
  templateAtom: TemplateAtom;
}

export function CreateLogModal({
  templateAtom,
  onClose,
  ...modalProps
}: Props): JSX.Element {
  const { t } = useTranslation();
  const template = useAtomValue(templateAtom);
  const templateColors = useThemeBasedTemplateColor(template.color);
  const slotValuesAtom = useMemoOne(() => {
    const base = atom<SlotValue[]>(
      template.slots.map((s) => {
        return {
          slotId: s.id,
          value: s.kind === SlotType.Text ? s.name : '',
        };
      }),
    );

    if (import.meta.env.DEV) {
      base.debugPrivate = true;
    }

    return base;
  }, [template]);
  const slotValueAtomsAtom = useMemoOne(() => {
    const a = splitAtom(slotValuesAtom);

    if (import.meta.env.DEV) {
      a.debugLabel = 'createLogSlotValues';
    }

    return a;
  }, [slotValuesAtom]);
  const slotValueAtoms = useAtomValue(slotValueAtomsAtom);

  const needInputSlotIndexes = useMemo(() => {
    const indexes: number[] = [];

    template.slots.forEach((s, i) => {
      if (needInputSlotTypes.includes(s.kind)) {
        indexes.push(i);
      }
    });

    return indexes;
  }, [template]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(
    () => needInputSlotIndexes[0],
  );
  const activeSlot = useMemo(
    () => template.slots[activeSlotIndex],
    [template, activeSlotIndex],
  );

  const handleCommitLog = useAtomCallback(
    useCallback(
      async (get, set) => {
        const slotValues = get(slotValuesAtom);

        await set(commitLogAtom, { slotValues, templateAtom });

        onClose();
      },
      [onClose, slotValuesAtom, templateAtom],
    ),
  );

  return (
    <Modal
      size={['full', 'xl']}
      scrollBehavior="inside"
      motionPreset="slideInBottom"
      onClose={onClose}
      {...modalProps}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader p="2" display="flex">
          <Button
            variant="link"
            colorScheme="blue"
            onClick={() => {
              onClose();
            }}
            mr="1"
            flexShrink={0}
          >
            {t('cancel')}
          </Button>

          <Heading
            as="h3"
            fontSize="lg"
            mx="auto"
            flexGrow={1}
            textAlign="center"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
          >
            {template.name}
          </Heading>

          <CreateLogModalConfirmButton
            slotValuesAtom={slotValuesAtom}
            onConfirm={handleCommitLog}
          />
        </ModalHeader>
        <ModalBody
          p="0"
          pos="relative"
          display="flex"
          alignItems="stretch"
          flexDir="column"
          overflow="hidden"
        >
          <Stack
            h="full"
            flexGrow={1}
            spacing={0}
            direction={['column', 'row']}
          >
            <Box
              w={['auto', '50%']}
              flexShrink={0}
              flexGrow={[0, 1]}
              bgColor="gray.100"
              borderBottomLeftRadius="md"
              shadow="inner"
              p="2"
            >
              <Text lineHeight="2.4em">
                {template.slots.map((s, i) => {
                  if (s.kind === SlotType.Text) {
                    return (
                      <Text as="span" mx="1" key={s.id} verticalAlign="middle">
                        {s.name}
                      </Text>
                    );
                  }

                  return (
                    <SlotValuePlaceholder
                      key={s.id}
                      slot={s}
                      active={activeSlotIndex === i}
                      slotValueAtom={slotValueAtoms[i]}
                      onActivate={() => setActiveSlotIndex(i)}
                      colors={templateColors}
                    />
                  );
                })}
              </Text>
            </Box>

            <VStack
              flexShrink={0}
              flexGrow={1}
              w={['auto', '50%']}
              minH={['inherit', '96']}
              alignItems="stretch"
            >
              <HStack m="2" alignItems="flex-start" flexGrow={0} flexShrink={0}>
                <Text as="h4">
                  <Text as="span" fontWeight="bold" fontSize="lg">
                    {activeSlot.name}
                  </Text>
                  <Text as="small" fontSize="xs" color="gray.400" ml="2">
                    {t(`slotType.${activeSlot.kind}`)}
                  </Text>
                </Text>

                <Button
                  variant="link"
                  ml="auto"
                  colorScheme="blue"
                  isDisabled={activeSlotIndex === needInputSlotIndexes[0]}
                  onClick={() => {
                    setActiveSlotIndex((ai) => {
                      const i = clamp(
                        needInputSlotIndexes.indexOf(ai) - 1,
                        0,
                        needInputSlotIndexes.length - 1,
                      );

                      return needInputSlotIndexes[i];
                    });
                  }}
                >
                  {t('prev')}
                </Button>
                <Button
                  variant="link"
                  colorScheme="blue"
                  isDisabled={
                    activeSlotIndex ===
                    needInputSlotIndexes[needInputSlotIndexes.length - 1]
                  }
                  onClick={() => {
                    setActiveSlotIndex((ai) => {
                      const i = clamp(
                        needInputSlotIndexes.indexOf(ai) + 1,
                        0,
                        needInputSlotIndexes.length - 1,
                      );

                      return needInputSlotIndexes[i];
                    });
                  }}
                >
                  {t('next')}
                </Button>
              </HStack>

              <Box flexGrow={1} flexShrink={1} flexBasis={0} overflow="auto">
                <SlotValueEditor
                  slotValueAtom={slotValueAtoms[activeSlotIndex]}
                  slot={activeSlot}
                />
              </Box>
            </VStack>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
