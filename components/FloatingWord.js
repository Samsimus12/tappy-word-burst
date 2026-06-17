import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function FloatingWord({ wordId, word, tapped, correct, highlighted, bounds, speedMultiplier = 1, bubbleColor = '#3b3b8f', wordPositionsRef }) {
  const dur = useRef((3500 + Math.random() * 4000) / speedMultiplier).current;
  const delayMs = useRef(Math.random() * 1500).current;

  const bubbleSizeRef = useRef({ width: 150, height: 55 });
  const boundsRef = useRef(bounds);
  useEffect(() => { boundsRef.current = bounds; }, [bounds]);

  const tappedRef = useRef(tapped);
  useEffect(() => { tappedRef.current = tapped; }, [tapped]);

  const initX = useRef(Math.random() * Math.max(0, bounds.width - 150)).current;
  const initY = useRef(Math.random() * Math.max(0, bounds.height - 55)).current;

  const x = useRef(new Animated.Value(initX)).current;
  const y = useRef(new Animated.Value(initY)).current;
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

  const activeAnimRef = useRef(null);

  // Register position in parent's hit-test map and track via addListener.
  // useNativeDriver: true means the native thread drives the animation, so
  // addListener delivers values asynchronously from the native side. The
  // ~1-frame lag is smaller than our hit-slop, so hit testing stays accurate.
  useEffect(() => {
    wordPositionsRef.current[wordId] = {
      x: initX, y: initY,
      width: bubbleSizeRef.current.width,
      height: bubbleSizeRef.current.height,
    };
    const xId = x.addListener(({ value }) => {
      const pos = wordPositionsRef.current[wordId];
      if (pos) pos.x = value;
    });
    const yId = y.addListener(({ value }) => {
      const pos = wordPositionsRef.current[wordId];
      if (pos) pos.y = value;
    });
    return () => {
      x.removeListener(xId);
      y.removeListener(yId);
      delete wordPositionsRef.current[wordId];
    };
  }, []);

  useEffect(() => {
    const easing = Easing.inOut(Easing.quad);
    let active = true;

    const moveToNext = () => {
      if (!active || tappedRef.current) return;
      const b = boundsRef.current;
      const s = bubbleSizeRef.current;
      const targetX = Math.random() * Math.max(0, b.width - s.width);
      const targetY = Math.random() * Math.max(0, b.height - s.height);
      const anim = Animated.parallel([
        Animated.timing(x, { toValue: targetX, duration: dur, easing, useNativeDriver: true }),
        Animated.timing(y, { toValue: targetY, duration: dur * 1.4, easing, useNativeDriver: true }),
      ]);
      activeAnimRef.current = anim;
      anim.start(({ finished }) => {
        if (finished && active && !tappedRef.current) moveToNext();
      });
    };

    const timeout = setTimeout(moveToNext, delayMs);
    return () => {
      active = false;
      clearTimeout(timeout);
      activeAnimRef.current?.stop();
    };
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
    activeAnimRef.current?.stop();
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
      pointerEvents="none"
      style={{ position: 'absolute', transform: [{ translateX: x }, { translateY: y }] }}
    >
      <Animated.View
        onLayout={e => {
          const { width, height } = e.nativeEvent.layout;
          bubbleSizeRef.current = { width, height };
          const pos = wordPositionsRef.current[wordId];
          if (pos) { pos.width = width; pos.height = height; }
        }}
        style={[
          styles.bubble,
          { backgroundColor: bgColor, opacity: bubbleOpacity },
          { transform: [{ scale }, { translateX: wrongShakeX }, { translateY: wrongFallY }, { rotate: wrongRotate }] },
        ]}
      >
        <Text style={[styles.text, highlighted && styles.textHighlighted]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>{word}</Text>
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
    maxWidth: 160,
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
