import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
  onFinish: () => void;
}

// Southern Cross star positions
const STARS = [
  { top: 0.38, left: 0.52, size: 18, delay: 600 },  // Alpha
  { top: 0.28, left: 0.38, size: 16, delay: 700 },  // Beta
  { top: 0.20, left: 0.52, size: 18, delay: 800 },  // Gamma
  { top: 0.30, left: 0.64, size: 14, delay: 900 },  // Delta
  { top: 0.36, left: 0.57, size: 10, delay: 1000 }, // Epsilon
];

const Star = ({ top, left, size, delay, parentAnim }: any) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.Text
      style={[
        styles.star,
        {
          top: height * top,
          left: width * left,
          fontSize: size,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      ✦
    </Animated.Text>
  );
};

export default function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  // Compass
  const compassScale = useRef(new Animated.Value(0)).current;
  const compassOpacity = useRef(new Animated.Value(0)).current;
  const compassRotate = useRef(new Animated.Value(0)).current;

  // Title
  const titleTranslate = useRef(new Animated.Value(40)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  // Subtitle
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslate = useRef(new Animated.Value(20)).current;

  // Badge
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0.8)).current;

  // Gold line
  const lineWidth = useRef(new Animated.Value(0)).current;

  // Overall fade out
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Compass spins in
    Animated.sequence([
      Animated.parallel([
        Animated.spring(compassScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.timing(compassOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(compassRotate, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      // 2. Title slides up
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(titleTranslate, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
      ]),
      // 3. Gold line expands
      Animated.timing(lineWidth, { toValue: 1, duration: 500, useNativeDriver: false }),
      // 4. Subtitle
      Animated.parallel([
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(subtitleTranslate, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
      ]),
      // 5. Badge
      Animated.parallel([
        Animated.timing(badgeOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(badgeScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      ]),
      // 6. Hold for a moment
      Animated.delay(600),
      // 7. Fade out
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  const spin = compassRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-30deg', '0deg'],
  });

  const lineInterpolated = lineWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 140],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000C2D" />

      {/* Background gradient effect */}
      <View style={styles.bgGlow} />

      {/* Southern Cross stars */}
      {STARS.map((star, i) => (
        <Star key={i} {...star} />
      ))}

      {/* Compass icon */}
      <Animated.Text
        style={[
          styles.compass,
          {
            opacity: compassOpacity,
            transform: [{ scale: compassScale }, { rotate: spin }],
          },
        ]}
      >
        🧭
      </Animated.Text>

      {/* ACE Title */}
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslate }],
          },
        ]}
      >
        ACE
      </Animated.Text>

      {/* Gold divider line */}
      <View style={styles.dividerRow}>
        <Animated.View style={[styles.goldLine, { width: lineInterpolated }]} />
        <Text style={styles.goldStar}>★</Text>
        <Animated.View style={[styles.goldLine, { width: lineInterpolated }]} />
      </View>

      {/* Subtitle */}
      <Animated.Text
        style={[
          styles.subtitle,
          {
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleTranslate }],
          },
        ]}
      >
        AU Citizenship Exam
      </Animated.Text>

      {/* Badge */}
      <Animated.View
        style={[
          styles.badge,
          {
            opacity: badgeOpacity,
            transform: [{ scale: badgeScale }],
          },
        ]}
      >
        <Text style={styles.badgeText}>🦘 Official Study Guide</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000C2D',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  bgGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(0, 43, 127, 0.4)',
    top: '50%',
    left: '50%',
    marginTop: -200,
    marginLeft: -200,
  },
  star: {
    position: 'absolute',
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  compass: {
    fontSize: 100,
    marginBottom: 24,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  title: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 12,
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  goldLine: {
    height: 1.5,
    backgroundColor: '#FFD700',
    opacity: 0.7,
  },
  goldStar: {
    color: '#FFD700',
    fontSize: 16,
    marginHorizontal: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 40,
  },
  badge: {
    backgroundColor: 'rgba(0, 132, 61, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(0, 132, 61, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
});
