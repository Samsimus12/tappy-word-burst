import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { ACHIEVEMENTS, THEMES } from '../constants/achievements';

export default function AchievementsScreen({ unlockedIds, selectedTheme, onSelectTheme, onBack, theme }) {
  const unlockedSet = new Set(unlockedIds);
  const unlockedThemes = new Set([
    'default',
    ...ACHIEVEMENTS
      .filter(a => unlockedSet.has(a.id) && a.unlocksTheme)
      .map(a => a.unlocksTheme),
  ]);
  const unlockedCount = unlockedIds.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.header, borderBottomColor: theme.card }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Text style={[styles.backText, { color: theme.accent }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <Text style={[styles.headerCount, { color: theme.accent }]}>{unlockedCount}/{ACHIEVEMENTS.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={[styles.sectionLabel, { color: theme.accent }]}>Themes</Text>
        <View style={styles.themesGrid}>
          {Object.values(THEMES).map(t => {
            const isUnlocked = unlockedThemes.has(t.id);
            const isSelected = selectedTheme === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => isUnlocked && onSelectTheme(t.id)}
                activeOpacity={isUnlocked ? 0.75 : 1}
                style={[
                  styles.themeTile,
                  { backgroundColor: t.bg, borderColor: isSelected ? '#fff' : t.bubble },
                  isSelected && styles.themeTileSelected,
                  !isUnlocked && styles.themeTileLocked,
                ]}
              >
                <View style={[styles.accentDot, { backgroundColor: t.accent }]} />
                <Text style={styles.themeLabel}>{t.label}</Text>
                {isSelected && <Text style={styles.themeCheck}>✓</Text>}
                {!isUnlocked && (
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.accent }]}>Achievements</Text>
        <View style={styles.achGrid}>
          {ACHIEVEMENTS.map(a => {
            const isUnlocked = unlockedSet.has(a.id);
            const themeUnlock = a.unlocksTheme ? THEMES[a.unlocksTheme] : null;
            return (
              <View
                key={a.id}
                style={[
                  styles.achTile,
                  { backgroundColor: theme.card },
                  isUnlocked && { borderColor: theme.accent, borderWidth: 1.5 },
                  !isUnlocked && styles.achTileLocked,
                ]}
              >
                <Text style={[styles.achIcon, !isUnlocked && styles.achIconLocked]}>{a.icon}</Text>
                <Text style={[styles.achLabel, !isUnlocked && styles.achLabelLocked]}>{a.label}</Text>
                <Text style={[styles.achDesc, !isUnlocked && styles.achDescLocked]}>{a.desc}</Text>
                {themeUnlock && (
                  <View style={[styles.themeTag, { backgroundColor: themeUnlock.accent + '22' }]}>
                    <View style={[styles.themeTagDot, { backgroundColor: themeUnlock.accent }]} />
                    <Text style={[styles.themeTagText, { color: themeUnlock.accent }]}>
                      Unlocks {themeUnlock.label}
                    </Text>
                  </View>
                )}
                {isUnlocked && (
                  <View style={[styles.unlockedBadge, { backgroundColor: theme.accent }]}>
                    <Text style={styles.unlockedBadgeText}>✓</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    minWidth: 60,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  headerCount: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'right',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 8,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  themeTile: {
    width: '22%',
    aspectRatio: 0.9,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  themeTileSelected: {
    borderWidth: 2.5,
  },
  themeTileLocked: {
    opacity: 0.55,
  },
  accentDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginBottom: 5,
  },
  themeLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  themeCheck: {
    position: 'absolute',
    top: 4,
    right: 6,
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
  },
  lockIcon: {
    fontSize: 18,
  },
  achGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achTile: {
    width: '47%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  achTileLocked: {
    opacity: 0.5,
  },
  achIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  achIconLocked: {
    opacity: 0.5,
  },
  achLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  achLabelLocked: {
    color: '#888',
  },
  achDesc: {
    color: '#a5b4fc',
    fontSize: 11,
    lineHeight: 15,
  },
  achDescLocked: {
    color: '#555',
  },
  themeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 7,
    alignSelf: 'flex-start',
  },
  themeTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  themeTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  unlockedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
});
