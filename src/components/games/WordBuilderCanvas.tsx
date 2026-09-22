'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';
import { Check, X, RotateCcw, Sparkles, Lightbulb, BookOpen, ArrowRight, Trophy, Zap, HelpCircle, Shuffle } from 'lucide-react';
import {
  WordPuzzleLevel,
  PUZZLE_LEVELS,
  getRandomPuzzleLevel,
  getAllValidWordsForPool
} from '@/lib/word-builder/wordDatabase';

export const WordBuilderCanvas: React.FC = () => {
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  // Puzzle State
  const [currentLevel, setCurrentLevel] = useState<WordPuzzleLevel>(PUZZLE_LEVELS[0]);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [bonusWords, setBonusWords] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintLetters, setHintLetters] = useState<Record<string, number>>({});

  // Solutions Modal State (as requested: "uske baad tum sol batana")
  const [showSolutionsModal, setShowSolutionsModal] = useState(false);

  // UI Feedback
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'bonus' } | null>(null);
  const [shakeInput, setShakeInput] = useState(false);
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load high score
  useEffect(() => {
    const stored = user.stats.highScores?.['word-builder'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  // Scramble letters helper
  const shuffleArray = (arr: string[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const initLevel = (level: WordPuzzleLevel) => {
    setCurrentLevel(level);
    setScrambledLetters(shuffleArray(level.letters));
    setSelectedIndices([]);
    setCurrentWord('');
    setFoundWords([]);
    setBonusWords([]);
    setHintsUsed(0);
    setHintLetters({});
    setShowSolutionsModal(false);
    setFeedback(null);
  };

  const handleStartGame = async () => {
    await GameSessionManager.startSession('word-builder', user);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setResultData(null);
    initLevel(getRandomPuzzleLevel());
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
    if (status !== 'PLAYING') return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          onGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, score, highScore]);

  const onGameOver = async () => {
    soundFx.playGameOver();
    const isWin = foundWords.length >= Math.ceil(currentLevel.targetWords.length * 0.5);
    setStatus(isWin ? 'VICTORY' : 'GAMEOVER');

    const res = await GameSessionManager.finishSession(score, isWin, user, highScore);
    setResultData(res);
    await submitGameScore('word-builder', score, isWin);

    if (score > highScore) {
      setHighScore(score);
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  // User interactions
  const handleTileClick = (idx: number) => {
    if (status !== 'PLAYING') return;
    if (selectedIndices.includes(idx)) return;

    soundFx.playClick();
    setSelectedIndices((prev) => [...prev, idx]);
    setCurrentWord((prev) => prev + scrambledLetters[idx]);
    GameSessionManager.recordAction();
  };

  const handleBackspace = () => {
    if (selectedIndices.length === 0) return;
    soundFx.playClick();
    setSelectedIndices((prev) => prev.slice(0, -1));
    setCurrentWord((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    soundFx.playClick();
    setSelectedIndices([]);
    setCurrentWord('');
  };

  const handleShuffleTiles = () => {
    soundFx.playSpin();
    setScrambledLetters(shuffleArray(scrambledLetters));
    handleClear();
  };

  const handleUseHint = () => {
    if (status !== 'PLAYING') return;
    // Find first unsolved target word
    const unsolved = currentLevel.targetWords.find((tw) => !foundWords.includes(tw));
    if (!unsolved) {
      setFeedback({ text: 'All main target words already discovered! 🏆', type: 'success' });
      return;
    }

    soundFx.playCoin();
    setHintsUsed((prev) => prev + 1);
    setHintLetters((prev) => ({
      ...prev,
      [unsolved]: (prev[unsolved] || 0) + 1
    }));
    setFeedback({ text: `💡 Hint revealed for a ${unsolved.length}-letter word!`, type: 'bonus' });
  };

  const handleSubmitWord = () => {
    if (currentWord.length < 3) {
      soundFx.playWrong();
      triggerShake();
      setFeedback({ text: 'Word must be at least 3 letters long!', type: 'error' });
      return;
    }

    const wordUpper = currentWord.toUpperCase();

    if (foundWords.includes(wordUpper) || bonusWords.includes(wordUpper)) {
      soundFx.playWrong();
      triggerShake();
      setFeedback({ text: `"${wordUpper}" has already been found!`, type: 'error' });
      return;
    }

    const validPoolWords = getAllValidWordsForPool(currentLevel);

    if (currentLevel.targetWords.includes(wordUpper)) {
      // Primary Target Word Found!
      soundFx.playCorrect();
      const pts = wordUpper.length * 50 + combo * 25;
      const newScore = score + pts;
      const newCombo = combo + 1;
      const updatedFound = [...foundWords, wordUpper];

      setScore(newScore);
      setCombo(newCombo);
      setFoundWords(updatedFound);
      setFeedback({ text: `🎯 +${pts} pts! "${wordUpper}" solved!`, type: 'success' });

      if (wordUpper.length >= 5) {
        confetti({ particleCount: 35, spread: 55 });
      }

      handleClear();

      // Check if all target words solved
      if (updatedFound.length === currentLevel.targetWords.length) {
        soundFx.playLevelUp();
        confetti({ particleCount: 80, spread: 70 });
        setScore((s) => s + 500); // Level clear bonus
        setFeedback({ text: `🌟 ALL TARGET WORDS SOLVED! +500 Level Bonus!`, type: 'success' });
      }
    } else if (validPoolWords.has(wordUpper)) {
      // Valid Bonus Sub-Word
      soundFx.playCorrect();
      const pts = wordUpper.length * 20;
      setScore((s) => s + pts);
      setBonusWords([...bonusWords, wordUpper]);
      setFeedback({ text: `⭐ +${pts} Bonus! Extra word "${wordUpper}" stored in lexicon!`, type: 'bonus' });
      handleClear();
    } else {
      // Invalid Word
      soundFx.playWrong();
      setCombo(0);
      triggerShake();
      setFeedback({ text: `"${wordUpper}" is not in this puzzle dictionary.`, type: 'error' });
      handleClear();
    }
  };

  const triggerShake = () => {
    setShakeInput(true);
    setTimeout(() => setShakeInput(false), 500);
  };

  const handleNextPuzzle = () => {
    soundFx.playLevelUp();
    initLevel(getRandomPuzzleLevel());
  };

  // Keyboard typing listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'PLAYING') return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitWord();
      } else if (e.key === 'Escape') {
        handlePause();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleShuffleTiles();
      } else {
        const char = e.key.toUpperCase();
        const availableIndex = scrambledLetters.findIndex(
          (l, i) => l === char && !selectedIndices.includes(i)
        );
        if (availableIndex !== -1) {
          handleTileClick(availableIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, scrambledLetters, selectedIndices, currentWord, foundWords, bonusWords, combo, score, currentLevel]);

  // Calculate total possible solutions
  const totalSolutionsCount = Object.values(currentLevel.allSolutions).reduce(
    (acc, list) => acc + list.length,
    0
  );

  return (
    <GameLifecycleWrapper
      gameTitle="Word Builder Pro 🔤"
      gameId="word-builder"
      category="Mind & Vocabulary Esports"
      instructions={[
        'Unscramble the letters to form valid English words.',
        'Target words fill the crossword slots. Extra words add bonus points!',
        'Click "💡 Reveal Solutions" anytime or after the round to view the full anagram dictionary & definitions.',
      ]}
      controls={[
        { key: 'KEYBOARD / CLICK', action: 'Form Words' },
        { key: 'ENTER', action: 'Submit Guess' },
        { key: 'SPACEBAR', action: 'Shuffle Tiles' },
        { key: 'BACKSPACE', action: 'Delete' },
      ]}
      status={status}
      score={score}
      highScore={highScore}
      combo={combo}
      resultData={resultData}
      onStart={handleStartGame}
      onPause={handlePause}
      onResume={handleResume}
      onRestart={handleRestart}
    >
      <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 select-none relative overflow-y-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between w-full max-w-xl px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-mono shadow-lg">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-black">
              ⏳ {timeLeft}s
            </span>
            <span className="text-slate-400 hidden sm:inline">Theme: <strong className="text-cyan-400">{currentLevel.theme}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUseHint}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center gap-1 transition-all cursor-pointer text-[11px]"
              title="Reveal 1 letter in target word"
            >
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              HINT
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setShowSolutionsModal(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-[#00F0FF] font-bold flex items-center gap-1 transition-all cursor-pointer text-[11px]"
              title="View all anagram answers and word definitions"
            >
              <BookOpen className="w-3.5 h-3.5" />
              SOLUTIONS ({foundWords.length}/{currentLevel.targetWords.length})
            </button>
          </div>
        </div>

        {/* Target Words Crossword / Slot Grid Display */}
        <div className="w-full max-w-xl my-2 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2.5">
            <span>TARGET WORDS ({foundWords.length}/{currentLevel.targetWords.length} Solved)</span>
            <span className="text-amber-400">Bonus: +{bonusWords.length}</span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {currentLevel.targetWords.map((tw) => {
              const isFound = foundWords.includes(tw);
              const revealedCount = hintLetters[tw] || 0;

              return (
                <div
                  key={tw}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all duration-300 font-mono font-black text-sm tracking-widest ${
                    isFound
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-in zoom-in-95'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {tw.split('').map((char, charIdx) => {
                    if (isFound) {
                      return <span key={charIdx}>{char}</span>;
                    }
                    if (charIdx < revealedCount) {
                      return <span key={charIdx} className="text-yellow-400 font-bold">{char}</span>;
                    }
                    return <span key={charIdx} className="opacity-40">_</span>;
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Active Word Input Preview */}
        <div className="w-full max-w-md flex flex-col items-center gap-1.5">
          <div
            className={`h-14 sm:h-16 w-full bg-slate-900/90 border-2 rounded-2xl flex items-center justify-center tracking-[0.25em] text-2xl sm:text-3xl font-black transition-all shadow-xl ${
              shakeInput
                ? 'border-rose-500/80 bg-rose-950/30 text-rose-300 animate-bounce'
                : 'border-cyan-500/50 text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.15)]'
            }`}
          >
            {currentWord || <span className="text-gray-600 text-sm tracking-normal font-sans">TYPE OR CLICK LETTER TILES</span>}
          </div>

          {feedback && (
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full animate-in fade-in duration-200 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : feedback.type === 'bonus'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {feedback.text}
            </span>
          )}
        </div>

        {/* Letter Tiles Grid */}
        <div className="grid grid-cols-6 gap-2 sm:gap-3 w-full max-w-md my-2">
          {scrambledLetters.map((letter, i) => {
            const isUsed = selectedIndices.includes(i);
            return (
              <button
                key={i}
                onClick={() => handleTileClick(i)}
                disabled={isUsed}
                className={`h-14 sm:h-16 rounded-2xl font-black text-2xl sm:text-3xl flex items-center justify-center transition-all duration-150 border-2 shadow-lg cursor-pointer ${
                  isUsed
                    ? 'bg-slate-900/30 border-slate-800/40 text-gray-600 opacity-30 scale-95'
                    : 'bg-gradient-to-b from-slate-800 to-slate-900 border-cyan-400/60 text-white hover:border-[#00F0FF] hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center gap-2 sm:gap-3 w-full max-w-md">
          <button
            onClick={handleShuffleTiles}
            className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold border border-slate-800 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Shuffle Letter Tiles (Spacebar)"
          >
            <Shuffle className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={handleClear}
            className="flex-1 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold text-xs uppercase border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            CLEAR
          </button>
          <button
            onClick={handleBackspace}
            className="flex-1 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-300 font-bold text-xs uppercase border border-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            DELETE
          </button>
          <button
            onClick={handleSubmitWord}
            className="flex-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xl shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            SUBMIT
          </button>
        </div>

        {/* 🌟 SOLUTIONS MODAL (As requested: "uske baad tum sol batana") */}
        {showSolutionsModal && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-between border border-cyan-500/30 animate-in fade-in duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#00F0FF]" />
                  <h3 className="text-lg font-black text-white tracking-wide">
                    Anagram Solutions & Dictionary
                  </h3>
                </div>
                <button
                  onClick={() => setShowSolutionsModal(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Root Word: <strong className="text-yellow-400 font-bold">{currentLevel.rootWord}</strong></span>
                <span>Found: <strong className="text-emerald-400">{foundWords.length + bonusWords.length}</strong> / {totalSolutionsCount} words</span>
              </div>

              {/* Categorized Solutions by Word Length */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                {[6, 5, 4, 3].map((len) => {
                  const wordsAtLen = currentLevel.allSolutions[len] || [];
                  if (wordsAtLen.length === 0) return null;

                  return (
                    <div key={len} className="space-y-2">
                      <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between">
                        <span>{len}-Letter Words</span>
                        <span className="text-slate-500 text-[10px]">{wordsAtLen.length} words</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {wordsAtLen.map(({ word, definition }) => {
                          const isDiscovered = foundWords.includes(word) || bonusWords.includes(word);
                          return (
                            <div
                              key={word}
                              className={`p-2.5 rounded-xl border text-xs transition-all ${
                                isDiscovered
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`font-mono font-black text-sm tracking-wider ${isDiscovered ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                  {word}
                                </span>
                                {isDiscovered ? (
                                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                    <Check className="w-3 h-3" /> Solved
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500">Unsolved</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                                {definition}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowSolutionsModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase border border-slate-800 cursor-pointer"
              >
                Back to Game
              </button>
              <button
                onClick={handleNextPuzzle}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
              >
                Next Puzzle Level
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </GameLifecycleWrapper>
  );
};
