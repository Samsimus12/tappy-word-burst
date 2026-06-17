import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, PanResponder } from 'react-native';
import CatchyWord from './CatchyWord';

const N_LANES = 5;
const BUCKET_HEIGHT = 44;
const BUCKET_BOTTOM = 24;
const CATCH_TOLERANCE = 28;

export default function CatchyGameArea({ words, onWordTapped, bounds, speedMultiplier, bubbleColor, highlightedId, paused }) {
  const { width: screenWidth, height: screenHeight } = bounds;
  const laneWidth = screenWidth / N_LANES;
  // Bucket fits exactly one lane so only one word can be caught at a time
  const bucketWidth = Math.max(56, laneWidth - 8);
  const bucketWidthRef = useRef(bucketWidth);
  const screenWidthRef = useRef(screenWidth);
  useEffect(() => {
    bucketWidthRef.current = bucketWidth;
    screenWidthRef.current = screenWidth;
  }, [bucketWidth, screenWidth]);

  // Lane assignments: array of { wordId, dispatchId } | null
  const [laneAssignments, setLaneAssignments] = useState(() => Array(N_LANES).fill(null));
  const dispatchCounter = useRef(0);

  const wordQueueRef = useRef([]);
  const wordsRef = useRef(words);
  useEffect(() => { wordsRef.current = words; }, [words]);

  // Seed queue on mount, but don't dispatch to lanes until the round starts
  useEffect(() => {
    wordQueueRef.current = [...words].sort(() => Math.random() - 0.5);
  }, []);

  const startedRef = useRef(false);
  useEffect(() => {
    if (paused || startedRef.current) return;
    startedRef.current = true;
    const initial = Array(N_LANES).fill(null);
    for (let i = 0; i < N_LANES; i++) {
      const word = dequeueWord(wordQueueRef, wordsRef);
      if (word) initial[i] = { wordId: word.id, dispatchId: dispatchCounter.current++ };
    }
    setLaneAssignments(initial);
  }, [paused]);

  // Bucket position — centered on mount
  const bucketXAnim = useRef(new Animated.Value((screenWidth - bucketWidth) / 2)).current;
  const bucketXRef = useRef((screenWidth - bucketWidth) / 2);
  const bucketStartX = useRef(bucketXRef.current);

  useEffect(() => {
    const id = bucketXAnim.addListener(({ value }) => { bucketXRef.current = value; });
    return () => bucketXAnim.removeListener(id);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        bucketStartX.current = bucketXRef.current;
        bucketXAnim.stopAnimation();
      },
      onPanResponderMove: (_, { dx }) => {
        const newX = Math.max(0, Math.min(screenWidthRef.current - bucketWidthRef.current, bucketStartX.current + dx));
        bucketXAnim.setValue(newX);
        bucketXRef.current = newX;
      },
    })
  ).current;

  // Position tracking map shared with CatchyWord components
  const wordPositionsRef = useRef({});

  // Catch set to avoid double-catching
  const caughtIdsRef = useRef(new Set());

  const handleWordExit = useCallback((wordId) => {
    caughtIdsRef.current.delete(wordId);
    // Find which lane this word was in and dispatch next
    setLaneAssignments(prev => {
      const laneIndex = prev.findIndex(a => a?.wordId === wordId);
      if (laneIndex === -1) return prev;
      const next = [...prev];
      const nextWord = dequeueWord(wordQueueRef, wordsRef);
      next[laneIndex] = nextWord
        ? { wordId: nextWord.id, dispatchId: dispatchCounter.current++ }
        : null;
      return next;
    });

    // Re-queue missed synonyms
    const ws = wordsRef.current;
    const missed = ws.find(w => w.id === wordId && w.isSynonym && !w.tapped);
    if (missed) {
      wordQueueRef.current.push(missed);
    }
  }, []);

  // Collision detection poll
  useEffect(() => {
    const bucketY = screenHeight - BUCKET_BOTTOM - BUCKET_HEIGHT;

    const interval = setInterval(() => {
      const bLeft = bucketXRef.current;
      const bRight = bLeft + bucketWidthRef.current;

      for (const [wordId, pos] of Object.entries(wordPositionsRef.current)) {
        if (caughtIdsRef.current.has(wordId)) continue;
        const wordBottom = pos.y + pos.height;
        if (wordBottom >= bucketY - CATCH_TOLERANCE && wordBottom <= bucketY + CATCH_TOLERANCE) {
          const wordLeft = pos.x;
          const wordRight = pos.x + pos.width;
          if (wordRight > bLeft && wordLeft < bRight) {
            const ws = wordsRef.current;
            const word = ws.find(w => w.id === wordId && !w.tapped);
            if (word) {
              caughtIdsRef.current.add(wordId);
              onWordTapped(wordId);
              // Free the lane immediately for the next word
              setLaneAssignments(prev => {
                const laneIndex = prev.findIndex(a => a?.wordId === wordId);
                if (laneIndex === -1) return prev;
                const next = [...prev];
                const nextWord = dequeueWord(wordQueueRef, wordsRef);
                next[laneIndex] = nextWord
                  ? { wordId: nextWord.id, dispatchId: dispatchCounter.current++ }
                  : null;
                return next;
              });
            }
          }
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [screenHeight, onWordTapped]);

  const bucketY = screenHeight - BUCKET_BOTTOM - BUCKET_HEIGHT;

  return (
    <View style={StyleSheet.absoluteFill}>
      {laneAssignments.map((assignment, laneIndex) => {
        if (!assignment) return null;
        const wordData = words.find(w => w.id === assignment.wordId);
        if (!wordData) return null;
        return (
          <CatchyWord
            key={`${assignment.wordId}_${assignment.dispatchId}`}
            wordId={assignment.wordId}
            word={wordData.word}
            laneIndex={laneIndex}
            laneWidth={laneWidth}
            tapped={wordData.tapped}
            correct={wordData.correct}
            highlighted={wordData.id === highlightedId}
            screenHeight={screenHeight}
            speedMultiplier={speedMultiplier}
            bubbleColor={bubbleColor}
            wordPositionsRef={wordPositionsRef}
            onExit={handleWordExit}
          />
        );
      })}

      {/* Bucket */}
      <Animated.View
        style={[
          styles.bucketContainer,
          { top: bucketY, width: bucketWidth, transform: [{ translateX: bucketXAnim }] },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Rim — widest part, shows the open top of the bucket */}
        <View style={[styles.bucketRim, { width: bucketWidth }]}>
          {/* Inner oval shadow to give depth to the opening */}
          <View style={[styles.bucketRimInner, { width: bucketWidth * 0.72 }]} />
        </View>

        {/* Body — slightly narrower than rim, tapers to base */}
        <View style={[styles.bucketBody, { width: bucketWidth - 6 }]}>
          {/* Left-side sheen for metallic / glossy look */}
          <View style={styles.bucketSheen} />
          {/* Upper hoop band */}
          <View style={[styles.bucketHoop, { top: 9 }]} />
          {/* Lower hoop band */}
          <View style={[styles.bucketHoop, { top: 24 }]} />
        </View>

        {/* Base — narrowest, flat bottom */}
        <View style={[styles.bucketBase, { width: bucketWidth - 16 }]} />
      </Animated.View>

      {/* Lane dividers (subtle guides) */}
      {Array.from({ length: N_LANES - 1 }, (_, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[styles.laneDivider, { left: (i + 1) * laneWidth }]}
        />
      ))}
    </View>
  );
}

function dequeueWord(queueRef, wordsRef) {
  while (queueRef.current.length > 0) {
    const candidate = queueRef.current.shift();
    const current = wordsRef.current.find(w => w.id === candidate.id);
    if (current && !current.tapped) return current;
  }
  // Refill with untapped distractors if empty
  const distractors = wordsRef.current.filter(w => !w.isSynonym && !w.tapped);
  if (distractors.length > 0) {
    queueRef.current = [...distractors].sort(() => Math.random() - 0.5);
    return queueRef.current.shift();
  }
  return null;
}

const styles = StyleSheet.create({
  bucketContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  bucketRim: {
    height: 11,
    backgroundColor: '#60a5fa',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  bucketRimInner: {
    height: 5,
    backgroundColor: '#1e3a8a',
    borderRadius: 3,
    opacity: 0.45,
  },
  bucketBody: {
    backgroundColor: '#2563eb',
    height: 34,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#1d4ed8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  bucketSheen: {
    position: 'absolute',
    left: 5,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 3,
  },
  bucketHoop: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#1d4ed8',
    opacity: 0.7,
  },
  bucketBase: {
    height: 6,
    backgroundColor: '#1e40af',
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  laneDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
