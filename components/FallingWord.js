import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function FallingWord({ wordId, word, tapped, correct, highlighted, screenWidth, screenHeight, speedMultiplier = 1, bubbleColor = '#3b3b8f', wordPositionsRef }) {
  const initX = useRef(Math.random() * Math.max(0, screenWidth - 150)).current;

  const x = useRef(new Animated.Value(initX)).current;
  const y = useRef(new Animated.Value(-60)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const bubbleOpacity = useRef(new Animated.Value(1)).current;
  const rayProgress = useRef(new Animated.Value(0)).current;
  const wrongShakeX = useRef(new Animated.Value(0)).current;
  const wrongFallY = useRef(new Animated.Value(0)).current;

  const tappedRef = useRef(tapped);
  useEffect(() => { tappedRef.current = tapped; }, [tapped]);

  const screenWidthRef = useRef(screenWidth);
  const screenHeightRef = useRef(screenHeight);
  useEffect(() => { screenWidthRef.current = screenWidth; screenHeightRef.current = screenHeight; }, [screenWidth, screenHeight]);

  const fallAnimRef = useRef(null);
  const crumbleDir = useRef(Math.random() > 0.5 ? 1 : -1).current;
  const bubbleSizeRef = useRef({ width: 150, height: 55 });

  const wrongRotate = wrongFallY.interpolate({
    inputRange: [0, 40],
    outputRange: ['0deg', `${crumbleDir * 22}deg`],
  });

  // Register position in parent's hit-test map and track via addListener.
  useEffect(() => {
    wordPositionsRef.current[wordId] = {
      x: initX, y: -60,
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

  // Falling animation with recycling
  useEffect(() => {
    let active = true;
    const initialDelay = Math.random() * 3000;

    const fall = () => {
      if (!active || tappedRef.current) return;
      const newX = Math.random() * Math.max(0, screenWidthRef.current - bubbleSizeRef.current.width);
      x.setValue(newX);
      y.setValue(-60);

      const anim = Animated.timing(y, {
        toValue: screenHeightRef.current + 60,
        duration: (2800 + Math.random() * 2200) / speedMultiplier,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      fallAnimRef.current = anim;
      anim.start(({ finished }) => {
        if (!finished || !active || tappedRef.current) return;
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
        <Text style={[styles.text, highlighted && styles.textHighlighted]}>{word}</Text>
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
