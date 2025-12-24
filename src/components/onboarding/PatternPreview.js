import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const chartWidth = width - 48;
const chartHeight = 80;
const chartPadding = 20;

export const PatternPreview = ({ delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pathAnim = useRef(new Animated.Value(0)).current;
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;
  const circle3Anim = useRef(new Animated.Value(0)).current;
  const circle4Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in container
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: delay,
      useNativeDriver: true,
    }).start();

    // Animate path drawing
    Animated.timing(pathAnim, {
      toValue: 1,
      duration: 1500,
      delay: delay + 300,
      useNativeDriver: false,
    }).start();

    // Animate circles appearing
    Animated.sequence([
      Animated.delay(delay + 500),
      Animated.parallel([
        Animated.spring(circle1Anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.delay(200),
        Animated.spring(circle2Anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.delay(200),
        Animated.spring(circle3Anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.delay(200),
        Animated.spring(circle4Anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Sample data points (energy levels)
  const dataPoints = [
    { x: chartPadding, y: chartHeight - chartPadding - 20 }, // Day 1: energy 4
    { x: chartPadding + (chartWidth - chartPadding * 2) / 3, y: chartHeight - chartPadding - 35 }, // Day 2: energy 6
    { x: chartPadding + ((chartWidth - chartPadding * 2) / 3) * 2, y: chartHeight - chartPadding - 50 }, // Day 3: energy 8
    { x: chartWidth - chartPadding, y: chartHeight - chartPadding - 45 }, // Day 4: energy 7
  ];

  // Create smooth path through data points
  const path = `M ${dataPoints[0].x} ${dataPoints[0].y} 
                Q ${dataPoints[0].x + 30} ${dataPoints[0].y} ${dataPoints[1].x} ${dataPoints[1].y}
                T ${dataPoints[2].x} ${dataPoints[2].y}
                T ${dataPoints[3].x} ${dataPoints[3].y}`;

  // Animate path drawing
  const pathLength = 200; // Approximate path length
  const pathDashOffset = pathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [pathLength, 0],
  });

  const circle1Scale = circle1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const circle2Scale = circle2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const circle3Scale = circle3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const circle4Scale = circle4Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <Defs>
          {/* Energy gradient (green) */}
          <LinearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#34C759" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#34C759" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        <Path
          d={`M ${chartPadding} ${chartHeight - chartPadding} L ${chartWidth - chartPadding} ${chartHeight - chartPadding}`}
          stroke="#E5E5EA"
          strokeWidth="1"
          opacity={0.3}
        />
        <Path
          d={`M ${chartPadding} ${chartHeight - chartPadding - 30} L ${chartWidth - chartPadding} ${chartHeight - chartPadding - 30}`}
          stroke="#E5E5EA"
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity={0.2}
        />

        {/* Animated path */}
        <AnimatedPath
          d={path}
          stroke="url(#energyGradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray={pathLength}
          strokeDashoffset={pathDashOffset}
          strokeLinecap="round"
        />

        {/* Data point circles */}
        <AnimatedCircle
          cx={dataPoints[0].x}
          cy={dataPoints[0].y}
          r="5"
          fill="#34C759"
          opacity={circle1Anim}
          style={{ transform: [{ scale: circle1Scale }] }}
        />
        <AnimatedCircle
          cx={dataPoints[1].x}
          cy={dataPoints[1].y}
          r="5"
          fill="#34C759"
          opacity={circle2Anim}
          style={{ transform: [{ scale: circle2Scale }] }}
        />
        <AnimatedCircle
          cx={dataPoints[2].x}
          cy={dataPoints[2].y}
          r="5"
          fill="#34C759"
          opacity={circle3Anim}
          style={{ transform: [{ scale: circle3Scale }] }}
        />
        <AnimatedCircle
          cx={dataPoints[3].x}
          cy={dataPoints[3].y}
          r="5"
          fill="#34C759"
          opacity={circle4Anim}
          style={{ transform: [{ scale: circle4Scale }] }}
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
    paddingVertical: 12,
  },
});

