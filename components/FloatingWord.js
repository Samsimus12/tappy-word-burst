import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, Easing } from 'react-native';

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export default function FloatingWord({ word, tapped, correct, highlighted, onTap, bounds, speedMultiplier = 1 }) {
  const iX = useRef(Math.random() * Math.max(0, bounds.width - 130)).current;
  const iY = useRef(Math.random() * Math.max(0, bounds.height - 55)).current;
  const eX = useRef(Math.random() * Math.max(0, bounds.width - 130)).current;
  const eY = useRef(Math.random() * Math.max(0, bounds.height - 55)).current;
  const dur = useRef((3500 + Math.random() * 4000) / speedMultiplier).current;
  const delayMs = useRef(Math.random() * 1500).current;

  const x = useRef(new Animated.Value(iX)).current;
  const y = useRef(new Animated.Value(iY)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const bubbleOpacity = useRef(new Animated.Value(1)).current;
  const rayProgress = useRef(new Animated.Value(0)).current;

  // Stores actual bubble dimensions so rays can be centered on it
  const bubbleSizeRef = useRef({ width: 80, height: 37 });

  useEffect(() => {
    const easing = Easing.inOut(Easing.quad);
    const xAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: eX, duration: dur, delay: delayMs, easing, useNativeDriver: true }),
        Animated.timing(x, { toValue: iX, duration: dur, easing, useNativeDriver: true }),
      ])
    );
    const yAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: eY, duration: dur * 1.4, delay: delayMs, easing, useNativeDriver: true }),
        Animated.timing(y, { toValue: iY, duration: dur * 1.4, easing, useNativeDriver: true }),
      ])
    );
    xAnim.start();
    yAnim.start();
    return () => { xAnim.stop(); yAnim.stop(); };
  }, []);

  useEffect(() => {
    if (!tapped || !correct) return;
    const timeout = setTimeout(() => {
      Animated.parallel([

        Animated.sequence([
          Animated.timing(scale, { toValue: 1.45, duration: 110, useNativeDriver: true }),
          Animated.timing(bubbleOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]),
        Animated.timing(rayProgress, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 50);
    return () => clearTimeout(timeout);
  }, [tapped, correct]);

  useEffect(() => {
    if (!highlighted) { scale.setValue(1); return; }
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 300, useNativeDriver: true }),
      ]),
      { iterations: 3 }
    ).start(() => scale.setValue(1));
  }, [highlighted]);

  const rayTranslate = rayProgress.interpolate({ inputRange: [0, 1], outputRange: [0, -38] });
  const rayOpacity = rayProgress.interpolate({ inputRange: [0, 0.08, 0.7, 1], outputRange: [0, 1, 1, 0] });

  const bgColor = highlighted ? '#fbbf24' : tapped ? (correct ? '#16a34a' : '#dc2626') : '#3b3b8f';

  return (
    <Animated.View
      style={{ position: 'absolute', transform: [{ translateX: x }, { translateY: y }] }}
    >
      <Animated.View
        onLayout={e => { bubbleSizeRef.current = e.nativeEvent.layout; }}
        style={[styles.bubble, { backgroundColor: bgColor, opacity: bubbleOpacity, transform: [{ scale }] }]}
      >
        <TouchableOpacity onPress={onTap} disabled={tapped} activeOpacity={0.7}>
          <Text style={[styles.text, highlighted && styles.textHighlighted]}>{word}</Text>
        </TouchableOpacity>
      </Animated.View>

      {tapped && correct && RAY_ANGLES.map((angle, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: bubbleSizeRef.current.height / 2 - 6,
            left: bubbleSizeRef.current.width / 2 - 1.5,
            width: 3,
            height: 12,
            backgroundColor: '#ffffff',
            borderRadius: 2,
            opacity: rayOpacity,
            transform: [{ rotate: `${angle}deg` }, { translateY: rayTranslate }],
          }}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textHighlighted: {
    color: '#0f0f2e',
  },
});
