import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import RoundCompleteScreen from './screens/RoundCompleteScreen';
import ResultsScreen from './screens/ResultsScreen';
import { buildWordPool } from './utils/wordPool';
import { initQueue } from './utils/wordQueue';
import { loadHints, saveHints } from './utils/hintStorage';

export default function App() {
  const [hints, setHints] = useState(0);

  useEffect(() => {
    buildWordPool().then(initQueue).catch(() => {});
    loadHints().then(setHints).catch(() => {});
  }, []);

  function handleUseHint() {
    const next = Math.max(0, hints - 1);
    setHints(next);
    saveHints(next).catch(() => {});
  }

  function handleEarnHints(amount) {
    const next = hints + amount;
    setHints(next);
    saveHints(next).catch(() => {});
  }

  const [screen, setScreen] = useState('home');
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [result, setResult] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');

  function handlePlay(selectedDifficulty) {
    setDifficulty(selectedDifficulty);
    setScreen('game');
  }

  function handleGameEnd(gameResult) {
    if (gameResult.allFound) {
      setLastResult(gameResult);
      setTotalScore(prev => prev + gameResult.roundScore);
      setScreen('round-complete');
    } else {
      setResult({ ...gameResult, totalScore: totalScore + gameResult.roundScore });
      setScreen('results');
    }
  }

  function handleContinue() {
    setRound(prev => prev + 1);
    setScreen('game');
  }

  function handleBack() {
    setRound(1);
    setTotalScore(0);
    setLastResult(null);
    setResult(null);
    setScreen('home');
  }

  return (
    <>
      <StatusBar style="light" />
      {screen === 'home' && (
        <HomeScreen onPlay={handlePlay} />
      )}
      {screen === 'game' && (
        <GameScreen
          key={`round-${round}`}
          onGameEnd={handleGameEnd}
          onBack={handleBack}
          totalScore={totalScore}
          round={round}
          difficulty={difficulty}
          hints={hints}
          onUseHint={handleUseHint}
          onEarnHints={handleEarnHints}
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
        />
      )}
      {screen === 'results' && (
        <ResultsScreen result={result} onPlayAgain={handleBack} />
      )}
    </>
  );
}
