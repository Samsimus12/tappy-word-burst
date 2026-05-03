import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoadingScreen from './screens/LoadingScreen';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import RoundCompleteScreen from './screens/RoundCompleteScreen';
import ResultsScreen from './screens/ResultsScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import { buildWordPool } from './utils/wordPool';
import { initQueue } from './utils/wordQueue';
import { loadHints, saveHints } from './utils/hintStorage';
import { loadSettings, saveSettings } from './utils/settingsStorage';
import { loadAchievementData, saveAchievementData } from './utils/achievementStorage';
import { initAudio, setSfxEnabled, setMusicEnabled, startMenuMusic, stopMenuMusic, startMusic, stopMusic } from './utils/audio';
import { ACHIEVEMENTS, THEMES } from './constants/achievements';
import { preloadInterstitial, showInterstitial } from './utils/admob';

export default function App() {
  const [hints, setHints] = useState(0);
  const [sfxEnabled, setSfx] = useState(true);
  const [musicEnabled, setMusic] = useState(true);
  const audioReady = useRef(false);
  const [screen, setScreen] = useState('loading');

  const nextAdRoundRef = useRef(Math.floor(Math.random() * 4) + 3);
  const watchedRewardedAdRef = useRef(false);
  const secondChanceUsedRef = useRef(false);

  const [achData, setAchData] = useState({ unlockedIds: [], selectedTheme: 'default', modesPlayed: [] });
  const achDataRef = useRef(achData);
  useEffect(() => { achDataRef.current = achData; }, [achData]);

  const [newAchievements, setNewAchievements] = useState([]);

  const theme = THEMES[achData.selectedTheme] ?? THEMES.default;

  useEffect(() => {
    const timer = setTimeout(() => setScreen('home'), 3000);
    buildWordPool().then(initQueue).catch(() => {});
    preloadInterstitial();
    loadHints().then(setHints).catch(() => {});
    loadAchievementData().then(setAchData).catch(() => {});
    initAudio().then(() => {
      loadSettings().then(s => {
        setSfx(s.sfxEnabled);
        setMusic(s.musicEnabled);
        setSfxEnabled(s.sfxEnabled);
        setMusicEnabled(s.musicEnabled);
        audioReady.current = true;
        if (s.musicEnabled) startMenuMusic();
      }).catch(() => {});
    }).catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!audioReady.current) return;
    if (screen === 'home') {
      stopMusic().then(() => startMenuMusic());
    } else if (screen === 'game') {
      stopMenuMusic();
    } else if (screen === 'results') {
      stopMusic();
    }
  }, [screen]);

  function handleToggleSfx() {
    const next = !sfxEnabled;
    setSfx(next);
    setSfxEnabled(next);
    saveSettings({ sfxEnabled: next, musicEnabled }).catch(() => {});
  }

  function handleToggleMusic() {
    const next = !musicEnabled;
    setMusic(next);
    setMusicEnabled(next);
    if (!next) {
      stopMusic();
      stopMenuMusic();
    } else {
      if (screen === 'home') startMenuMusic();
      else if (screen === 'game') startMusic();
    }
    saveSettings({ sfxEnabled, musicEnabled: next }).catch(() => {});
  }

  function handleUseHint() {
    const next = Math.max(0, hints - 1);
    setHints(next);
    saveHints(next).catch(() => {});
  }

  function handleEarnHints(amount) {
    const next = hints + amount;
    setHints(next);
    saveHints(next).catch(() => {});
    watchedRewardedAdRef.current = true;
  }

  function handleResetHints() {
    setHints(10);
    saveHints(10).catch(() => {});
  }

  function handleThemeChange(themeId) {
    const next = { ...achDataRef.current, selectedTheme: themeId };
    setAchData(next);
    saveAchievementData(next).catch(() => {});
  }

  function checkAndGrantAchievements(result, finalScore, round, difficulty) {
    const { mode, wrongTaps, wordsSolved, allFound, timeLeft } = result;
    const current = achDataRef.current;

    const newModesPlayed = Array.from(new Set([...current.modesPlayed, mode]));
    const alreadyUnlocked = new Set(current.unlockedIds);
    const toUnlock = [];

    const check = (id, condition) => {
      if (!alreadyUnlocked.has(id) && condition) toUnlock.push(id);
    };

    check('first_game',  true);
    check('clean_sweep', allFound && wrongTaps === 0);
    check('speed_demon', allFound && timeLeft >= 15);
    check('hard_hero',   allFound && difficulty === 'hard');
    check('explorer',    newModesPlayed.length >= 3);
    check('survival_5',  mode === 'survival' && wordsSolved >= 5);
    check('survival_10', mode === 'survival' && wordsSolved >= 10);
    check('score_500',   finalScore >= 500);
    check('score_1000',  finalScore >= 1000);
    check('round_5',     mode === 'normal' && allFound && round >= 5);

    const modesChanged = newModesPlayed.length !== current.modesPlayed.length;
    if (toUnlock.length === 0 && !modesChanged) return;

    const next = {
      ...current,
      unlockedIds: [...current.unlockedIds, ...toUnlock],
      modesPlayed: newModesPlayed,
    };
    setAchData(next);
    saveAchievementData(next).catch(() => {});

    if (toUnlock.length > 0) {
      setNewAchievements(toUnlock);
    }
  }

  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [result, setResult] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [mode, setMode] = useState('normal');

  function handlePlay(selectedDifficulty, selectedMode = 'normal') {
    setDifficulty(selectedDifficulty);
    setMode(selectedMode);
    setNewAchievements([]);
    setScreen('game');
  }

  function handleGameEnd(gameResult) {
    const finalScore = totalScore + gameResult.roundScore;
    checkAndGrantAchievements(gameResult, finalScore, round, difficulty);

    if (gameResult.allFound) {
      setLastResult(gameResult);
      setTotalScore(prev => prev + gameResult.roundScore);
      setScreen('round-complete');
    } else {
      setResult({ ...gameResult, totalScore: finalScore });
      setScreen('results');
    }
  }

  async function handleContinue() {
    if (round >= nextAdRoundRef.current && !watchedRewardedAdRef.current) {
      stopMusic();
      await showInterstitial();
      nextAdRoundRef.current = round + Math.floor(Math.random() * 4) + 3;
    }
    watchedRewardedAdRef.current = false;
    setRound(prev => prev + 1);
    setScreen('game');
  }

  function handleBack() {
    setRound(1);
    setTotalScore(0);
    setLastResult(null);
    setResult(null);
    setNewAchievements([]);
    nextAdRoundRef.current = Math.floor(Math.random() * 4) + 3;
    watchedRewardedAdRef.current = false;
    secondChanceUsedRef.current = false;
    setScreen('home');
  }

  function handlePlayAgain() {
    setRound(1);
    setTotalScore(0);
    setLastResult(null);
    setResult(null);
    setNewAchievements([]);
    nextAdRoundRef.current = Math.floor(Math.random() * 4) + 3;
    watchedRewardedAdRef.current = false;
    secondChanceUsedRef.current = false;
    setScreen('game');
  }

  return (
    <>
      <StatusBar style="light" />
      {screen === 'loading' && (
        <LoadingScreen theme={theme} />
      )}
      {screen === 'home' && (
        <HomeScreen
          onPlay={handlePlay}
          sfxEnabled={sfxEnabled}
          musicEnabled={musicEnabled}
          onToggleSfx={handleToggleSfx}
          onToggleMusic={handleToggleMusic}
          onOpenAchievements={() => setScreen('achievements')}
          theme={theme}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          key={`round-${round}`}
          onGameEnd={handleGameEnd}
          onBack={handleBack}
          totalScore={totalScore}
          round={round}
          difficulty={difficulty}
          mode={mode}
          hints={hints}
          onUseHint={handleUseHint}
          onEarnHints={handleEarnHints}
          onResetHints={handleResetHints}
          theme={theme}
          secondChanceAvailable={!secondChanceUsedRef.current}
          onSecondChanceUsed={() => { secondChanceUsedRef.current = true; }}
        />
      )}
      {screen === 'round-complete' && (
        <RoundCompleteScreen
          round={round}
          roundScore={lastResult?.roundScore ?? 0}
          totalScore={totalScore}
          targetWord={lastResult?.targetWord ?? ''}
          foundSynonyms={lastResult?.foundSynonyms ?? []}
          onContinue={handleContinue}
          onBack={handleBack}
          newAchievements={newAchievements}
          theme={theme}
          hints={hints}
          onEarnHints={handleEarnHints}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen
          result={result}
          onPlayAgain={handlePlayAgain}
          onHome={handleBack}
          newAchievements={newAchievements}
          theme={theme}
        />
      )}
      {screen === 'achievements' && (
        <AchievementsScreen
          unlockedIds={achData.unlockedIds}
          selectedTheme={achData.selectedTheme}
          onSelectTheme={handleThemeChange}
          onBack={() => setScreen('home')}
          theme={theme}
        />
      )}
    </>
  );
}
