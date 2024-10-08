import { Box, Input, InputProps } from '@chakra-ui/react';
import { useCallback, useEffect, useRef } from 'react';

export function AutoSizeInput({
  value,
  maxW,
  fontSize,
  placeholder,
  ...props
}: InputProps): JSX.Element {
  const sizerRef = useRef<HTMLDivElement | null>(null);
  const updateSizer = useCallback(() => {
    if (sizerRef.current) {
      sizerRef.current.dataset.value = value ? value.toString() : placeholder;
    }
  }, [value, placeholder]);

  useEffect(() => {
    updateSizer();
  }, [updateSizer]);

  return (
    <Box
      ref={sizerRef}
      display="inline-grid"
      pos="relative"
      overflow="hidden"
      _after={{
        content: 'attr(data-value) " "',
        gridArea: '1 / 1',
        visibility: 'hidden',
        whiteSpace: 'pre',
        width: 'auto',
        px: 0,
        py: 0,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize,
      }}
      maxW={maxW}
    >
      <Input
        w="auto"
        minW="1em"
        px="0"
        py="0"
        gridArea="1 / 1"
        variant="unstyled"
        fontFamily="sans-serif"
        fontWeight="bold"
        value={value ?? placeholder}
        placeholder={placeholder}
        maxW={maxW}
        fontSize={fontSize}
        {...props}
      />
    </Box>
  );
}
