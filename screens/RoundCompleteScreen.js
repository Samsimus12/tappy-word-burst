import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function RoundCompleteScreen({ round, roundScore, totalScore, targetWord, onContinue }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.badge}>Round {round} Complete!</Text>
        <Text style={styles.emoji}>🎉</Text>

        <View style={styles.wordBox}>
          <Text style={styles.wordLabel}>You found all synonyms for</Text>
          <Text style={styles.word}>{targetWord}</Text>
        </View>

        <View style={styles.scoresRow}>
          <View style={styles.scoreTile}>
            <Text style={styles.scoreTileValue}>+{roundScore}</Text>
            <Text style={styles.scoreTileLabel}>This Round</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scoreTile}>
            <Text style={[styles.scoreTileValue, styles.totalValue]}>{totalScore}</Text>
            <Text style={styles.scoreTileLabel}>Total Score</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f2e',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  badge: {
    color: '#a5b4fc',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 28,
  },
  wordBox: {
    alignItems: 'center',
    marginBottom: 36,
  },
  wordLabel: {
    color: '#a5b4fc',
    fontSize: 14,
    marginBottom: 6,
  },
  word: {
    color: '#fbbf24',
    fontSize: 36,
    fontWeight: '800',
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e4a',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 32,
    width: '100%',
    marginBottom: 40,
  },
  scoreTile: {
    flex: 1,
    alignItems: 'center',
  },
  scoreTileValue: {
    color: '#22c55e',
    fontSize: 38,
    fontWeight: '800',
  },
  totalValue: {
    color: '#fbbf24',
  },
  scoreTileLabel: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: '#2d2d6e',
    marginHorizontal: 8,
  },
  continueBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    paddingHorizontal: 56,
    borderRadius: 50,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
