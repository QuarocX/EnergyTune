import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const AnimatedWaves = ({ height = 200 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Continuous wave animations with different speeds (faster)
    Animated.loop(
      Animated.sequence([
        Animated.timing(wave1Anim, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(wave1Anim, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(wave2Anim, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(wave2Anim, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(wave3Anim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(wave3Anim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Interpolate wave animations for subtle movement
  const wave1Translate = wave1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5],
  });

  const wave2Translate = wave2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const wave3Translate = wave3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          {/* Orange gradient */}
          <LinearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FF9500" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#FF9500" stopOpacity="0.1" />
          </LinearGradient>
          
          {/* Blue gradient */}
          <LinearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0A84FF" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#0A84FF" stopOpacity="0.15" />
          </LinearGradient>
          
          {/* Light blue gradient */}
          <LinearGradient id="lightBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0A84FF" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#0A84FF" stopOpacity="0.08" />
          </LinearGradient>
        </Defs>

        {/* Wave 1 - Orange */}
        <AnimatedPath
          d={`M 0 ${height * 0.3} Q ${width * 0.25} ${height * 0.25} ${width * 0.5} ${height * 0.3} T ${width} ${height * 0.3} L ${width} ${height} L 0 ${height} Z`}
          fill="url(#orangeGradient)"
          style={{
            transform: [{ translateY: wave1Translate }],
          }}
        />

        {/* Wave 2 - Blue */}
        <AnimatedPath
          d={`M 0 ${height * 0.5} Q ${width * 0.25} ${height * 0.45} ${width * 0.5} ${height * 0.5} T ${width} ${height * 0.5} L ${width} ${height} L 0 ${height} Z`}
          fill="url(#blueGradient)"
          style={{
            transform: [{ translateY: wave2Translate }],
          }}
        />

        {/* Wave 3 - Light Blue */}
        <AnimatedPath
          d={`M 0 ${height * 0.7} Q ${width * 0.25} ${height * 0.65} ${width * 0.5} ${height * 0.7} T ${width} ${height * 0.7} L ${width} ${height} L 0 ${height} Z`}
          fill="url(#lightBlueGradient)"
          style={{
            transform: [{ translateY: wave3Translate }],
          }}
        />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

