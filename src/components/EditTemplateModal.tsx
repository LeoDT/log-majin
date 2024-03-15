import {
  Box,
  Button,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Portal,
  VStack,
} from '@chakra-ui/react';
import { useAtom } from 'jotai/react';
import { splitAtom } from 'jotai/utils';
import { focusAtom } from 'jotai-optics';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LuMoreHorizontal } from 'react-icons/lu';
import { useMemoOne } from 'use-memo-one';

import {
  SlotType,
  type TemplateAtom,
  getSlotDefaults,
} from '../atoms/template';

import { DraggableList } from './DraggableList';
import { EditTemplateName } from './EditTemplateName';
import { SlotEditor } from './SlotEditor';

interface Props extends Omit<ModalProps, 'children'> {
  templateAtom: TemplateAtom;
}

const allSlotTypes = [
  SlotType.Text,
  SlotType.TextInput,
  SlotType.Number,
  SlotType.Select,
];

export function EditTemplateModal({
  templateAtom,
  onClose,
  ...modalProps
}: Props): JSX.Element {
  const { t } = useTranslation();
  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);
  const getScrollBounds = useCallback(() => {
    if (scrollWrapperRef.current) {
      const rect = scrollWrapperRef.current.getBoundingClientRect();

      return {
        top: rect.top,
        bottom: rect.bottom,
        scrollTop: scrollWrapperRef.current.scrollTop,
      };
    }

    return { top: 0, bottom: Infinity, scrollTop: 0 };
  }, []);
  const handleScroll = useCallback((dir: 1 | -1) => {
    scrollWrapperRef.current?.scrollBy(0, dir * 3);
  }, []);

  const slotsAtom = useMemoOne(() => {
    const a = focusAtom(templateAtom, (o) => o.prop('slots'));

    if (import.meta.env.DEV) {
      a.debugLabel = `${templateAtom.debugLabel}.slots`;
    }

    return a;
  }, [templateAtom]);
  const splittedSlotsAtomAtom = useMemoOne(() => {
    const a = splitAtom(slotsAtom, (s) => s.id);
    a.debugPrivate = true;

    return a;
  }, [slotsAtom]);
  const [slotAtoms, slotAtomsDispatch] = useAtom(splittedSlotsAtomAtom);

  if (import.meta.env.DEV) {
    slotAtoms.forEach((a, i) => {
      a.debugLabel = `${templateAtom.debugLabel}.slot.${i}`;
    });
  }

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
        <ModalHeader p="2" display="flex" shadow="base">
          <Box flexBasis="min-content" display="flex">
            <EditTemplateName templateAtom={templateAtom} />
          </Box>

          <Button
            ml="auto"
            variant="link"
            colorScheme="blue"
            onClick={() => {
              onClose();
            }}
          >
            {t('done')}
          </Button>
        </ModalHeader>
        <ModalBody
          bgColor="gray.100"
          px="2"
          pos="relative"
          ref={scrollWrapperRef}
        >
          <Box w={['full', '50%']} mx="auto">
            <DraggableList
              items={slotAtoms}
              keyExtractor={(a) => a.toString()}
              renderItem={(a) => (
                <Box
                  bg="white"
                  px="2"
                  py="1"
                  borderRadius="4"
                  shadow="base"
                  pos="relative"
                >
                  <SlotEditor slotAtom={a} />
                  <Menu boundary="scrollParent">
                    <MenuButton
                      as={IconButton}
                      aria-label="Delete Slot"
                      pos="absolute"
                      right="1"
                      bottom="0"
                      size="xs"
                      variant="link"
                      icon={<Icon as={LuMoreHorizontal} boxSize="4" />}
                    />
                    <Portal>
                      <MenuList zIndex="popover">
                        <MenuItem
                          onClick={() => {
                            slotAtomsDispatch({ type: 'remove', atom: a });
                          }}
                        >
                          Delelte
                        </MenuItem>
                      </MenuList>
                    </Portal>
                  </Menu>
                </Box>
              )}
              onDragEnd={(_items, atom, before) => {
                slotAtomsDispatch({ type: 'move', atom, before });
              }}
              getScrollBounds={getScrollBounds}
              onScroll={handleScroll}
            />
          </Box>
          <Box mx="auto" w={['full', '50%']} py="2">
            <Heading as="h3" size="sm" color="blackAlpha.500" mb="2">
              {t('createSlot')}
            </Heading>
            <VStack
              flexDir="column"
              justifyContent="stretch"
              alignItems="stretch"
            >
              {allSlotTypes.map((st) => (
                <Button
                  key={st}
                  size="sm"
                  variant="outline"
                  colorScheme="blackAlpha"
                  onClick={() => {
                    slotAtomsDispatch({
                      type: 'insert',
                      value: getSlotDefaults(st),
                    });
                  }}
                >
                  {t(`slotType.${st}`)}
                </Button>
              ))}
            </VStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
