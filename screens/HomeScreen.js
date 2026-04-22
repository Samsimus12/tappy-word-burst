import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Animated, Easing, Modal } from 'react-native';
import { DIFFICULTY } from '../constants/difficulty';

const { width: SW, height: SH } = Dimensions.get('window');

const BG_WORDS = [
  'swift', 'happy', 'brave', 'clever', 'vivid', 'ardent', 'nimble', 'serene',
  'astute', 'mellow', 'candid', 'tender', 'bright', 'rapid', 'placid', 'bold',
  'keen', 'witty', 'calm', 'sharp', 'joyful', 'brisk', 'agile', 'fierce',
  'graceful', 'radiant', 'daring', 'tranquil', 'lively', 'gentle', 'cunning',
  'fearless', 'cheerful', 'subtle', 'valiant', 'sprightly', 'luminous', 'zeal',
  'elated', 'stoic', 'vibrant',
];

function BgWord({ word, x, y, fontSize, opacity }) {
  const driftY = useRef(new Animated.Value(0)).current;
  const driftX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    const easing = Easing.inOut(Easing.quad);

    const drift = (value, range) => {
      if (!active) return;
      Animated.timing(value, {
        toValue: (Math.random() - 0.5) * range,
        duration: 900 + Math.random() * 900,
        easing,
        useNativeDriver: true,
      }).start(({ finished }) => { if (finished) drift(value, range); });
    };

    drift(driftX, 40);
    drift(driftY, 50);

    return () => { active = false; };
  }, []);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: x,
        top: y,
        color: '#a5b4fc',
        opacity,
        fontSize,
        fontWeight: '700',
        transform: [{ translateX: driftX }, { translateY: driftY }],
      }}
    >
      {word}
    </Animated.Text>
  );
}

function FloatingBackground() {
  const items = useRef(
    BG_WORDS.map(word => ({
      word,
      x: Math.random() * (SW - 100),
      y: Math.random() * (SH - 40),
      fontSize: 13 + Math.random() * 10,
      opacity: 0.05 + Math.random() * 0.07,
    }))
  ).current;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((item, i) => (
        <BgWord key={i} {...item} />
      ))}
    </View>
  );
}

const MODES = [
  { key: 'normal',   label: 'Standard',  icon: '🎯', sub: 'Score synonyms before time runs out', color: null },
  { key: 'survival', label: 'Survival',   icon: '⚡', sub: 'Solve words to add time · wrong taps cost 5s', color: '#f43f5e' },
  { key: 'falling',  label: 'Falling Words',  icon: '🌊', sub: 'Tap synonyms as they fall', color: '#22d3ee' },
];

export default function HomeScreen({ onPlay, sfxEnabled, musicEnabled, onToggleSfx, onToggleMusic, onOpenAchievements, theme }) {
  const [selected, setSelected] = useState('medium');
  const [modeIndex, setModeIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const diff = DIFFICULTY[selected];
  const currentMode = MODES[modeIndex];
  const modeColor = diff.color;
  const bg = theme?.bg ?? '#0f0f2e';
  const card = theme?.card ?? '#1e1e4a';
  const accent = theme?.accent ?? '#6366f1';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <FloatingBackground />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={onOpenAchievements} style={styles.topBarBtn} hitSlop={12} activeOpacity={0.7}>
          <Text style={styles.topBarIcon}>🏆</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.topBarBtn} hitSlop={12} activeOpacity={0.7}>
          <Text style={styles.topBarIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Tappy{'\n'}Word</Text>
        <Text style={styles.subtitle}>How many synonyms can you find?</Text>

        <Text style={styles.diffLabel}>Difficulty</Text>
        <View style={styles.diffRow}>
          {Object.entries(DIFFICULTY).map(([key, d]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.diffBtn,
                { borderColor: d.color },
                selected === key && { backgroundColor: d.color },
              ]}
              onPress={() => setSelected(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.diffBtnText, selected === key && styles.diffBtnTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.diffLabel}>Mode</Text>
        <View style={[styles.modeSelector, { borderColor: modeColor }]}>
          <TouchableOpacity
            onPress={() => setModeIndex(i => (i + MODES.length - 1) % MODES.length)}
            hitSlop={12}
            activeOpacity={0.6}
          >
            <Text style={[styles.modeArrow, { color: currentMode.color ?? modeColor }]}>‹</Text>
          </TouchableOpacity>
          <View style={styles.modeCard}>
            <Text style={styles.modeIcon}>{currentMode.icon}</Text>
            <Text style={[styles.modeName, { color: currentMode.color ?? modeColor }]}>{currentMode.label}</Text>
            <Text style={styles.modeSub}>{currentMode.sub}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setModeIndex(i => (i + 1) % MODES.length)}
            hitSlop={12}
            activeOpacity={0.6}
          >
            <Text style={[styles.modeArrow, { color: currentMode.color ?? modeColor }]}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modeDots}>
          {MODES.map((_, i) => (
            <View key={i} style={[styles.modeDot, i === modeIndex && { backgroundColor: modeColor }]} />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: modeColor, shadowColor: modeColor }]}
          onPress={() => onPlay(selected, currentMode.key)}
          activeOpacity={0.85}
        >
          <Text style={styles.playBtnText}>Play</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showSettings} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSettings(false)}>
          <View style={[styles.settingsModal, { backgroundColor: card }]} onStartShouldSetResponder={() => true}>
            <Text style={styles.settingsModalTitle}>Settings</Text>

            <TouchableOpacity
              style={[styles.settingsToggle, sfxEnabled && { borderColor: accent }]}
              onPress={onToggleSfx}
              activeOpacity={0.8}
            >
              <View style={styles.settingsToggleLeft}>
                <Text style={styles.settingsToggleIcon}>🔊</Text>
                <Text style={styles.settingsToggleLabel}>Sound Effects</Text>
              </View>
              <View style={[styles.pill, sfxEnabled && { backgroundColor: accent }]}>
                <Text style={[styles.pillText, sfxEnabled && styles.pillTextOn]}>
                  {sfxEnabled ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingsToggle, musicEnabled && { borderColor: accent }]}
              onPress={onToggleMusic}
              activeOpacity={0.8}
            >
              <View style={styles.settingsToggleLeft}>
                <Text style={styles.settingsToggleIcon}>🎵</Text>
                <Text style={styles.settingsToggleLabel}>Music</Text>
              </View>
              <View style={[styles.pill, musicEnabled && { backgroundColor: accent }]}>
                <Text style={[styles.pillText, musicEnabled && styles.pillTextOn]}>
                  {musicEnabled ? 'ON' : 'OFF'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsDoneBtn} onPress={() => setShowSettings(false)} activeOpacity={0.8}>
              <Text style={[styles.settingsDoneText, { color: accent }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  topBarBtn: {
    padding: 6,
  },
  topBarIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  title: {
    fontSize: 52,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 58,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#a5b4fc',
    textAlign: 'center',
    marginBottom: 40,
  },
  diffLabel: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
    width: '100%',
  },
  diffBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  diffBtnText: {
    color: '#e0e7ff',
    fontSize: 15,
    fontWeight: '700',
  },
  diffBtnSub: {
    color: '#a5b4fc',
    fontSize: 11,
    marginTop: 2,
  },
  diffBtnTextActive: {
    color: '#fff',
  },
  playBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 8,
  },
  modeArrow: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
    width: 24,
    textAlign: 'center',
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  modeIcon: {
    fontSize: 28,
  },
  modeName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeSub: {
    color: '#a5b4fc',
    fontSize: 12,
    textAlign: 'center',
  },
  modeDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  modeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2d2d6e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsModal: {
    width: '82%',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 14,
  },
  settingsModalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  settingsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#2d2d6e',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingsToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsToggleIcon: {
    fontSize: 20,
  },
  settingsToggleLabel: {
    color: '#e0e7ff',
    fontSize: 16,
    fontWeight: '600',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#2d2d6e',
  },
  pillText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pillTextOn: {
    color: '#fff',
  },
  settingsDoneBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 4,
  },
  settingsDoneText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
