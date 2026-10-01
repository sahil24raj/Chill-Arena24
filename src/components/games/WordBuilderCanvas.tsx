'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';
import {
  Check,
  X,
  RotateCcw,
  Sparkles,
  Lightbulb,
  ArrowRight,
  Trophy,
  Flame,
  Shuffle,
  Clock,
  BookOpen,
  Zap,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import {
  WordLevelData,
  WORD_BUILDER_LEVELS,
  getLevelData,
  scrambleWord,
  calculateLevelXP,
  getTimerForDifficulty,
  validateWordAnswer
} from '@/lib/word-builder/wordDatabase';

import { useGameViewport } from '@/lib/game-engine/useGameViewport';

const TOTAL_LEVELS = 50;

type LevelResultState = 'PLAYING' | 'CORRECT' | 'WRONG' | 'TIMEOUT';

export const WordBuilderCanvas: React.FC = () => {
  const { user, submitGameScore } = useAppStore();
  const { isFullscreen } = useGameViewport();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentLevelNumber, setCurrentLevelNumber] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  // Current Level Game State
  const [levelData, setLevelData] = useState<WordLevelData>(getLevelData(1));
  const [scrambledTiles, setScrambledTiles] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [enteredWord, setEnteredWord] = useState('');
  const [resultState, setResultState] = useState<LevelResultState>('PLAYING');
  const [lastSubmittedWord, setLastSubmittedWord] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState<number[]>([]);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(35);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // UI Feedback & Animations
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [shakeInput, setShakeInput] = useState(false);
  const [screenGlitch, setScreenGlitch] = useState(false);

  // Load high score
  useEffect(() => {
    const stored = user.stats.highScores?.['word-builder'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  // Start / Load a level
  const startLevel = useCallback((levelNum: number) => {
    const data = getLevelData(levelNum);
    setLevelData(data);
    const scrambled = scrambleWord(data.word);
    setScrambledTiles(scrambled);
    setSelectedIndices([]);
    setEnteredWord('');
    setResultState('PLAYING');
    setLastSubmittedWord('');
    setHintsRevealed([]);
    setFeedback(null);
    setShakeInput(false);
    setScreenGlitch(false);

    const initialTimer = getTimerForDifficulty(data.difficulty);
    setTimeLeft(initialTimer);
  }, []);

  // Handle Game Start
  const handleStartGame = async () => {
    await GameSessionManager.startSession('word-builder', user);
    setStatus('PLAYING');
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalCorrect(0);
    setTotalAttempts(0);
    setCurrentLevelNumber(1);
    setResultData(null);
    startLevel(1);
  };

  const handlePause = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleResume = () => {
    if (status === 'PAUSED') {
      setStatus('PLAYING');
    }
  };

  const handleRestart = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    handleStartGame();
  };

  // Timer countdown
  useEffect(() => {
    if (status !== 'PLAYING' || resultState !== 'PLAYING') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, resultState]);

  // Handle Timeout
  const handleTimeOut = () => {
    soundFx.playWrong();
    setResultState('TIMEOUT');
    setLastSubmittedWord(enteredWord || '(Time Expired)');
    setStreak(0);
    setTotalAttempts((prev) => prev + 1);
    setScreenGlitch(true);
    setTimeout(() => setScreenGlitch(false), 800);
  };

  // Shake animation trigger
  const triggerShake = () => {
    setShakeInput(true);
    setScreenGlitch(true);
    setTimeout(() => {
      setShakeInput(false);
      setScreenGlitch(false);
    }, 500);
  };

  // Tile Selection
  const handleTileClick = (index: number) => {
    if (status !== 'PLAYING' || resultState !== 'PLAYING') return;
    if (selectedIndices.includes(index)) return;

    soundFx.playClick();
    setSelectedIndices((prev) => [...prev, index]);
    setEnteredWord((prev) => prev + scrambledTiles[index]);
    GameSessionManager.recordAction();
  };

  // Backspace
  const handleBackspace = () => {
    if (status !== 'PLAYING' || resultState !== 'PLAYING') return;
    if (selectedIndices.length === 0) return;

    soundFx.playClick();
    setSelectedIndices((prev) => prev.slice(0, -1));
    setEnteredWord((prev) => prev.slice(0, -1));
  };

  // Clear
  const handleClear = () => {
    if (status !== 'PLAYING' || resultState !== 'PLAYING') return;
    soundFx.playClick();
    setSelectedIndices([]);
    setEnteredWord('');
  };

  // Shuffle
  const handleShuffle = () => {
    if (status !== 'PLAYING' || resultState !== 'PLAYING') return;
    soundFx.playSpin();
    setScrambledTiles(scrambleWord(levelData.word));
    handleClear();
  };

  // Hint
  const handleUseHint = () => {
    if (status !== 'PLAYING' || resultState !== 'PLAYING') return;
    const targetWord = levelData.word.toUpperCase();

    const unrevealedPositions: number[] = [];
    for (let i = 0; i < targetWord.length; i++) {
      if (!hintsRevealed.includes(i)) {
        unrevealedPositions.push(i);
      }
    }

    if (unrevealedPositions.length <= 1) {
      setFeedback({ text: 'Almost the entire word is revealed!', type: 'info' });
      return;
    }

    soundFx.playCoin();
    const nextPos = unrevealedPositions[0];
    const newRevealed = [...hintsRevealed, nextPos];
    setHintsRevealed(newRevealed);
    setScore((prev) => Math.max(0, prev - 10));
    setFeedback({
      text: `💡 Letter #${nextPos + 1} is "${targetWord[nextPos]}" (-10 pts)`,
      type: 'info'
    });
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (status !== 'PLAYING' || resultState !== 'PLAYING') return;

    const validation = validateWordAnswer(enteredWord, levelData);
    setTotalAttempts((prev) => prev + 1);

    if (!validation.isValid) {
      soundFx.playWrong();
      triggerShake();
      setFeedback({ text: validation.reason || 'Invalid word submission!', type: 'error' });
      return;
    }

    if (validation.isAccepted) {
      // 🌟 CORRECT ANSWER REACTION
      soundFx.playCorrect();
      const xpEarned = calculateLevelXP(currentLevelNumber);
      const streakBonus = streak * 10;
      const totalGain = xpEarned + streakBonus;

      const newScore = score + totalGain;
      const newStreak = streak + 1;
      const newMaxStreak = Math.max(maxStreak, newStreak);
      const newTotalCorrect = totalCorrect + 1;

      setScore(newScore);
      setStreak(newStreak);
      setMaxStreak(newMaxStreak);
      setTotalCorrect(newTotalCorrect);
      setLastSubmittedWord(enteredWord.toUpperCase());
      setResultState('CORRECT');
      setFeedback(null);

      confetti({
        particleCount: Math.min(120, 40 + currentLevelNumber * 2),
        spread: 70,
        origin: { y: 0.6 }
      });

      if (currentLevelNumber >= TOTAL_LEVELS) {
        handleGameVictory(newScore, newMaxStreak, newTotalCorrect);
      }
    } else {
      // 💔 WRONG ANSWER REACTION
      soundFx.playWrong();
      triggerShake();
      setLastSubmittedWord(enteredWord.toUpperCase());
      setStreak(0);
      setResultState('WRONG');
      setFeedback(null);
    }
  };

  // Next Level
  const handleNextLevel = () => {
    soundFx.playLevelUp();
    if (currentLevelNumber >= TOTAL_LEVELS) {
      handleGameVictory(score, maxStreak, totalCorrect);
      return;
    }
    const nextLvl = currentLevelNumber + 1;
    setCurrentLevelNumber(nextLvl);
    startLevel(nextLvl);
  };

  // Retry Level
  const handleRetryLevel = () => {
    soundFx.playClick();
    startLevel(currentLevelNumber);
  };

  // Victory
  const handleGameVictory = async (finalScore: number, finalMaxStreak: number, finalCorrect: number) => {
    soundFx.playVictory();
    setStatus('VICTORY');

    const res = await GameSessionManager.finishSession(finalScore, true, user, highScore);
    setResultData(res);
    await submitGameScore('word-builder', finalScore, true);

    if (finalScore > highScore) {
      setHighScore(finalScore);
    }

    confetti({
      particleCount: 180,
      spread: 100,
      origin: { y: 0.5 }
    });
  };

  // Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'PLAYING') return;

      if (resultState !== 'PLAYING') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextLevel();
        }
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitAnswer();
      } else if (e.key === 'Escape') {
        handlePause();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleShuffle();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        const char = e.key.toUpperCase();
        const availIdx = scrambledTiles.findIndex(
          (letter, idx) => letter === char && !selectedIndices.includes(idx)
        );
        if (availIdx !== -1) {
          handleTileClick(availIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, resultState, scrambledTiles, selectedIndices, enteredWord, currentLevelNumber, levelData, score, streak]);

  const progressPercent = Math.round((currentLevelNumber / TOTAL_LEVELS) * 100);

  return (
    <GameLifecycleWrapper
      gameTitle="Word Builder Esports 🔤"
      gameId="word-builder"
      category="Mind & Vocabulary Challenge"
      instructions={[
        'Unscramble the tiles into the correct target English word.',
        'Difficulty ramps up across 50 rigorous levels (4-letter words up to 9+ letter masteries).',
        'Click tiles or type directly on keyboard. Press Enter to submit.',
        'Review comprehensive dictionary definitions to sharpen vocabulary!'
      ]}
      controls={[
        { key: 'KEYBOARD / CLICK', action: 'Select Tiles' },
        { key: 'ENTER', action: 'Submit Answer / Next Level' },
        { key: 'SPACEBAR', action: 'Shuffle Tiles' },
        { key: 'BACKSPACE', action: 'Delete Last Letter' },
      ]}
      status={status}
      score={score}
      highScore={highScore}
      combo={streak}
      resultData={resultData}
      onStart={handleStartGame}
      onPause={handlePause}
      onResume={handleResume}
      onRestart={handleRestart}
    >
      <div
        className={`w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 select-none relative overflow-y-auto ${
          isFullscreen ? 'max-w-4xl' : 'max-w-2xl'
        } mx-auto transition-all duration-300 ${
          screenGlitch ? 'brightness-125 saturate-150' : ''
        }`}
      >
        {/* ========================================================= */}
        {/* 1. TOP STATUS & PROGRESS HUD */}
        {/* ========================================================= */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-mono shadow-xl backdrop-blur-md">
            {/* Level Badge */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 text-[#00F0FF] font-black tracking-wider text-xs">
                LEVEL {currentLevelNumber} / {TOTAL_LEVELS}
              </span>
              <span
                className={`hidden sm:inline-block px-2 py-0.5 rounded-lg text-[10px] uppercase font-black border ${
                  levelData.difficulty === 'Elite'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : levelData.difficulty === 'Hard'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : levelData.difficulty === 'Tough'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {levelData.difficulty}
              </span>
            </div>

            {/* Streak, XP, Timer */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div
                className={`flex items-center gap-1 font-black px-2 py-0.5 rounded-lg border ${
                  streak > 0
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse'
                    : 'bg-slate-800/60 border-slate-700 text-slate-500'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'fill-amber-400 text-amber-500' : 'text-slate-500'}`} />
                <span>{streak}</span>
              </div>

              <div className="text-white font-black">
                XP: <span className="text-emerald-400">+{calculateLevelXP(currentLevelNumber)}</span>
              </div>

              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-black text-xs border ${
                  timeLeft <= 5
                    ? 'bg-rose-500/30 border-rose-500 text-rose-300 animate-bounce'
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950/80 border border-slate-800 rounded-full h-2 p-0.5 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(0,240,255,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. MAIN PUZZLE BOARD */}
        {/* ========================================================= */}
        <div className="w-full flex flex-col items-center justify-center my-auto py-2 space-y-3.5">
          
          {/* Category & Hint Header */}
          <div className="flex items-center justify-between w-full px-2 text-slate-400 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Theme: <strong className="text-white font-bold">{levelData.category}</strong></span>
            </div>

            {resultState === 'PLAYING' && (
              <button
                onClick={handleUseHint}
                className="px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center gap-1 transition-all cursor-pointer text-[11px] active:scale-95 shadow-sm"
              >
                <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                HINT (-10 XP)
              </button>
            )}
          </div>

          {/* Hint Position Indicators */}
          {hintsRevealed.length > 0 && resultState === 'PLAYING' && (
            <div className="flex items-center gap-1.5 justify-center py-1">
              <span className="text-[11px] font-mono text-indigo-300 font-bold mr-1">HINT:</span>
              {levelData.word.split('').map((char, i) => (
                <span
                  key={i}
                  className={`w-6 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs border ${
                    hintsRevealed.includes(i)
                      ? 'bg-indigo-500/30 border-indigo-400 text-yellow-300 shadow-[0_0_8px_rgba(129,140,248,0.5)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-600'
                  }`}
                >
                  {hintsRevealed.includes(i) ? char : '_'}
                </span>
              ))}
            </div>
          )}

          {/* 🔤 SCRAMBLED LETTER TILES */}
          <div className={`flex flex-wrap items-center justify-center py-1 w-full ${
            isFullscreen ? 'max-w-3xl gap-3 sm:gap-4' : 'max-w-xl gap-2 sm:gap-3'
          }`}>
            {scrambledTiles.map((letter, index) => {
              const isUsed = selectedIndices.includes(index);
              return (
                <button
                  key={`${currentLevelNumber}-${index}`}
                  onClick={() => handleTileClick(index)}
                  disabled={isUsed || resultState !== 'PLAYING'}
                  className={`${
                    isFullscreen
                      ? 'w-14 h-16 sm:w-20 sm:h-22 text-2xl sm:text-4xl'
                      : 'w-12 h-14 sm:w-16 sm:h-18 text-2xl sm:text-3xl'
                  } rounded-2xl font-black flex items-center justify-center transition-all duration-150 border-2 shadow-xl cursor-pointer select-none ${
                    isUsed
                      ? 'bg-slate-900/30 border-slate-800/40 text-gray-600 opacity-25 scale-90'
                      : 'bg-gradient-to-b from-slate-800 to-slate-900 border-cyan-400/80 text-white hover:border-[#00F0FF] hover:scale-105 active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] sm:text-xs font-mono text-slate-400 text-center tracking-wide">
            Rearrange all <strong className="text-cyan-400 font-bold">{levelData.word.length}</strong> letters into a valid word
          </p>

          {/* 📝 USER ANSWER INPUT PREVIEW */}
          <div
            className={`w-full ${
              isFullscreen ? 'max-w-2xl h-16 sm:h-20 text-3xl sm:text-4xl' : 'max-w-md h-14 sm:h-16 text-2xl sm:text-3xl'
            } bg-slate-900/90 border-2 rounded-2xl flex items-center justify-center tracking-[0.3em] font-black transition-all shadow-xl px-4 ${
              shakeInput
                ? 'border-rose-500/90 bg-rose-950/50 text-rose-300 animate-bounce shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                : resultState === 'CORRECT'
                ? 'border-emerald-500/90 bg-emerald-950/40 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                : resultState === 'WRONG' || resultState === 'TIMEOUT'
                ? 'border-rose-500/90 bg-rose-950/40 text-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                : 'border-cyan-500/50 text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.2)]'
            }`}
          >
            {enteredWord ? (
              <span className="font-mono">{enteredWord}</span>
            ) : (
              <span className="text-slate-600 text-xs sm:text-sm tracking-normal font-mono font-medium">
                [ Click tiles or type answer ]
              </span>
            )}
          </div>

          {/* Inline Feedback / Warning */}
          {feedback && (
            <div
              className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border animate-in fade-in zoom-in-95 duration-200 text-center ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : feedback.type === 'info'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. DIVERGENT DRAMATIC REACTIONS (CORRECT VS WRONG) */}
          {/* ========================================================= */}
          
          {/* ✅ CORRECT ANSWER CELEBRATION REACTION */}
          {resultState === 'CORRECT' && (
            <div className={`w-full ${
              isFullscreen ? 'max-w-2xl' : 'max-w-md'
            } bg-gradient-to-b from-emerald-950/90 to-slate-950/95 border-2 border-emerald-500/80 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-[0_0_40px_rgba(16,185,129,0.35)] backdrop-blur-md animate-in zoom-in-95 duration-300`}>
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-lg">
                    🎉
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-300 text-sm sm:text-base tracking-wide">
                      CORRECT! BRILLIANT!
                    </h4>
                    <p className="text-[10px] font-mono text-emerald-400">Puzzle Solved Successfully</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-xl text-xs font-mono font-black text-emerald-300">
                  <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  +{calculateLevelXP(currentLevelNumber)} XP
                </div>
              </div>

              {/* Word & Meaning Box */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Word:</span>
                  <span className="text-emerald-300 font-black text-lg tracking-widest bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                    {levelData.word}
                  </span>
                </div>

                {streak > 1 && (
                  <div className="flex items-center justify-between text-amber-400 text-[11px] font-bold">
                    <span>Streak Multiplier:</span>
                    <span>🔥 {streak} in a row! (+{streak * 10} Bonus XP)</span>
                  </div>
                )}

                <div className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-3 text-slate-300 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-400" />
                    Definition & Lexicon
                  </div>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-emerald-100 font-sans italic">
                    &ldquo;{levelData.meaning}&rdquo;
                  </p>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextLevel}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-95 cursor-pointer"
              >
                <span>NEXT LEVEL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ❌ WRONG ANSWER / TIMEOUT REACTION ("Oh no! Wrong Answer!") */}
          {(resultState === 'WRONG' || resultState === 'TIMEOUT') && (
            <div className="w-full max-w-md bg-gradient-to-b from-rose-950/90 to-slate-950/95 border-2 border-rose-500/80 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-[0_0_40px_rgba(244,63,94,0.35)] backdrop-blur-md animate-in zoom-in-95 duration-300">
              
              {/* Emotive Wrong Header */}
              <div className="flex items-center justify-between border-b border-rose-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-lg animate-bounce">
                    {resultState === 'TIMEOUT' ? '⏰' : '💔'}
                  </div>
                  <div>
                    <h4 className="font-black text-rose-300 text-sm sm:text-base tracking-wide">
                      {resultState === 'TIMEOUT' ? "OH NO! TIME'S UP!" : 'OH NO! WRONG ANSWER!'}
                    </h4>
                    <p className="text-[10px] font-mono text-rose-400">
                      {resultState === 'TIMEOUT' ? 'Clock ran out before solving' : 'Word did not match target solution'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold text-rose-300">
                  🔥 Streak Reset
                </div>
              </div>

              {/* Answers Comparison & Meaning */}
              <div className="space-y-2 text-xs font-mono">
                {resultState === 'WRONG' && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Your Guess:</span>
                    <span className="text-rose-400 font-black line-through bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/30">
                      {lastSubmittedWord}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Correct Target:</span>
                  <span className="text-yellow-400 font-black text-lg tracking-widest bg-yellow-500/10 px-3 py-1 rounded-xl border border-yellow-500/30 shadow-[0_0_12px_rgba(234,179,8,0.2)]">
                    {levelData.word}
                  </span>
                </div>

                <div className="bg-slate-900/90 border border-rose-500/20 rounded-2xl p-3 text-slate-300 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-rose-400" />
                    Correct Meaning
                  </div>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-200 font-sans italic">
                    &ldquo;{levelData.meaning}&rdquo;
                  </p>
                </div>
              </div>

              {/* Action Buttons: Retry vs Next */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={handleRetryLevel}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  Retry Level
                </button>

                <button
                  onClick={handleNextLevel}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all active:scale-95 cursor-pointer"
                >
                  <span>NEXT LEVEL</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* 4. ACTIVE GAMEPLAY CONTROLS (Shuffle, Clear, Delete, Submit) */}
        {/* ========================================================= */}
        {resultState === 'PLAYING' && (
          <div className="flex items-center gap-2 sm:gap-3 w-full max-w-md pt-2">
            <button
              onClick={handleShuffle}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold border border-slate-800 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md hover:border-cyan-500/50"
              title="Shuffle Letter Tiles (Spacebar)"
            >
              <Shuffle className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={handleClear}
              className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold text-xs uppercase border border-slate-800 transition-all active:scale-95 cursor-pointer hover:border-slate-700"
            >
              CLEAR
            </button>
            <button
              onClick={handleBackspace}
              className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold text-xs uppercase border border-slate-800 transition-all active:scale-95 cursor-pointer hover:border-slate-700"
            >
              DELETE
            </button>
            <button
              onClick={handleSubmitAnswer}
              className="flex-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xl shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              SUBMIT
            </button>
          </div>
        )}

      </div>
    </GameLifecycleWrapper>
  );
};
