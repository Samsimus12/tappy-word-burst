import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

// Parabolic arc: rises from bottom, peaks, then falls off the top.
function SliceWord({ wordId, word, startX, peakY, endX, tapped, correct, highlighted, screenWidth, screenHeight, riseDuration, fallDuration, bubbleColor = '#3b3b8f', wordPositionsRef, onExit }) {
  const x = useRef(new Animated.Value(startX)).current;
  const y = useRef(new Animated.Value(screenHeight + 60)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const bubbleOpacity = useRef(new Animated.Value(1)).current;
  const rayProgress = useRef(new Animated.Value(0)).current;
  const wrongShakeX = useRef(new Animated.Value(0)).current;

  const tappedRef = useRef(tapped);
  useEffect(() => { tappedRef.current = tapped; }, [tapped]);

  const arcAnimRef = useRef(null);
  const bubbleSizeRef = useRef({ width: 90, height: 48 });

  useEffect(() => {
    wordPositionsRef.current[wordId] = {
      x: startX, y: screenHeight + 60,
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
    const yArc = Animated.sequence([
      Animated.timing(y, {
        toValue: peakY,
        duration: riseDuration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(y, {
        toValue: screenHeight + 60,
        duration: fallDuration,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
    ]);
    const xDrift = Animated.timing(x, {
      toValue: endX,
      duration: riseDuration + fallDuration,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    const anim = Animated.parallel([yArc, xDrift]);
    arcAnimRef.current = anim;
    anim.start(({ finished }) => {
      if (finished && !tappedRef.current) onExit(wordId);
    });
    return () => arcAnimRef.current?.stop();
  }, []);

  useEffect(() => {
    if (!tapped) return;
    arcAnimRef.current?.stop();
    if (correct) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.6, duration: 80, useNativeDriver: true }),
          Animated.timing(bubbleOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
        Animated.timing(rayProgress, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start(() => onExit(wordId));
    } else {
      Animated.sequence([
        Animated.sequence([
          Animated.timing(wrongShakeX, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(wrongShakeX, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(wrongShakeX, { toValue: -8, duration: 50, useNativeDriver: true }),
          Animated.timing(wrongShakeX, { toValue: 8, duration: 50, useNativeDriver: true }),
          Animated.timing(wrongShakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.5, duration: 300, useNativeDriver: true }),
          Animated.timing(bubbleOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => onExit(wordId));
    }
  }, [tapped]);

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

  const rayTranslate = rayProgress.interpolate({ inputRange: [0, 1], outputRange: [0, -42] });
  const rayOpacity = rayProgress.interpolate({ inputRange: [0, 0.08, 0.7, 1], outputRange: [0, 1, 1, 0] });
  const bgColor = highlighted ? '#fbbf24' : tapped ? (correct ? '#16a34a' : '#dc2626') : bubbleColor;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        transform: [{ translateX: x }, { translateY: y }],
      }}
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
          { transform: [{ scale }, { translateX: wrongShakeX }] },
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
            height: 14,
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

export default React.memo(SliceWord);
