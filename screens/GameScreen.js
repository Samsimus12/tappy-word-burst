import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import FloatingWord from '../components/FloatingWord';
import { fetchSynonyms } from '../utils/datamuse';
import { nextWord } from '../utils/wordQueue';
import { DISTRACTOR_WORDS } from '../constants/wordList';
import { FALLBACK_SYNONYMS } from '../constants/fallbackSynonyms';
import { DIFFICULTY } from '../constants/difficulty';

const { width: SW, height: SH } = Dimensions.get('window');
const HEADER_H = 120;
const FOOTER_H = 20;
const WORD_AREA_H = SH - HEADER_H - FOOTER_H;

export default function GameScreen({ onGameEnd, onBack, totalScore, round, difficulty, hints, onUseHint, onEarnHints }) {
  const config = DIFFICULTY[difficulty] ?? DIFFICULTY.medium;

  const [targetWord, setTargetWord] = useState('');
  const [words, setWords] = useState([]);
  const [roundScore, setRoundScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);

  const wordsRef = useRef([]);
  const roundScoreRef = useRef(0);
  const targetWordRef = useRef('');

  useEffect(() => { wordsRef.current = words; }, [words]);

  useEffect(() => {
    loadGame();
  }, []);

  useEffect(() => {
    if (loading || done) return;
    if (timeLeft === 0) {
      setDone(true);
      onGameEnd({ ...buildResult(), allFound: false });
      return;
    }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, loading, done]);

  function buildResult(ws = wordsRef.current) {
    return {
      roundScore: roundScoreRef.current,
      targetWord: targetWordRef.current,
      correctFound: ws.filter(w => w.isSynonym && w.tapped).length,
      totalSynonyms: ws.filter(w => w.isSynonym).length,
      wrongTaps: ws.filter(w => !w.isSynonym && w.tapped).length,
      missedSynonyms: ws.filter(w => w.isSynonym && !w.tapped).map(w => w.word),
      foundSynonyms: ws.filter(w => w.isSynonym && w.tapped).map(w => w.word),
    };
  }

  async function loadGame() {
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
  }

  useEffect(() => {
    if (done || loading || words.length === 0) return;
    const allFound = words.filter(w => w.isSynonym).every(w => w.tapped);
    if (allFound) {
      setDone(true);
      onGameEnd({ ...buildResult(), allFound: true });
    }
  }, [words]);

  function handleTap(wordId) {
    let newScore = null;

    setWords(prev => {
      const updated = prev.map(w => {
        if (w.id !== wordId || w.tapped) return w;
        const correct = w.isSynonym;
        const next = Math.max(0, roundScoreRef.current + (correct ? 10 : -2));
        roundScoreRef.current = next;
        newScore = next;
        return { ...w, tapped: true, correct };
      });
      wordsRef.current = updated;
      return updated;
    });

    if (newScore !== null) setRoundScore(newScore);
  }

  function handleHint() {
    if (hints <= 0 || done) return;
    const unfound = wordsRef.current.filter(w => w.isSynonym && !w.tapped);
    if (unfound.length === 0) return;
    const target = unfound[Math.floor(Math.random() * unfound.length)];
    onUseHint();
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

  if (loading) {
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
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{displayScore}</Text>
        </View>
        <View style={styles.targetBox}>
          <Text style={[styles.roundLabel, { color: config.color }]}>
            Round {round} · {config.label}
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
            disabled={hints <= 0 || done}
            style={[styles.hintBtn, (hints <= 0 || done) && styles.hintBtnDisabled]}
            hitSlop={8}
          >
            <Text style={styles.hintBtnText}>Hint ({hints})</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.wordArea}>
        {words.map(w => (
          <FloatingWord
            key={w.id}
            word={w.word}
            tapped={w.tapped}
            correct={w.correct}
            highlighted={w.id === highlightedId}
            onTap={() => handleTap(w.id)}
            bounds={{ width: SW, height: WORD_AREA_H }}
            speedMultiplier={config.speedMultiplier}
          />
        ))}
      </View>
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
});
