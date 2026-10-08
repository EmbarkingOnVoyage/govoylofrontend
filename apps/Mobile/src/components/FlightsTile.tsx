import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop, SvgXml } from 'react-native-svg';
import { FLIGHTS_TILE as T } from './flightsTileShapes';
import { STAR_SVG } from './figmaIcons';

// Loop from the Figma home prototype: the clouds rest, a plane comes in small
// from the top-right and grows as it flies down to the left, the clouds slide
// out to the left behind it, the tile sits empty for a beat, then the clouds
// come back.
const REST_MS = 2500;
const FLY_MS = 2000;
const EMPTY_MS = 800;
const RETURN_MS = 400;

// Plane start, relative to its resting place (bbox x -140..0, y 69.5..81).
const PLANE_START_X = 470;
const PLANE_START_Y = -66;
const PLANE_START_SCALE = 0.4;
const CLOUDS_OUT_X = -330;

interface FlightsTileProps {
  onPress: () => void;
}

export const FlightsTile: React.FC<FlightsTileProps> = ({ onPress }) => {
  const plane = useRef(new Animated.Value(0)).current;
  const cloudsX = useRef(new Animated.Value(0)).current;
  const cloudsOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(REST_MS),
        Animated.parallel([
          Animated.timing(plane, {
            toValue: 1,
            duration: FLY_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(FLY_MS * 0.4),
            Animated.timing(cloudsX, {
              toValue: CLOUDS_OUT_X,
              duration: FLY_MS * 0.6,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.delay(EMPTY_MS),
        // Reset off screen, then bring the clouds back at their resting place.
        Animated.parallel([
          Animated.timing(plane, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(cloudsOpacity, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(cloudsX, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        Animated.timing(cloudsOpacity, { toValue: 1, duration: RETURN_MS, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [plane, cloudsX, cloudsOpacity]);

  const planeTranslateX = plane.interpolate({ inputRange: [0, 1], outputRange: [PLANE_START_X, 0] });
  const planeTranslateY = plane.interpolate({ inputRange: [0, 1], outputRange: [PLANE_START_Y, 0] });
  const planeScale = plane.interpolate({ inputRange: [0, 1], outputRange: [PLANE_START_SCALE, 1] });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.shadow}>
      <View style={styles.tile}>
        <Svg width="100%" height={T.height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={T.gradient[0]} />
              <Stop offset="1" stopColor={T.gradient[1]} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height={T.height} fill="url(#bg)" />
        </Svg>

        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { opacity: cloudsOpacity, transform: [{ translateX: cloudsX }] }]}
        >
          <Svg width={T.width} height={T.height}>
            <Defs>
              <LinearGradient id="cloud1" x1="0" y1="49" x2="0" y2="138" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#C9F2FF" stopOpacity={0.3} />
                <Stop offset="1" stopColor="#69DBFF" />
              </LinearGradient>
              <LinearGradient id="cloud2" x1="0" y1="59" x2="0" y2="148" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#C9F2FF" stopOpacity={0.3} />
                <Stop offset="1" stopColor="#69DBFF" />
              </LinearGradient>
            </Defs>
            <Path d={T.cloudBack} fill="url(#cloud1)" />
            <Path d={T.cloudFront} fill="url(#cloud2)" />
          </Svg>
        </Animated.View>

        {/* The plane's resting box is x -140..0 / y 69.5..81.2; this view sits
            there so scaling happens around the plane itself. */}
        <Animated.View pointerEvents="none" style={[
            styles.plane,
            { transform: [{ translateX: planeTranslateX }, { translateY: planeTranslateY }, { scale: planeScale }] },
          ]}>
          <Svg width={141} height={12} viewBox="-140.2 69.5 141 12">
            <Path d={T.plane} fill="#BAC7D5" opacity={0.4} />
            <Path d={T.planeShade} fill="#BAC7D5" opacity={0.4 * 0.57} />
          </Svg>
        </Animated.View>

        <Text style={styles.label}>Flights</Text>
        <SvgXml xml={STAR_SVG} width={4.76} height={4.52} style={styles.star1} />
        <SvgXml xml={STAR_SVG} width={7.61} height={7.24} style={styles.star2} />
        <SvgXml xml={STAR_SVG} width={7.61} height={7.24} style={styles.star3} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 8,
    shadowColor: '#973DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  tile: {
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plane: {
    position: 'absolute',
    left: -140.2,
    top: 69.5,
    width: 141,
    height: 12,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  star1: { position: 'absolute', top: 3, right: 53.1 },
  star2: { position: 'absolute', top: 8, right: 17.2 },
  star3: { position: 'absolute', top: 28, right: 36.2 },
});
