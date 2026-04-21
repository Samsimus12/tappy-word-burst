import React, { useEffect, useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated, Easing } from 'react-native';

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function FloatingWord({ wordId, word, tapped, correct, highlighted, onTap, bounds, speedMultiplier = 1, bubbleColor = '#3b3b8f' }) {
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
  const wrongShakeX = useRef(new Animated.Value(0)).current;
  const wrongFallY = useRef(new Animated.Value(0)).current;

  const crumbleDir = useRef(Math.random() > 0.5 ? 1 : -1).current;
  const wrongRotate = wrongFallY.interpolate({
    inputRange: [0, 40],
    outputRange: ['0deg', `${crumbleDir * 22}deg`],
  });

  const bubbleSizeRef = useRef({ width: 80, height: 37 });
  const xAnimRef = useRef(null);
  const yAnimRef = useRef(null);

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
    xAnimRef.current = xAnim;
    yAnimRef.current = yAnim;
    xAnim.start();
    yAnim.start();
    return () => { xAnim.stop(); yAnim.stop(); };
  }, []);

  // Correct tap: pop + rays
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

  // Wrong tap: shake then crumble and fall
  useEffect(() => {
    if (!tapped || correct) return;
    xAnimRef.current?.stop();
    yAnimRef.current?.stop();
    const timeout = setTimeout(() => {
      Animated.sequence([
        Animated.sequence([
          Animated.timing(wrongShakeX, { toValue: -9, duration: 55, useNativeDriver: true }),
          Animated.timing(wrongShakeX, { toValue: 9, duration: 55, useNativeDriver: true }),
          Animated.timing(wrongShakeX, { toValue: -7, duration: 55, useNativeDriver: true }),
          Animated.timing(wrongShakeX, { toValue: 7, duration: 55, useNativeDriver: true }),
          Animated.timing(wrongShakeX, { toValue: 0, duration: 55, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(wrongFallY, { toValue: 40, duration: 350, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.55, duration: 350, useNativeDriver: true }),
          Animated.timing(bubbleOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]),
      ]).start();
    }, 50);
    return () => clearTimeout(timeout);
  }, [tapped, correct]);

  // Hint highlight pulse
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

  const bgColor = highlighted ? '#fbbf24' : tapped ? (correct ? '#16a34a' : '#dc2626') : bubbleColor;

  return (
    <Animated.View
      style={{ position: 'absolute', transform: [{ translateX: x }, { translateY: y }] }}
    >
      <Animated.View
        onLayout={e => { bubbleSizeRef.current = e.nativeEvent.layout; }}
        style={[
          styles.bubble,
          { backgroundColor: bgColor, opacity: bubbleOpacity },
          { transform: [{ scale }, { translateX: wrongShakeX }, { translateY: wrongFallY }, { rotate: wrongRotate }] },
        ]}
      >
        <Pressable onPress={() => onTap(wordId)} disabled={tapped} hitSlop={10}>
          <Text style={[styles.text, highlighted && styles.textHighlighted]}>{word}</Text>
        </Pressable>
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

export default React.memo(FloatingWord);
