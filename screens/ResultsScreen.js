import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function ResultsScreen({ result, onPlayAgain }) {
  const { roundScore, totalScore, targetWord, correctFound, totalSynonyms, wrongTaps, missedSynonyms } = result;
  const accuracy = totalSynonyms > 0 ? Math.round((correctFound / totalSynonyms) * 100) : 0;

  let grade, gradeColor;
  if (accuracy >= 80) { grade = 'So close!'; gradeColor = '#f59e0b'; }
  else if (accuracy >= 60) { grade = 'Good effort!'; gradeColor = '#6366f1'; }
  else if (accuracy >= 40) { grade = 'Keep trying!'; gradeColor = '#fb923c'; }
  else { grade = 'Practice more!'; gradeColor = '#ef4444'; }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Time's Up!</Text>
        <Text style={[styles.grade, { color: gradeColor }]}>{grade}</Text>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Total Score</Text>
          <Text style={styles.scoreValue}>{totalScore}</Text>
          {roundScore > 0 && (
            <Text style={styles.roundScoreNote}>+{roundScore} this round</Text>
          )}
        </View>

        <View style={styles.statsGrid}>
          <StatTile label="Word" value={targetWord} wide />
          <StatTile label="Synonyms Found" value={`${correctFound} / ${totalSynonyms}`} />
          <StatTile label="Accuracy" value={`${accuracy}%`} />
          <StatTile label="Wrong Taps" value={wrongTaps} />
        </View>

        {missedSynonyms.length > 0 && (
          <View style={styles.missedBox}>
            <Text style={styles.missedHeading}>Synonyms you missed</Text>
            <View style={styles.missedList}>
              {missedSynonyms.map(w => (
                <View key={w} style={styles.missedChip}>
                  <Text style={styles.missedWord}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.playBtn} onPress={onPlayAgain} activeOpacity={0.85}>
          <Text style={styles.playBtnText}>Play Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ label, value, wide }) {
  return (
    <View style={[styles.tile, wide && styles.tileWide]}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f2e',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  grade: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 28,
  },
  scoreBox: {
    backgroundColor: '#1e1e4a',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  scoreLabel: {
    color: '#a5b4fc',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scoreValue: {
    color: '#fbbf24',
    fontSize: 56,
    fontWeight: '800',
    marginTop: 4,
  },
  roundScoreNote: {
    color: '#a5b4fc',
    fontSize: 13,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
  },
  tile: {
    backgroundColor: '#1e1e4a',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: '45%',
  },
  tileWide: {
    width: '100%',
  },
  tileValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  tileLabel: {
    color: '#a5b4fc',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  missedBox: {
    width: '100%',
    backgroundColor: '#1e1e4a',
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
  },
  missedHeading: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  missedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  missedChip: {
    backgroundColor: '#2d1f3a',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  missedWord: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '500',
  },
  playBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 50,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
