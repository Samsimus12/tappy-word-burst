import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ACHIEVEMENTS } from '../constants/achievements';

export default function ResultsScreen({ result, onPlayAgain, onHome, newAchievements = [], theme }) {
  const { roundScore, totalScore, targetWord, correctFound, totalSynonyms, wrongTaps, missedSynonyms, wordsSolved, mode } = result;
  const isSurvival = mode === 'survival';
  const accuracy = totalSynonyms > 0 ? Math.round((correctFound / totalSynonyms) * 100) : 0;

  let grade, gradeColor;
  if (isSurvival) {
    const ws = wordsSolved ?? 0;
    if (ws >= 10) { grade = 'Incredible!'; gradeColor = '#22c55e'; }
    else if (ws >= 5)  { grade = 'Great run!';   gradeColor = '#f59e0b'; }
    else if (ws >= 2)  { grade = 'Good effort!'; gradeColor = '#6366f1'; }
    else               { grade = 'Keep going!';  gradeColor = '#ef4444'; }
  } else {
    if (accuracy >= 80)      { grade = 'So close!';      gradeColor = '#f59e0b'; }
    else if (accuracy >= 60) { grade = 'Good effort!';   gradeColor = '#6366f1'; }
    else if (accuracy >= 40) { grade = 'Keep trying!';   gradeColor = '#fb923c'; }
    else                     { grade = 'Practice more!'; gradeColor = '#ef4444'; }
  }

  const bg = theme?.bg ?? '#0f0f2e';
  const card = theme?.card ?? '#1e1e4a';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.content}>

        {newAchievements.length > 0 && (
          <View style={[styles.achBanner, { backgroundColor: card }]}>
            <Text style={styles.achBannerTitle}>Achievement{newAchievements.length > 1 ? 's' : ''} unlocked!</Text>
            {newAchievements.map(id => {
              const a = ACHIEVEMENTS.find(x => x.id === id);
              return a ? (
                <Text key={id} style={styles.achBannerItem}>{a.icon} {a.label}</Text>
              ) : null;
            })}
          </View>
        )}

        <View style={styles.topSection}>
          <Text style={styles.heading}>Time's Up!</Text>
          <Text style={[styles.grade, { color: gradeColor }]}>{grade}</Text>
        </View>

        <View style={[styles.scoreBox, { backgroundColor: card }]}>
          <Text style={styles.scoreLabel}>Total Score</Text>
          <Text style={styles.scoreValue}>{totalScore}</Text>
          {roundScore > 0 && (
            <Text style={styles.roundScoreNote}>+{roundScore} this round</Text>
          )}
        </View>

        <View style={styles.statsGrid}>
          {isSurvival && <StatTile label="Words Solved" value={wordsSolved ?? 0} wide bg={card} />}
          <StatTile label="Last Word" value={targetWord} wide={!isSurvival} bg={card} />
          <StatTile label="Synonyms Found" value={`${correctFound} / ${totalSynonyms}`} bg={card} />
          <StatTile label="Accuracy" value={`${accuracy}%`} bg={card} />
          <StatTile label="Wrong Taps" value={wrongTaps} bg={card} />
        </View>

        {missedSynonyms.length > 0 && (
          <View style={[styles.missedBox, { backgroundColor: card }]}>
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

        <View style={styles.actions}>
          <TouchableOpacity style={styles.playBtn} onPress={onPlayAgain} activeOpacity={0.85}>
            <Text style={styles.playBtnText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={onHome} activeOpacity={0.7}>
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

function StatTile({ label, value, wide, bg }) {
  return (
    <View style={[styles.tile, wide && styles.tileWide, bg && { backgroundColor: bg }]}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  achBanner: {
    width: '100%',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#fbbf24',
  },
  achBannerTitle: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  achBannerItem: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  topSection: {
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  grade: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreBox: {
    backgroundColor: '#1e1e4a',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
  },
  scoreLabel: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scoreValue: {
    color: '#fbbf24',
    fontSize: 48,
    fontWeight: '800',
    marginTop: 2,
  },
  roundScoreNote: {
    color: '#a5b4fc',
    fontSize: 12,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  tile: {
    backgroundColor: '#1e1e4a',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: '45%',
  },
  tileWide: {
    width: '100%',
  },
  tileValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  tileLabel: {
    color: '#a5b4fc',
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  missedBox: {
    width: '100%',
    backgroundColor: '#1e1e4a',
    borderRadius: 16,
    padding: 14,
  },
  missedHeading: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  missedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  missedChip: {
    backgroundColor: '#2d1f3a',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  missedWord: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    alignItems: 'center',
    gap: 4,
  },
  playBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 15,
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
  homeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  homeBtnText: {
    color: '#a5b4fc',
    fontSize: 15,
    fontWeight: '600',
  },
});
