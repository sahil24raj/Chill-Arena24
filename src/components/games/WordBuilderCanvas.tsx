'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
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
  HelpCircle,
  Bot,
  Users,
  Globe
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
import { UniversalGameModeSelector } from '@/components/game-shell/UniversalGameModeSelector';
import { UniversalMatchEndModal, MatchStatItem } from '@/components/game-shell/UniversalMatchEndModal';
import { GameModeType, AIDifficulty, PlayerSetup, GameModeSelection } from '@/types/gameMode';

const TOTAL_LEVELS = 50;
const AI_ROUNDS = 5;
const PASS_AND_PLAY_ROUNDS = 6;

type LevelResultState = 'PLAYING' | 'CORRECT' | 'WRONG' | 'TIMEOUT' | 'AI_SOLVED';

export const WordBuilderCanvas: React.FC = () => {
  const { user, submitGameScore, openMultiplayerModal } = useAppStore();
  const { isFullscreen } = useGameViewport();

  // Mode Selection State
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [currentMode, setCurrentMode] = useState<GameModeType>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { id: user.id || 'p1', name: user.displayName || user.username || 'You', avatar: user.avatar || '🔤', isAI: false },
    { id: 'ai-lexi', name: 'LexiBot (MED)', avatar: '🤖', isAI: true }
  ]);

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentLevelNumber, setCurrentLevelNumber] = useState(1);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  // Turn-based & Multi-player scores
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);

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

  // AI Opponent simulation
  const [aiTimeTotal, setAiTimeTotal] = useState(15);
  const [aiTimeRemaining, setAiTimeRemaining] = useState(15);
  const aiTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // UI Feedback & Animations
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [shakeInput, setShakeInput] = useState(false);
  const [screenGlitch, setScreenGlitch] = useState(false);

  // Match End Modal State
  const [showEndModal, setShowEndModal] = useState(false);
  const [matchWinnerTitle, setMatchWinnerTitle] = useState('');
  const [matchWinnerSubtitle, setMatchWinnerSubtitle] = useState('');
  const [isMatchVictory, setIsMatchVictory] = useState(true);
  const [isMatchDraw, setIsMatchDraw] = useState(false);
  const [matchStats, setMatchStats] = useState<MatchStatItem[]>([]);

  // Load high score
  useEffect(() => {
    const stored = user.stats.highScores?.['word-builder'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (aiTimerIntervalRef.current) clearInterval(aiTimerIntervalRef.current);
    };
  }, []);

  // Compute AI solve duration based on difficulty
  const getAiSolveTime = useCallback((diff: AIDifficulty) => {
    switch (diff) {
      case 'easy':
        return Math.floor(20 + Math.random() * 8); // 20-28s
      case 'medium':
        return Math.floor(11 + Math.random() * 5); // 11-16s
      case 'hard':
        return Math.floor(5 + Math.random() * 4);  // 5-9s
    }
  }, []);

  // Start / Load a level
  const startLevel = useCallback((levelNum: number, pIndex = 0) => {
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
    setActivePlayerIndex(pIndex);

    const initialTimer = getTimerForDifficulty(data.difficulty);
    setTimeLeft(initialTimer);

    // AI timer configuration
    if (currentMode === 'ai') {
      const solveTime = getAiSolveTime(aiDifficulty);
      setAiTimeTotal(solveTime);
      setAiTimeRemaining(solveTime);
    }
  }, [currentMode, aiDifficulty, getAiSolveTime]);

  // Handle Game Start
  const handleStartGame = async () => {
    await GameSessionManager.startSession('word-builder', user);
    setStatus('PLAYING');
    setScore(0);
    setP1Score(0);
    setP2Score(0);
    setCurrentRoundNumber(1);
    setActivePlayerIndex(0);
    setStreak(0);
    setMaxStreak(0);
    setTotalCorrect(0);
    setTotalAttempts(0);
    setCurrentLevelNumber(1);
    setResultData(null);
    setShowEndModal(false);
    startLevel(1, 0);
  };

  const handlePause = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (aiTimerIntervalRef.current) clearInterval(aiTimerIntervalRef.current);
    }
  };

  const handleResume = () => {
    if (status === 'PAUSED') {
      setStatus('PLAYING');
    }
  };

  const handleRestart = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (aiTimerIntervalRef.current) clearInterval(aiTimerIntervalRef.current);
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

  // AI Opponent countdown
  useEffect(() => {
    if (status !== 'PLAYING' || resultState !== 'PLAYING' || currentMode !== 'ai') {
      if (aiTimerIntervalRef.current) clearInterval(aiTimerIntervalRef.current);
      return;
    }

    aiTimerIntervalRef.current = setInterval(() => {
      setAiTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(aiTimerIntervalRef.current!);
          handleAiSolve();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (aiTimerIntervalRef.current) clearInterval(aiTimerIntervalRef.current);
    };
  }, [status, resultState, currentMode]);

  // AI solved it first!
  const handleAiSolve = () => {
    soundFx.playWrong();
    setResultState('AI_SOLVED');
    setLastSubmittedWord(levelData.word);
    setStreak(0);
    setTotalAttempts((prev) => prev + 1);

    const aiPoints = 150 + (aiDifficulty === 'hard' ? 100 : aiDifficulty === 'medium' ? 50 : 20);
    setP2Score((prev) => prev + aiPoints);

    setFeedback({
      text: `🤖 ${players[1]?.name || 'AI'} buzzed in & solved "${levelData.word}" (+${aiPoints} pts)!`,
      type: 'error'
    });

    setScreenGlitch(true);
    setTimeout(() => setScreenGlitch(false), 800);
  };

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
      const speedBonus = timeLeft * 5;
      const totalGain = xpEarned + streakBonus + speedBonus;

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

      // Distribute points based on mode
      if (currentMode === 'pass-and-play') {
        if (activePlayerIndex === 0) {
          setP1Score((prev) => prev + totalGain);
        } else {
          setP2Score((prev) => prev + totalGain);
        }
      } else {
        setP1Score(newScore);
      }

      confetti({
        particleCount: Math.min(120, 40 + currentLevelNumber * 2),
        spread: 70,
        origin: { y: 0.6 }
      });

      // Check for match completion
      if (currentMode === 'ai' && currentRoundNumber >= AI_ROUNDS) {
        handleEndMatchAI(newScore, p2Score, newTotalCorrect, newMaxStreak);
      } else if (currentMode === 'pass-and-play' && currentRoundNumber >= PASS_AND_PLAY_ROUNDS) {
        const finalP1 = activePlayerIndex === 0 ? p1Score + totalGain : p1Score;
        const finalP2 = activePlayerIndex === 1 ? p2Score + totalGain : p2Score;
        handleEndMatchPassAndPlay(finalP1, finalP2, newTotalCorrect);
      } else if (currentLevelNumber >= TOTAL_LEVELS) {
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

  // Next Level / Round
  const handleNextLevel = () => {
    soundFx.playLevelUp();

    if (currentMode === 'ai') {
      if (currentRoundNumber >= AI_ROUNDS) {
        handleEndMatchAI(p1Score, p2Score, totalCorrect, maxStreak);
        return;
      }
      const nextRound = currentRoundNumber + 1;
      const nextLvl = currentLevelNumber + 1;
      setCurrentRoundNumber(nextRound);
      setCurrentLevelNumber(nextLvl);
      startLevel(nextLvl, 0);
      return;
    }

    if (currentMode === 'pass-and-play') {
      if (currentRoundNumber >= PASS_AND_PLAY_ROUNDS) {
        handleEndMatchPassAndPlay(p1Score, p2Score, totalCorrect);
        return;
      }
      const nextRound = currentRoundNumber + 1;
      const nextPlayerIdx = (activePlayerIndex + 1) % 2;
      const nextLvl = currentLevelNumber + 1;
      setCurrentRoundNumber(nextRound);
      setActivePlayerIndex(nextPlayerIdx);
      setCurrentLevelNumber(nextLvl);
      startLevel(nextLvl, nextPlayerIdx);
      return;
    }

    // Solo progression
    if (currentLevelNumber >= TOTAL_LEVELS) {
      handleGameVictory(score, maxStreak, totalCorrect);
      return;
    }
    const nextLvl = currentLevelNumber + 1;
    setCurrentLevelNumber(nextLvl);
    startLevel(nextLvl, 0);
  };

  // Retry Level
  const handleRetryLevel = () => {
    soundFx.playClick();
    startLevel(currentLevelNumber, activePlayerIndex);
  };

  // Finish AI Match
  const handleEndMatchAI = (finalP1: number, finalAI: number, correctCount: number, streakRecord: number) => {
    setStatus('VICTORY');
    const playerWon = finalP1 > finalAI;
    const isDraw = finalP1 === finalAI;

    if (playerWon) {
      soundFx.playVictory();
      setMatchWinnerTitle(`🎉 ${players[0].name} Crushed the AI!`);
      setMatchWinnerSubtitle(`You out-spelled ${players[1].name} by ${finalP1 - finalAI} points!`);
      setIsMatchVictory(true);
      setIsMatchDraw(false);
      confetti({ particleCount: 150, spread: 90 });
    } else if (isDraw) {
      soundFx.playLevelUp();
      setMatchWinnerTitle('🤝 Intense Vocabulary Tie!');
      setMatchWinnerSubtitle(`Both players finished dead even at ${finalP1} points.`);
      setIsMatchVictory(true);
      setIsMatchDraw(true);
    } else {
      soundFx.playWrong();
      setMatchWinnerTitle(`🤖 ${players[1].name} Won the Match!`);
      setMatchWinnerSubtitle(`The AI secured the victory by ${finalAI - finalP1} points. Rematch?`);
      setIsMatchVictory(false);
      setIsMatchDraw(false);
    }

    setMatchStats([
      { label: `${players[0].name} Score`, value: `${finalP1} pts`, highlight: playerWon },
      { label: `${players[1].name} Score`, value: `${finalAI} pts`, highlight: !playerWon && !isDraw },
      { label: 'Words Solved', value: `${correctCount} / ${AI_ROUNDS}` },
      { label: 'Max Word Streak', value: `${streakRecord} 🔥` },
      { label: 'AI Difficulty', value: aiDifficulty.toUpperCase() }
    ]);

    submitGameScore('word-builder', finalP1, playerWon);
    setShowEndModal(true);
  };

  // Finish Pass & Play Match
  const handleEndMatchPassAndPlay = (finalP1: number, finalP2: number, correctCount: number) => {
    setStatus('VICTORY');
    const p1Won = finalP1 > finalP2;
    const isDraw = finalP1 === finalP2;

    if (isDraw) {
      soundFx.playLevelUp();
      setMatchWinnerTitle('🤝 A Perfect Spell-Off Tie!');
      setMatchWinnerSubtitle(`Both players matched scores at ${finalP1} points.`);
      setIsMatchVictory(true);
      setIsMatchDraw(true);
    } else {
      soundFx.playVictory();
      const champ = p1Won ? players[0] : players[1];
      setMatchWinnerTitle(`🏆 ${champ.name} Claims Vocabulary Champion!`);
      setMatchWinnerSubtitle(`Won by ${Math.abs(finalP1 - finalP2)} points in a 6-word duel!`);
      setIsMatchVictory(true);
      setIsMatchDraw(false);
      confetti({ particleCount: 150, spread: 90 });
    }

    setMatchStats([
      { label: `${players[0].name} Score`, value: `${finalP1} pts`, highlight: p1Won },
      { label: `${players[1].name} Score`, value: `${finalP2} pts`, highlight: !p1Won && !isDraw },
      { label: 'Total Words Solved', value: `${correctCount} / ${PASS_AND_PLAY_ROUNDS}` },
      { label: 'Rounds Played', value: `${PASS_AND_PLAY_ROUNDS} Words` }
    ]);

    submitGameScore('word-builder', Math.max(finalP1, finalP2), true);
    setShowEndModal(true);
  };

  // Solo Campaign Victory
  const handleGameVictory = async (finalScore: number, finalMaxStreak: number, finalCorrect: number) => {
    soundFx.playVictory();
    setStatus('VICTORY');

    const res = await GameSessionManager.finishSession(finalScore, true, user, highScore);
    setResultData(res);
    await submitGameScore('word-builder', finalScore, true);

    if (finalScore > highScore) {
      setHighScore(finalScore);
    }

    setMatchWinnerTitle('👑 GRAND VOCABULARY MASTER!');
    setMatchWinnerSubtitle(`All 50 rigorous levels conquered with ${finalScore} Total Points!`);
    setIsMatchVictory(true);
    setIsMatchDraw(false);
    setMatchStats([
      { label: 'Final Score', value: `${finalScore} pts`, highlight: true },
      { label: 'Levels Conquered', value: `${TOTAL_LEVELS} / ${TOTAL_LEVELS}` },
      { label: 'Highest Streak', value: `${finalMaxStreak} 🔥` },
      { label: 'Total Words', value: `${finalCorrect}` }
    ]);
    setShowEndModal(true);

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

  // Handle Mode Change Confirmation
  const handleSelectMode = (selection: GameModeSelection) => {
    setShowModeSelector(false);
    if (selection.mode === 'online') {
      return;
    }

    setCurrentMode(selection.mode);
    setAiDifficulty(selection.difficulty || 'medium');
    setPlayers(selection.players);
    handleStartGame();
  };

  const progressPercent = Math.round((currentLevelNumber / TOTAL_LEVELS) * 100);
  const activePlayer = players[activePlayerIndex] || players[0];

  return (
    <GameLifecycleWrapper
      gameTitle="Word Builder Esports 🔤"
      gameId="word-builder"
      category="Mind & Vocabulary Challenge"
      instructions={[
        'Unscramble the tiles into the correct target English word.',
        currentMode === 'ai'
          ? `VS AI Mode: Race against the ${aiDifficulty.toUpperCase()} Bot across 5 words! Submit before AI buzzes in.`
          : currentMode === 'pass-and-play'
          ? 'Pass & Play: 2 Players alternate solving 6 vocabulary scrambles. Highest score wins!'
          : 'Solo Campaign: Solve 50 levels of increasing mastery (4 up to 9+ letter words).',
        'Click tiles or type directly on keyboard. Press Enter to submit.',
        'Review comprehensive dictionary definitions to sharpen vocabulary!'
      ]}
      controls={[
        { key: 'KEYBOARD / CLICK', action: 'Select Tiles' },
        { key: 'ENTER', action: 'Submit Answer / Next Level' },
        { key: 'SPACEBAR', action: 'Shuffle Tiles' },
        { key: 'BACKSPACE', action: 'Delete Last Letter' }
      ]}
      status={status}
      score={currentMode === 'pass-and-play' ? (activePlayerIndex === 0 ? p1Score : p2Score) : score}
      highScore={highScore}
      combo={streak}
      resultData={resultData}
      onStart={handleStartGame}
      onPause={handlePause}
      onResume={handleResume}
      onRestart={handleRestart}
      currentMode={currentMode}
      onSelectMode={(m) => {
        setCurrentMode(m);
        if (m === 'ai') {
          setPlayers([
            { id: user.id || 'p1', name: user.displayName || user.username || 'You', avatar: user.avatar || '🔤', isAI: false },
            { id: 'ai-lexi', name: `LexiBot (${aiDifficulty.toUpperCase()})`, avatar: '🤖', isAI: true }
          ]);
        }
      }}
      aiDifficulty={aiDifficulty}
      onSelectDifficulty={(d) => {
        setAiDifficulty(d);
        setPlayers((prev) =>
          prev.map((p) => (p.isAI ? { ...p, name: `LexiBot (${d.toUpperCase()})` } : p))
        );
      }}
      players={players}
      onOpenPassPlayConfig={() => setShowModeSelector(true)}
      onChangeMode={() => setShowModeSelector(true)}
      onExitGame={() => setStatus('MENU')}
      activePlayerInfo={
        <span className="text-[10px] font-mono text-gray-300 flex items-center gap-1">
          <span>Active:</span>
          <span className="font-bold text-white flex items-center gap-1">
            <span>{activePlayer.avatar}</span>
            <span>{activePlayer.name}</span>
          </span>
        </span>
      }
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
          {/* Multi-player score header in Pass & Play or VS AI */}
          {currentMode === 'pass-and-play' ? (
            <div className="flex items-center justify-between px-3 py-1.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs font-mono">
              <div className={`flex items-center gap-1.5 ${activePlayerIndex === 0 ? 'text-yellow-400 font-black' : 'text-slate-400'}`}>
                <span className="text-base">{players[0]?.avatar}</span>
                <span>{players[0]?.name}: {p1Score} pts</span>
              </div>
              <span className="text-purple-300 font-bold bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/40 text-[10px]">
                WORD {currentRoundNumber} / {PASS_AND_PLAY_ROUNDS}
              </span>
              <div className={`flex items-center gap-1.5 ${activePlayerIndex === 1 ? 'text-yellow-400 font-black' : 'text-slate-400'}`}>
                <span>{players[1]?.name}: {p2Score} pts</span>
                <span className="text-base">{players[1]?.avatar}</span>
              </div>
            </div>
          ) : currentMode === 'ai' ? (
            <div className="flex items-center justify-between px-3 py-1.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs font-mono">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span className="text-base">{players[0]?.avatar}</span>
                <span>{players[0]?.name}: {p1Score} pts</span>
              </div>
              <span className="text-cyan-300 font-bold bg-cyan-500/20 px-2 py-0.5 rounded-lg border border-cyan-500/40 text-[10px]">
                ROUND {currentRoundNumber} / {AI_ROUNDS}
              </span>
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <span>{players[1]?.name}: {p2Score} pts</span>
                <span className="text-base">{players[1]?.avatar}</span>
              </div>
            </div>
          ) : null}

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

          {/* AI Thinking Progress Meter in VS AI Mode */}
          {currentMode === 'ai' && resultState === 'PLAYING' && (
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>AI Solving Pace ({aiDifficulty.toUpperCase()})</span>
                </span>
                <span className="text-rose-400 font-bold">{aiTimeRemaining}s before AI buzzes</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-rose-500 to-amber-400 transition-all duration-1000 ease-linear"
                  style={{ width: `${Math.min(100, Math.max(0, ((aiTimeTotal - aiTimeRemaining) / aiTimeTotal) * 100))}%` }}
                />
              </div>
            </div>
          )}

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

            {/* Handover notification in Pass & Play */}
            {currentMode === 'pass-and-play' && (
              <div className="text-[11px] font-mono text-purple-300 font-bold bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 rounded-lg animate-pulse">
                👉 Turn: {activePlayer.name}
              </div>
            )}

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
                  key={index}
                  onClick={() => handleTileClick(index)}
                  disabled={isUsed || resultState !== 'PLAYING'}
                  className={`w-12 h-14 sm:w-16 sm:h-18 rounded-2xl font-black font-display text-xl sm:text-2xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-lg active:scale-90 ${
                    isUsed
                      ? 'bg-slate-900/40 border border-slate-850 text-slate-700 opacity-25 scale-95 shadow-none'
                      : 'bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700 text-white hover:border-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:-translate-y-1'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* 📝 ENTERED WORD INPUT DISPLAY SLOTS */}
          <div
            className={`w-full max-w-lg min-h-[64px] sm:min-h-[76px] rounded-3xl bg-slate-950/90 border-2 ${
              shakeInput
                ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.5)] animate-shake'
                : enteredWord.length > 0
                ? 'border-cyan-500/80 shadow-[0_0_25px_rgba(0,240,255,0.25)]'
                : 'border-slate-800'
            } flex items-center justify-center px-4 py-2 gap-2 flex-wrap transition-all backdrop-blur-md`}
          >
            {enteredWord.length === 0 ? (
              <span className="text-slate-600 text-xs sm:text-sm font-mono tracking-wider italic flex items-center gap-1.5">
                <span>Select letter tiles or type on keyboard...</span>
              </span>
            ) : (
              enteredWord.split('').map((char, idx) => (
                <span
                  key={idx}
                  className="w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-gradient-to-b from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 text-cyan-300 font-display font-black text-lg sm:text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.35)] animate-in zoom-in-75 duration-150"
                >
                  {char}
                </span>
              ))
            )}
          </div>

          {/* User Feedback Alert */}
          {feedback && (
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 ${
                feedback.type === 'error'
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : feedback.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
              }`}
            >
              {feedback.type === 'error' ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              ) : feedback.type === 'success' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. RESULT CARD (CORRECT / WRONG / TIMEOUT / AI_SOLVED) */}
          {/* ========================================================= */}

          {/* 🌟 CORRECT ANSWER REACTION */}
          {resultState === 'CORRECT' && (
            <div className="w-full max-w-md bg-gradient-to-b from-emerald-950/90 to-slate-950/95 border-2 border-emerald-500/80 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-[0_0_40px_rgba(16,185,129,0.35)] backdrop-blur-md animate-in zoom-in-95 duration-300">
              
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-lg animate-bounce">
                    🎉
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-300 text-sm sm:text-base tracking-wide">
                      BRILLIANT! CORRECT!
                    </h4>
                    <p className="text-[10px] font-mono text-emerald-400">
                      Target unscrambled successfully!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-xl text-xs font-mono font-black text-emerald-300">
                  +{calculateLevelXP(currentLevelNumber) + streak * 10} XP
                </div>
              </div>

              {/* Solved Word & Dictionary Definition */}
              <div className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-3 text-slate-300 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 font-black text-base sm:text-lg tracking-widest">
                    {levelData.word}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    {levelData.difficulty}
                  </span>
                </div>

                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-200 font-sans italic border-t border-slate-800/80 pt-1.5">
                  &ldquo;{levelData.meaning}&rdquo;
                </p>
              </div>

              {/* Action Button: NEXT LEVEL */}
              <button
                onClick={handleNextLevel}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-95 cursor-pointer"
              >
                <span>NEXT WORD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ❌ WRONG / TIMEOUT / AI_SOLVED REACTION */}
          {(resultState === 'WRONG' || resultState === 'TIMEOUT' || resultState === 'AI_SOLVED') && (
            <div className="w-full max-w-md bg-gradient-to-b from-rose-950/90 to-slate-950/95 border-2 border-rose-500/80 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-[0_0_40px_rgba(244,63,94,0.35)] backdrop-blur-md animate-in zoom-in-95 duration-300">
              
              <div className="flex items-center justify-between border-b border-rose-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-lg animate-bounce">
                    {resultState === 'AI_SOLVED' ? '🤖' : resultState === 'TIMEOUT' ? '⏰' : '💔'}
                  </div>
                  <div>
                    <h4 className="font-black text-rose-300 text-sm sm:text-base tracking-wide">
                      {resultState === 'AI_SOLVED'
                        ? 'AI OPPONENT BUZZED FIRST!'
                        : resultState === 'TIMEOUT'
                        ? "OH NO! TIME'S UP!"
                        : 'OH NO! WRONG ANSWER!'}
                    </h4>
                    <p className="text-[10px] font-mono text-rose-400">
                      {resultState === 'AI_SOLVED'
                        ? 'The bot cracked the anagram before you'
                        : resultState === 'TIMEOUT'
                        ? 'Clock ran out before solving'
                        : 'Word did not match target solution'}
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
                  <span>NEXT WORD</span>
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

      {/* Universal Mode Selector Modal */}
      <UniversalGameModeSelector
        isOpen={showModeSelector}
        onClose={() => setShowModeSelector(false)}
        gameTitle="Word Builder Esports"
        gameId="word-builder"
        user={user}
        onSelectMode={handleSelectMode}
      />

      {/* Universal Match End Modal */}
      <UniversalMatchEndModal
        isOpen={showEndModal}
        gameTitle="Word Builder Esports"
        gameId="word-builder"
        winnerTitle={matchWinnerTitle}
        winnerSubtitle={matchWinnerSubtitle}
        isVictory={isMatchVictory}
        isDraw={isMatchDraw}
        stats={matchStats}
        onPlayAgain={handleStartGame}
        onChangeMode={() => {
          setShowEndModal(false);
          setShowModeSelector(true);
        }}
      />
    </GameLifecycleWrapper>
  );
};
