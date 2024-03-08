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
  Portal,
  VStack,
} from '@chakra-ui/react';
import { type PrimitiveAtom, atom, useAtom } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { without } from 'lodash-es';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LuMoreHorizontal } from 'react-icons/lu';
import { useMemoOne } from 'use-memo-one';

import {
  SlotType,
  type Slot,
  type TemplateAtom,
  getSlotDefaults,
} from '../atoms/template';

import { DraggableList } from './DraggableList';
import { EditTemplateName } from './EditTemplateName';
import { SlotEditor } from './SlotEditor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
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
  isOpen,
  onClose,
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

  // can use useState, prevent HMR break useMemo
  const slotAtomsAtom = useMemoOne(() => {
    const a = atom<PrimitiveAtom<Slot>[]>([]);

    if (import.meta.env.DEV) {
      a.debugLabel = `slotsAtom`;
    }

    return a;
  }, []);
  const makeSlotAtomsAtom = useAtomCallback(
    useCallback(
      (get, set) => {
        const { slots } = get(templateAtom);

        set(
          slotAtomsAtom,
          slots.map((s) => {
            const a = atom(s);

            if (import.meta.env.DEV) {
              a.debugLabel = `slotAtom(${s.id})`;
            }

            return a;
          }),
        );
      },
      [slotAtomsAtom, templateAtom],
    ),
  );
  const [slotAtoms, setSlotAtoms] = useAtom(slotAtomsAtom);

  const create = useAtomCallback(
    useCallback(
      (get, set) => {
        const slots = get(slotAtomsAtom).map((a) => get(a));

        set(templateAtom, { slots });
      },
      [templateAtom, slotAtomsAtom],
    ),
  );

  useEffect(() => {
    makeSlotAtomsAtom();
  }, [makeSlotAtomsAtom]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={['full', 'xl']}
      scrollBehavior="inside"
      motionPreset="slideInBottom"
    >
      <ModalOverlay onPointerDown={(e) => e.stopPropagation()} />
      <ModalContent
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <ModalHeader p="2" fontSize="md" display="flex" shadow="base">
          <Button
            variant="link"
            fontSize="sm"
            colorScheme="blue"
            onClick={onClose}
          >
            {t('cancel')}
          </Button>

          <Box
            mx="auto"
            flexBasis="min-content"
            display="flex"
            alignItems="center"
          >
            <EditTemplateName templateAtom={templateAtom} />
          </Box>

          <Button
            variant="link"
            fontSize="sm"
            colorScheme="blue"
            onClick={() => {
              create();
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
                            setSlotAtoms(without(slotAtoms, a));
                          }}
                        >
                          Delelte
                        </MenuItem>
                      </MenuList>
                    </Portal>
                  </Menu>
                </Box>
              )}
              onDragEnd={(items) => {
                setSlotAtoms(items);
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
                    const s = getSlotDefaults(st);
                    const a = atom(s);

                    if (import.meta.env.DEV) {
                      a.debugLabel = `slotAtom(${s.id})`;
                    }

                    setSlotAtoms([...slotAtoms, a]);
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
