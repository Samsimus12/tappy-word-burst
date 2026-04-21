import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function RoundCompleteScreen({ round, roundScore, totalScore, targetWord, foundSynonyms, onContinue, onBack }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

        {foundSynonyms.length > 0 && (
          <View style={styles.foundBox}>
            <Text style={styles.foundHeading}>Synonyms you found</Text>
            <View style={styles.foundList}>
              {foundSynonyms.map(w => (
                <View key={w} style={styles.foundChip}>
                  <Text style={styles.foundWord}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.continueBtnText}>Continue →</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onBack} activeOpacity={0.6} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f2e',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 40,
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
  foundBox: {
    width: '100%',
    backgroundColor: '#1e1e4a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
  },
  foundHeading: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  foundList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foundChip: {
    backgroundColor: '#14291f',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  foundWord: {
    color: '#86efac',
    fontSize: 14,
    fontWeight: '500',
  },
  backLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backLinkText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
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
