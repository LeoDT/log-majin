import { useToken } from '@chakra-ui/react';
import chroma from 'chroma-js';

export interface TemplateColors {
  bg: string;
  bgAlt: string;
  bgGradient: string;
  fg: string;
  fgAlt: string;
  buttonColorScheme: 'whiteAlpha' | 'blackAlpha';
}

export function makeTemplateColor(base: string): TemplateColors {
  const c = chroma(base);
  const brightness = c.luminance();
  const bgAlt = brightness <= 0.5 ? c.brighten(0.6) : c.darken(0.6);

  return {
    bg: base,
    bgAlt: bgAlt.css(),
    bgGradient: `linear(${brightness <= 0.5 ? 'to-t' : 'to-b'}, ${c.alpha(
      0.4,
    )}, ${bgAlt.alpha(0.8)})`,
    fg: 'white',
    fgAlt: 'rgba(255,255,255,0.8)',
    buttonColorScheme: brightness <= 0.5 ? 'whiteAlpha' : 'blackAlpha',
  };
}

export function useThemeBasedTemplateColor(themeBasedColor: string) {
  const base = useToken('colors', themeBasedColor);

  return makeTemplateColor(base);
}
