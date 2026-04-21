import React, { useEffect, useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated, Easing } from 'react-native';

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function FallingWord({ wordId, word, tapped, correct, highlighted, onTap, screenWidth, screenHeight, speedMultiplier = 1 }) {
  const x = useRef(new Animated.Value(Math.random() * Math.max(0, screenWidth - 130))).current;
  const y = useRef(new Animated.Value(-60)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const bubbleOpacity = useRef(new Animated.Value(1)).current;
  const rayProgress = useRef(new Animated.Value(0)).current;
  const wrongShakeX = useRef(new Animated.Value(0)).current;
  const wrongFallY = useRef(new Animated.Value(0)).current;

  const tappedRef = useRef(tapped);
  useEffect(() => { tappedRef.current = tapped; }, [tapped]);

  const fallAnimRef = useRef(null);
  const crumbleDir = useRef(Math.random() > 0.5 ? 1 : -1).current;
  const bubbleSizeRef = useRef({ width: 80, height: 37 });

  const wrongRotate = wrongFallY.interpolate({
    inputRange: [0, 40],
    outputRange: ['0deg', `${crumbleDir * 22}deg`],
  });

  // Falling animation with recycling
  useEffect(() => {
    let active = true;
    const initialDelay = Math.random() * 3000;

    const fall = () => {
      if (!active || tappedRef.current) return;
      x.setValue(Math.random() * Math.max(0, screenWidth - 130));
      y.setValue(-60);

      const anim = Animated.timing(y, {
        toValue: screenHeight + 60,
        duration: (2800 + Math.random() * 2200) / speedMultiplier,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      fallAnimRef.current = anim;
      anim.start(({ finished }) => {
        if (!finished || !active || tappedRef.current) return;
        // Brief pause before re-entering
        const reentryDelay = 300 + Math.random() * 700;
        setTimeout(() => fall(), reentryDelay);
      });
    };

    const timer = setTimeout(fall, initialDelay);
    return () => {
      active = false;
      clearTimeout(timer);
      fallAnimRef.current?.stop();
    };
  }, []);

  // Correct tap: stop fall, pop + rays
  useEffect(() => {
    if (!tapped || !correct) return;
    fallAnimRef.current?.stop();
    setTimeout(() => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.45, duration: 110, useNativeDriver: true }),
          Animated.timing(bubbleOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]),
        Animated.timing(rayProgress, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 50);
  }, [tapped, correct]);

  // Wrong tap: stop fall, shake then crumble
  useEffect(() => {
    if (!tapped || correct) return;
    fallAnimRef.current?.stop();
    setTimeout(() => {
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
  const bgColor = highlighted ? '#fbbf24' : tapped ? (correct ? '#16a34a' : '#dc2626') : '#3b3b8f';

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

export default React.memo(FallingWord);
