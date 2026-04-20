import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, Easing } from 'react-native';

export default function FloatingWord({ word, tapped, correct, onTap, bounds, speedMultiplier = 1 }) {
  const iX = useRef(Math.random() * Math.max(0, bounds.width - 130)).current;
  const iY = useRef(Math.random() * Math.max(0, bounds.height - 55)).current;
  const eX = useRef(Math.random() * Math.max(0, bounds.width - 130)).current;
  const eY = useRef(Math.random() * Math.max(0, bounds.height - 55)).current;
  const dur = useRef((3500 + Math.random() * 4000) / speedMultiplier).current;
  const delayMs = useRef(Math.random() * 1500).current;

  const x = useRef(new Animated.Value(iX)).current;
  const y = useRef(new Animated.Value(iY)).current;

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
    return () => {
      xAnim.stop();
      yAnim.stop();
    };
  }, []);

  const bgColor = tapped ? (correct ? '#16a34a' : '#dc2626') : '#3b3b8f';

  return (
    <Animated.View
      style={[
        styles.bubble,
        { backgroundColor: bgColor },
        { transform: [{ translateX: x }, { translateY: y }] },
      ]}
    >
      <TouchableOpacity onPress={onTap} disabled={tapped} activeOpacity={0.7}>
        <Text style={styles.text}>{word}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
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
});
