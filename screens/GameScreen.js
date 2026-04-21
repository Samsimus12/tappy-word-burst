import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, Animated, Modal } from 'react-native';
import FloatingWord from '../components/FloatingWord';
import FallingWord from '../components/FallingWord';
import { playSound, startMusic, stopMusic } from '../utils/audio';
import { fetchSynonyms } from '../utils/datamuse';
import { nextWord } from '../utils/wordQueue';
import { DISTRACTOR_WORDS } from '../constants/wordList';
import { FALLBACK_SYNONYMS } from '../constants/fallbackSynonyms';
import { DIFFICULTY } from '../constants/difficulty';

const { width: SW, height: SH } = Dimensions.get('window');
const HEADER_H = 120;
const FOOTER_H = 20;
const WORD_AREA_H = SH - HEADER_H - FOOTER_H;
const WORD_BOUNDS = { width: SW, height: WORD_AREA_H };

const SURVIVAL_START_TIME = 30;

function ScorePopup({ id, value, onComplete }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const x = useRef(SW * 0.25 + Math.random() * SW * 0.5).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -80, duration: 900, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start(() => onComplete(id));
  }, []);

  const isPositive = value > 0;
  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: 60,
        left: x,
        color: isPositive ? '#22c55e' : '#ef4444',
        fontSize: 22,
        fontWeight: '800',
        opacity,
        transform: [{ translateY }],
      }}
    >
      {isPositive ? `+${value}` : value}
    </Animated.Text>
  );
}

export default function GameScreen({ onGameEnd, onBack, totalScore, round, difficulty, mode, hints, onUseHint, onEarnHints, onResetHints }) {
  const config = DIFFICULTY[difficulty] ?? DIFFICULTY.medium;
  const isSurvival = mode === 'survival';
  const isFalling = mode === 'falling';

  const [targetWord, setTargetWord] = useState('');
  const [words, setWords] = useState([]);
  const [roundScore, setRoundScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(isSurvival ? SURVIVAL_START_TIME : config.duration);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const [wordsSolved, setWordsSolved] = useState(0);
  const [countdown, setCountdown] = useState(null);

  const [scorePopups, setScorePopups] = useState([]);
  const popupCounter = useRef(0);
  const [showQuitModal, setShowQuitModal] = useState(false);

  const wordsRef = useRef([]);
  const roundScoreRef = useRef(0);
  const targetWordRef = useRef('');
  const wrongPenaltyRef = useRef(config.wrongPenalty);
  const countdownScale = useRef(new Animated.Value(1)).current;
  const countdownOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => { wordsRef.current = words; }, [words]);

  useEffect(() => {
    loadGame();
    startMusic();
  }, []);

  useEffect(() => {
    if (loading || done || countdown !== null || showQuitModal) return;
    if (timeLeft === 0) {
      setDone(true);
      playSound('fail');
      stopMusic();
      onGameEnd({ ...buildResult(), allFound: false });
      return;
    }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, loading, done, countdown, showQuitModal]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) playSound('tick');
    if (countdown === 0) playSound('go');
    countdownScale.setValue(0.4);
    countdownOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(countdownScale, { toValue: 1, useNativeDriver: true, bounciness: 8 }),
      Animated.timing(countdownOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    if (countdown === 0) {
      const t = setTimeout(() => setCountdown(null), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdown(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function buildResult(ws = wordsRef.current) {
    return {
      roundScore: roundScoreRef.current,
      targetWord: targetWordRef.current,
      correctFound: ws.filter(w => w.isSynonym && w.tapped).length,
      totalSynonyms: ws.filter(w => w.isSynonym).length,
      wrongTaps: ws.filter(w => !w.isSynonym && w.tapped).length,
      missedSynonyms: ws.filter(w => w.isSynonym && !w.tapped).map(w => w.word),
      foundSynonyms: ws.filter(w => w.isSynonym && w.tapped).map(w => w.word),
      wordsSolved,
      mode,
    };
  }

  async function loadGame(withCountdown = true) {
    let word, synonyms;
    let attempts = 0;

    while (attempts < 5) {
      word = nextWord();
      synonyms = [];
      try {
        synonyms = await fetchSynonyms(word);
      } catch {
        synonyms = FALLBACK_SYNONYMS[word] ?? [];
      }
      if (synonyms.length === 0) synonyms = FALLBACK_SYNONYMS[word] ?? [];
      if (synonyms.length >= config.maxSynonyms) break;
      attempts++;
    }

    setTargetWord(word);
    targetWordRef.current = word;

    const selected = synonyms.slice(0, config.maxSynonyms);
    const synonymSet = new Set(synonyms);
    const distractors = DISTRACTOR_WORDS
      .filter(w => !synonymSet.has(w) && w !== word)
      .sort(() => Math.random() - 0.5)
      .slice(0, config.distractors);

    const all = [
      ...selected.map(w => ({ id: w, word: w, isSynonym: true, tapped: false, correct: false })),
      ...distractors.map(w => ({ id: w, word: w, isSynonym: false, tapped: false, correct: false })),
    ].sort(() => Math.random() - 0.5);

    setWords(all);
    setLoading(false);
    if (withCountdown) setCountdown(3);
  }

  useEffect(() => {
    if (done || loading || words.length === 0) return;
    const allFound = words.filter(w => w.isSynonym).every(w => w.tapped);
    if (!allFound) return;

    if (isSurvival) {
      playSound('success');
      setTimeLeft(t => t + 25);
      setWordsSolved(n => n + 1);
      setLoading(true);
      loadGame(false);
    } else {
      setDone(true);
      playSound('success');
      onGameEnd({ ...buildResult(), allFound: true });
    }
  }, [words]);

  const handleTap = useCallback((wordId) => {
    const target = wordsRef.current.find(w => w.id === wordId);
    const isWrong = target && !target.tapped && !target.isSynonym;
    let newScore = null;

    setWords(prev => {
      const updated = prev.map(w => {
        if (w.id !== wordId || w.tapped) return w;
        const correct = w.isSynonym;
        const next = Math.max(0, roundScoreRef.current + (correct ? 10 : -wrongPenaltyRef.current));
        roundScoreRef.current = next;
        newScore = next;
        return { ...w, tapped: true, correct };
      });
      wordsRef.current = updated;
      return updated;
    });

    if (newScore !== null) setRoundScore(newScore);
    if (isSurvival && isWrong) setTimeLeft(t => Math.max(0, t - 5));

    if (target && !target.tapped) {
      const delta = target.isSynonym ? 10 : -wrongPenaltyRef.current;
      const pid = popupCounter.current++;
      setScorePopups(prev => [...prev, { id: pid, value: delta }]);
      playSound(target.isSynonym ? 'correct' : 'wrong');
    }
  }, [isSurvival]);

  const removePopup = useCallback((id) => {
    setScorePopups(prev => prev.filter(p => p.id !== id));
  }, []);

  function handleHint() {
    if (hints <= 0 || done) return;
    const unfound = wordsRef.current.filter(w => w.isSynonym && !w.tapped);
    if (unfound.length === 0) return;
    const target = unfound[Math.floor(Math.random() * unfound.length)];
    onUseHint();
    playSound('hint');
    setHighlightedId(target.id);
    setTimeout(() => setHighlightedId(null), 2000);
  }

  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 15 ? '#fb923c' : '#fff';
  const displayScore = totalScore + roundScore;
  const foundCount = words.filter(w => w.isSynonym && w.tapped).length;
  const totalCount = words.filter(w => w.isSynonym).length;

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (loading && words.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statBox}>
          <TouchableOpacity onPress={() => setShowQuitModal(true)} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{displayScore}</Text>
        </View>
        <View style={styles.targetBox}>
          <Text style={[styles.roundLabel, { color: isSurvival ? '#f43f5e' : isFalling ? '#22d3ee' : config.color }]}>
            {isSurvival ? `Survival · ${wordsSolved} solved` : isFalling ? `Falling · Round ${round} · ${config.label}` : `Round ${round} · ${config.label}`}
          </Text>
          <Text style={styles.findLabel}>find synonyms for</Text>
          <Text style={styles.targetWord}>{targetWord}</Text>
          <Text style={styles.wordCount}>
            {foundCount} / {totalCount} found
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={[styles.statValue, { color: timerColor }]}>{timeLeft}</Text>
          <TouchableOpacity
            onPress={handleHint}
            onLongPress={onResetHints}
            disabled={done}
            style={[styles.hintBtn, (hints <= 0 || done) && styles.hintBtnDisabled]}
            hitSlop={8}
          >
            <Text style={styles.hintBtnText}>Hint ({hints})</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.wordArea} pointerEvents={countdown !== null ? 'none' : 'box-none'}>
        {words.map(w => isFalling ? (
          <FallingWord
            key={w.id}
            wordId={w.id}
            word={w.word}
            tapped={w.tapped}
            correct={w.correct}
            highlighted={w.id === highlightedId}
            onTap={handleTap}
            screenWidth={SW}
            screenHeight={WORD_AREA_H}
            speedMultiplier={config.speedMultiplier}
          />
        ) : (
          <FloatingWord
            key={w.id}
            wordId={w.id}
            word={w.word}
            tapped={w.tapped}
            correct={w.correct}
            highlighted={w.id === highlightedId}
            onTap={handleTap}
            bounds={WORD_BOUNDS}
            speedMultiplier={config.speedMultiplier}
          />
        ))}
        {countdown !== null && (
          <View style={styles.countdownOverlay} pointerEvents="none">
            <Animated.Text
              style={[
                styles.countdownText,
                countdown === 0 && styles.countdownGo,
                { opacity: countdownOpacity, transform: [{ scale: countdownScale }] },
              ]}
            >
              {countdown === 0 ? 'Go!' : countdown}
            </Animated.Text>
          </View>
        )}
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {scorePopups.map(p => (
          <ScorePopup key={p.id} id={p.id} value={p.value} onComplete={removePopup} />
        ))}
      </View>

      <Modal visible={showQuitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Quit round?</Text>
            <Text style={styles.modalSub}>Your progress will be lost.</Text>
            <TouchableOpacity style={styles.modalQuitBtn} onPress={onBack} activeOpacity={0.85}>
              <Text style={styles.modalQuitText}>Quit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowQuitModal(false)} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>Keep Playing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f2e',
  },
  center: {
    flex: 1,
    backgroundColor: '#0f0f2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#a5b4fc',
    fontSize: 18,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  header: {
    height: HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#1a1a40',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d6e',
  },
  hintBtn: {
    marginTop: 4,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  hintBtnDisabled: {
    backgroundColor: '#4b4b70',
  },
  hintBtnText: {
    color: '#0f0f2e',
    fontSize: 11,
    fontWeight: '700',
  },
  statBox: {
    alignItems: 'center',
    minWidth: 60,
  },
  backBtn: {
    marginBottom: 4,
  },
  backBtnText: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '600',
  },
  statLabel: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  targetBox: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  roundLabel: {
    color: '#6366f1',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  findLabel: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  wordCount: {
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  targetWord: {
    color: '#fbbf24',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  wordArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 15, 46, 0.6)',
  },
  countdownText: {
    fontSize: 100,
    fontWeight: '800',
    color: '#fff',
  },
  countdownGo: {
    fontSize: 72,
    color: '#22c55e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#1e1e4a',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '78%',
    gap: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  modalSub: {
    color: '#a5b4fc',
    fontSize: 14,
    marginBottom: 4,
  },
  modalQuitBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 50,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  modalQuitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  modalCancelText: {
    color: '#a5b4fc',
    fontSize: 15,
    fontWeight: '600',
  },
});
