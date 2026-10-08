import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// A full-screen <Modal> opens its own window, so it needs its own provider to read
// that window's insets; without it, footers slide under the Android navigation bar.
export function ModalSafeArea({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={style}>{children}</SafeAreaView>
    </SafeAreaProvider>
  );
}
