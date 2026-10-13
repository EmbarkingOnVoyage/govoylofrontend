import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import ringConicSrc from '../assets/images/ring-conic.png';

const ringConic = ringConicSrc as unknown as number;

// The animated pill border from Figma "Phone Dev" → "Privacy and data
// management", spun like the web search page's tab ring (apps/Web/src/
// global.css, .tab-active-ring): a conic gradient behind a white pill inset
// 3px, so only a thin ring shows. The colours (periwinkle #8279FF through
// lavender to a pale gold #F0DFAE highlight) are sampled from the Figma frame.
// React Native has no conic gradient, so it is a pre-rendered square image
// rotated inside a pill-shaped clip, sized to the pill's diagonal so it covers
// the pill at every angle.
const RING = 3;
const SPIN_MS = 3000;

interface GlowPillProps {
  width?: number;
  height: number;
  style?: ViewStyle;
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}

export const GlowPill: React.FC<GlowPillProps> = ({ width, height, style, onPress, accessibilityLabel, children }) => {
  const spin = useRef(new Animated.Value(0)).current;
  const [measuredWidth, setMeasuredWidth] = React.useState(width ?? 0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: SPIN_MS, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const pillWidth = width ?? measuredWidth;
  const side = Math.ceil(Math.hypot(pillWidth, height)) + 2;
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onLayout={width ? undefined : (e) => setMeasuredWidth(e.nativeEvent.layout.width)}
      style={[styles.ring, { height, borderRadius: height / 2 }, width ? { width } : null, style]}
    >
      {pillWidth > 0 && (
        <Animated.Image
          source={ringConic}
          style={{
            position: 'absolute',
            width: side,
            height: side,
            left: (pillWidth - side) / 2,
            top: (height - side) / 2,
            transform: [{ rotate }],
          }}
        />
      )}
      <View style={[styles.inner, { borderRadius: (height - RING * 2) / 2 }]}>{children}</View>
    </TouchableOpacity>
  );
};

export const PillIcon: React.FC<{ source: number; style?: ViewStyle }> = ({ source, style }) => (
  <Image source={source} style={[styles.icon, style as object]} />
);

const styles = StyleSheet.create({
  ring: {
    overflow: 'hidden',
    backgroundColor: '#8279FF',
  },
  inner: {
    position: 'absolute',
    top: RING,
    left: RING,
    right: RING,
    bottom: RING,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 52.02,
    height: 52.02,
    borderRadius: 26.01,
  },
});
