import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import SliceWord from './SliceWord';

const SPAWN_INTERVAL = 900; // fixed regardless of difficulty
const CONCURRENT_RAMP_INTERVAL = 25000; // add 1 more word in the air every 25s
const MIN_SLICE_DIST = 8;

function lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
  // Liang-Barsky line-segment vs AABB
  const dx = x2 - x1, dy = y2 - y1;
  let tMin = 0, tMax = 1;
  for (const [p, q] of [[-dx, x1 - rx], [dx, rx + rw - x1], [-dy, y1 - ry], [dy, ry + rh - y1]]) {
    if (p === 0) { if (q < 0) return false; }
    else {
      const r = q / p;
      if (p < 0) tMin = Math.max(tMin, r);
      else tMax = Math.min(tMax, r);
      if (tMin > tMax) return false;
    }
  }
  return true;
}

export default function SliceGameArea({ words, onWordTapped, onLoseLife, lives, bounds, maxConcurrent, bubbleColor, highlightedId, paused }) {
  const { width: screenWidth, height: screenHeight } = bounds;

  const [activeWords, setActiveWords] = useState([]);
  const activeWordsRef = useRef([]);
  useEffect(() => { activeWordsRef.current = activeWords; }, [activeWords]);
  const instanceCounter = useRef(0);

  const wordsRef = useRef(words);
  useEffect(() => { wordsRef.current = words; }, [words]);

  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const wordQueueRef = useRef([]);
  // Max concurrent words in the air — starts at difficulty setting, ramps up over time
  const maxConcurrentRef = useRef(maxConcurrent);
  const wordPositionsRef = useRef({});
  const slicedLocalRef = useRef(new Set());

  useEffect(() => {
    wordQueueRef.current = [...words].sort(() => Math.random() - 0.5);
  }, []);

  // Ramp up concurrent count over time (difficulty increase without changing speed)
  useEffect(() => {
    const interval = setInterval(() => {
      maxConcurrentRef.current = maxConcurrentRef.current + 1;
    }, CONCURRENT_RAMP_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  function getNextWord() {
    while (wordQueueRef.current.length > 0) {
      const w = wordQueueRef.current.shift();
      const current = wordsRef.current.find(wr => wr.id === w.id);
      if (current && !current.tapped) return current;
    }
    const untapped = wordsRef.current.filter(w => !w.tapped);
    if (untapped.length === 0) return null;
    wordQueueRef.current = [...untapped].sort(() => Math.random() - 0.5);
    return wordQueueRef.current.shift() ?? null;
  }

  function spawnWord() {
    if (pausedRef.current) return;
    if (activeWordsRef.current.length >= maxConcurrentRef.current) return;
    const word = getNextWord();
    if (!word) return;

    const BUBBLE_W = 110;
    const startX = 20 + Math.random() * (screenWidth - BUBBLE_W - 40);
    const drift = (Math.random() - 0.5) * 40;
    const endX = Math.max(0, Math.min(screenWidth - BUBBLE_W, startX + drift));
    const peakY = screenHeight * (0.10 + Math.random() * 0.25);
    // Fixed slow arc speed — same for all difficulties
    const riseDuration = 1400 + Math.random() * 300;
    const fallDuration = 1500 + Math.random() * 300;

    setActiveWords(prev => [
      ...prev,
      { id: instanceCounter.current++, wordId: word.id, startX, peakY, endX, riseDuration, fallDuration },
    ]);
  }

  useEffect(() => {
    const interval = setInterval(spawnWord, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [screenWidth, screenHeight]);

  // Called by SliceWord when its animation fully completes (natural exit OR post-slice fade)
  const handleWordExit = useCallback((wordId) => {
    setActiveWords(prev => {
      const idx = prev.findIndex(a => a.wordId === wordId);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
    // Lose a life only if this was a synonym that was never sliced
    const ws = wordsRef.current;
    const missedSynonym = ws.find(w => w.id === wordId && w.isSynonym && !w.tapped && !slicedLocalRef.current.has(wordId));
    if (missedSynonym) {
      onLoseLife();
      wordQueueRef.current.push(missedSynonym);
    }
  }, [onLoseLife]);

  const lastPointRef = useRef(null);
  const [trail, setTrail] = useState([]);
  const trailTimerRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        lastPointRef.current = { x: locationX, y: locationY };
        setTrail([{ x: locationX, y: locationY, k: Date.now() }]);
      },
      onPanResponderMove: (e) => {
        if (pausedRef.current) return;
        const { locationX, locationY } = e.nativeEvent;
        const prev = lastPointRef.current;
        if (!prev) return;

        const dist = Math.hypot(locationX - prev.x, locationY - prev.y);
        if (dist >= MIN_SLICE_DIST) {
          const ws = wordsRef.current;
          for (const [wordId, pos] of Object.entries(wordPositionsRef.current)) {
            if (slicedLocalRef.current.has(wordId)) continue;
            const word = ws.find(w => w.id === wordId && !w.tapped);
            if (!word) continue;
            if (lineIntersectsRect(prev.x, prev.y, locationX, locationY, pos.x, pos.y, pos.width, pos.height)) {
              slicedLocalRef.current.add(wordId);
              onWordTapped(wordId);
              if (!word.isSynonym) onLoseLife();
            }
          }
          lastPointRef.current = { x: locationX, y: locationY };
          setTrail(t => [...t, { x: locationX, y: locationY, k: Date.now() }].slice(-8));
          if (trailTimerRef.current) clearTimeout(trailTimerRef.current);
          trailTimerRef.current = setTimeout(() => setTrail([]), 200);
        }
      },
      onPanResponderRelease: () => {
        lastPointRef.current = null;
        if (trailTimerRef.current) clearTimeout(trailTimerRef.current);
        trailTimerRef.current = setTimeout(() => setTrail([]), 150);
      },
    })
  ).current;

  return (
    <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
      {activeWords.map(inst => {
        const wordData = words.find(w => w.id === inst.wordId);
        if (!wordData) return null;
        return (
          <SliceWord
            key={`${inst.wordId}_${inst.id}`}
            wordId={inst.wordId}
            word={wordData.word}
            startX={inst.startX}
            peakY={inst.peakY}
            endX={inst.endX}
            tapped={wordData.tapped}
            correct={wordData.correct}
            highlighted={wordData.id === highlightedId}
            screenWidth={screenWidth}
            screenHeight={screenHeight}
            riseDuration={inst.riseDuration}
            fallDuration={inst.fallDuration}
            bubbleColor={bubbleColor}
            wordPositionsRef={wordPositionsRef}
            onExit={handleWordExit}
          />
        );
      })}

      {/* Slice trail */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {trail.map((pt, i) => {
          const alpha = (i + 1) / trail.length;
          const size = 4 + alpha * 7;
          return (
            <View
              key={pt.k}
              style={{
                position: 'absolute',
                left: pt.x - size / 2,
                top: pt.y - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: `rgba(255,255,255,${(alpha * 0.75).toFixed(2)})`,
              }}
            />
          );
        })}
      </View>

      {/* Lives display */}
      <View style={styles.livesRow} pointerEvents="none">
        {Array.from({ length: 3 }, (_, i) => (
          <Text key={i} style={[styles.heartText, i >= lives && styles.heartLost]}>
            ♥
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  livesRow: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  heartText: {
    fontSize: 24,
    color: '#f43f5e',
  },
  heartLost: {
    opacity: 0.2,
  },
});
