import { StyleSheet, Text, TextInput } from 'react-native';

// The Figma design (Product → Phone Dev) is set in Inter throughout. Inter is
// bundled as one file per weight (assets/fonts, SIL OFL), and every Text /
// TextInput is pointed at the file matching its own fontWeight, so screens keep
// using fontWeight as usual and pick up Inter without per-screen changes.
export const INTER_FONTS = {
  'Inter-Regular': require('../../assets/fonts/Inter-Regular.ttf'),
  'Inter-Medium': require('../../assets/fonts/Inter-Medium.ttf'),
  'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.ttf'),
  'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
};

const FAMILY_BY_WEIGHT: Record<string, keyof typeof INTER_FONTS> = {
  '100': 'Inter-Regular',
  '200': 'Inter-Regular',
  '300': 'Inter-Regular',
  '400': 'Inter-Regular',
  normal: 'Inter-Regular',
  '500': 'Inter-Medium',
  '600': 'Inter-SemiBold',
  '700': 'Inter-Bold',
  '800': 'Inter-Bold',
  '900': 'Inter-Bold',
  bold: 'Inter-Bold',
};

function withInter(style: unknown) {
  const flat = (StyleSheet.flatten(style as never) ?? {}) as { fontFamily?: string; fontWeight?: string | number };
  // Anything that picks its own font (e.g. an icon font) is left alone.
  if (flat.fontFamily) return style;
  const family = FAMILY_BY_WEIGHT[String(flat.fontWeight ?? '400')] ?? 'Inter-Regular';
  // The weight is in the file itself; a leftover fontWeight would make Android
  // synthesise bold on top of it.
  return [style, { fontFamily: family, fontWeight: 'normal' as const }];
}

function patch(component: unknown) {
  const target = component as { render?: (props: { style?: unknown }, ref: unknown) => unknown; __interPatched?: boolean };
  if (!target.render || target.__interPatched) return;
  const original = target.render;
  target.render = function render(props, ref) {
    return original.call(this, { ...props, style: withInter(props.style) }, ref);
  };
  target.__interPatched = true;
}

export function applyInterFont() {
  patch(Text);
  patch(TextInput);
}
