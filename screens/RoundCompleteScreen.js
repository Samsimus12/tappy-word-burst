import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { ACHIEVEMENTS } from '../constants/achievements';
import { showRewardedAd } from '../utils/admob';

export default function RoundCompleteScreen({ round, roundScore, totalScore, targetWord, foundSynonyms, onContinue, onBack, newAchievements = [], theme, hints = 0, onEarnHints }) {
  const [adLoading, setAdLoading] = useState(false);

  async function handleWatchAd() {
    if (adLoading) return;
    setAdLoading(true);
    const earned = await showRewardedAd();
    setAdLoading(false);
    if (earned) onEarnHints(3);
  }
  const bg = theme?.bg ?? '#0f0f2e';
  const card = theme?.card ?? '#1e1e4a';
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
        <Text style={styles.badge}>Round {round} Complete!</Text>
        <Text style={styles.emoji}>🎉</Text>

        <View style={styles.wordBox}>
          <Text style={styles.wordLabel}>You found all synonyms for</Text>
          <Text style={styles.word}>{targetWord}</Text>
        </View>

        <View style={[styles.scoresRow, { backgroundColor: card }]}>
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
          <View style={[styles.foundBox, { backgroundColor: card }]}>
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

        <TouchableOpacity
          style={[styles.adBtn, adLoading && styles.adBtnDisabled]}
          onPress={handleWatchAd}
          disabled={adLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.adBtnText}>
            {adLoading ? 'Loading ad...' : 'Watch Ad · +3 Hints'}
          </Text>
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
  },
  achBanner: {
    width: '100%',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#fbbf24',
  },
  achBannerTitle: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  achBannerItem: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 24,
  },
  badge: {
    color: '#a5b4fc',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  wordBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  wordLabel: {
    color: '#a5b4fc',
    fontSize: 14,
    marginBottom: 6,
  },
  word: {
    color: '#fbbf24',
    fontSize: 32,
    fontWeight: '800',
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e4a',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 32,
    width: '100%',
    marginBottom: 20,
  },
  scoreTile: {
    flex: 1,
    alignItems: 'center',
  },
  scoreTileValue: {
    color: '#22c55e',
    fontSize: 34,
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
    height: 44,
    backgroundColor: '#2d2d6e',
    marginHorizontal: 8,
  },
  foundBox: {
    width: '100%',
    backgroundColor: '#1e1e4a',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  foundHeading: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  foundList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  foundChip: {
    backgroundColor: '#14291f',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  foundWord: {
    color: '#86efac',
    fontSize: 13,
    fontWeight: '500',
  },
  adBtn: {
    marginTop: 10,
    paddingVertical: 11,
    paddingHorizontal: 28,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#fbbf24',
  },
  adBtnDisabled: {
    borderColor: '#4b4b70',
  },
  adBtnText: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 10,
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
    paddingVertical: 16,
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
