import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Animated, Easing } from 'react-native';
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

export default function HomeScreen({ onPlay, sfxEnabled, musicEnabled, onToggleSfx, onToggleMusic }) {
  const [selected, setSelected] = useState('medium');
  const diff = DIFFICULTY[selected];

  return (
    <SafeAreaView style={styles.container}>
      <FloatingBackground />
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
              <Text style={[styles.diffBtnSub, selected === key && styles.diffBtnTextActive]}>
                {d.duration}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: diff.color, shadowColor: diff.color }]}
          onPress={() => onPlay(selected, 'normal')}
          activeOpacity={0.85}
        >
          <Text style={styles.playBtnText}>Play</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.survivalBtn}
          onPress={() => onPlay(selected, 'survival')}
          activeOpacity={0.85}
        >
          <Text style={styles.survivalBtnTitle}>⚡ Survival Mode</Text>
          <Text style={styles.survivalBtnSub}>Solve words to add time · wrong taps cost 5s</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.fallingBtn}
          onPress={() => onPlay(selected, 'falling')}
          activeOpacity={0.85}
        >
          <Text style={styles.fallingBtnTitle}>🌊 Falling Words</Text>
          <Text style={styles.fallingBtnSub}>Tap synonyms as they fall</Text>
        </TouchableOpacity>

        <View style={styles.settingsRow}>
          <TouchableOpacity
            style={[styles.settingsBtn, sfxEnabled && styles.settingsBtnActive]}
            onPress={onToggleSfx}
            activeOpacity={0.8}
          >
            <Text style={[styles.settingsBtnText, sfxEnabled && styles.settingsBtnTextActive]}>
              SFX {sfxEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingsBtn, musicEnabled && styles.settingsBtnActive]}
            onPress={onToggleMusic}
            activeOpacity={0.8}
          >
            <Text style={[styles.settingsBtnText, musicEnabled && styles.settingsBtnTextActive]}>
              Music {musicEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2d2d6e',
  },
  dividerText: {
    color: '#4b4b70',
    fontSize: 13,
    fontWeight: '600',
  },
  survivalBtn: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: '#1e1e4a',
    borderWidth: 2,
    borderColor: '#f43f5e',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  survivalBtnTitle: {
    color: '#f43f5e',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  survivalBtnSub: {
    color: '#a5b4fc',
    fontSize: 12,
    marginTop: 4,
  },
  fallingBtn: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: '#0e2a3a',
    borderWidth: 2,
    borderColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  fallingBtnTitle: {
    color: '#22d3ee',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fallingBtnSub: {
    color: '#a5b4fc',
    fontSize: 12,
    marginTop: 4,
  },
  settingsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  settingsBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#4b4b70',
    backgroundColor: 'transparent',
  },
  settingsBtnActive: {
    borderColor: '#6366f1',
    backgroundColor: '#1e1e4a',
  },
  settingsBtnText: {
    color: '#4b4b70',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  settingsBtnTextActive: {
    color: '#a5b4fc',
  },
});
