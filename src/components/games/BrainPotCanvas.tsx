'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { RotateCcw, Brain, Zap, Flame, Trophy, Sparkles, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PuzzleQuestion {
  id: number;
  type: 'sequence' | 'math' | 'odd_emoji' | 'cups';
  prompt: string;
  options: string[];
  correctAnswer: string;
  hint: string;
}

const PUZZLE_BANK: PuzzleQuestion[] = [
  {
    id: 1,
    type: 'sequence',
    prompt: 'Which shape completes the sequence? 🔺 🔷 🔺 🔷 🔺 ?',
    options: ['🔺', '🔷', '🟢', '⭐'],
    correctAnswer: '🔷',
    hint: 'Alternating triangle and diamond'
  },
  {
    id: 2,
    type: 'math',
    prompt: 'Quick calculation: 14 + 19 - 8 = ?',
    options: ['23', '25', '27', '31'],
    correctAnswer: '25',
    hint: '33 - 8 = 25'
  },
  {
    id: 3,
    type: 'odd_emoji',
    prompt: 'Spot the odd meme emoji out: 🗿 🗿 🗿 🐸 🗿',
    options: ['🗿', '🐸', '🚀', '🔥'],
    correctAnswer: '🐸',
    hint: 'Pepe is not Gigachad'
  },
  {
    id: 4,
    type: 'sequence',
    prompt: 'What number comes next? 4, 9, 16, 25, ?',
    options: ['30', '36', '49', '32'],
    correctAnswer: '36',
    hint: 'Square numbers: 2², 3², 4², 5², 6²'
  },
  {
    id: 5,
    type: 'cups',
    prompt: 'Cup #2 had the coin. Which cup contains it?',
    options: ['🥤 Cup 1', '🥤 Cup 2', '🥤 Cup 3', '🥤 Cup 4'],
    correctAnswer: '🥤 Cup 2',
    hint: 'Track the middle cup'
  },
  {
    id: 6,
    type: 'math',
    prompt: 'Speed equation: (8 x 7) - 16 = ?',
    options: ['40', '48', '38', '42'],
    correctAnswer: '40',
    hint: '56 - 16 = 40'
  },
  {
    id: 7,
    type: 'odd_emoji',
    prompt: 'Find the odd chai cup: ☕ ☕ 🍵 ☕ ☕',
    options: ['☕', '🍵', '🧋', '🥛'],
    correctAnswer: '🍵',
    hint: 'Green tea is not Cutting Chai'
  },
  {
    id: 8,
    type: 'sequence',
    prompt: 'Sequence logic: 3, 6, 12, 24, ?',
    options: ['36', '48', '30', '42'],
    correctAnswer: '48',
    hint: 'Multiply by 2 each step'
  }
];

export const BrainPotCanvas: React.FC = () => {
  const { user, addCoins, addXP, updateHighScore, recordGameWin, submitGameScore } = useAppStore();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const currentQ = PUZZLE_BANK[questionIndex % PUZZLE_BANK.length];

  // Rapid countdown timer per question
  useEffect(() => {
    if (!isPlaying || gameOver || feedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver, feedback, questionIndex]);

  const handleOptionClick = (option: string) => {
    if (!isPlaying) setIsPlaying(true);
    if (feedback || gameOver) return;

    setSelectedOption(option);

    if (option === currentQ.correctAnswer) {
      soundFx.playCorrect();
      soundFx.playCoin();
      const speedBonus = timeLeft * 15;
      const points = 100 + speedBonus + combo * 25;

      setScore((s) => s + points);
      setCombo((c) => c + 1);
      setFeedback('correct');
      addCoins(25);
      addXP(20);
    } else {
      soundFx.playBuzzer();
      setCombo(0);
      setFeedback('wrong');
    }

    setTimeout(() => {
      advanceNextQuestion();
    }, 1000);
  };

  const handleTimeout = () => {
    soundFx.playGameOver();
    setCombo(0);
    setFeedback('timeout');
    setTimeout(() => {
      advanceNextQuestion();
    }, 1000);
  };

  const advanceNextQuestion = () => {
    if (questionIndex >= PUZZLE_BANK.length - 1) {
      setGameOver(true);
      setIsPlaying(false);
      soundFx.playLevelUp();
      submitGameScore('brain-pot', score, true);
      return;
    }

    setQuestionIndex((prev) => prev + 1);
    setTimeLeft(7);
    setSelectedOption(null);
    setFeedback(null);
  };

  const resetGame = () => {
    soundFx.playClick();
    setQuestionIndex(0);
    setScore(0);
    setCombo(0);
    setTimeLeft(7);
    setIsPlaying(false);
    setSelectedOption(null);
    setFeedback(null);
    setGameOver(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border-[#00F0FF]/20 bg-[#0d1117]/90">
        <div className="flex items-center gap-2 font-display">
          <span className="text-2xl">🧠</span>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              BRAIN POT: RAPID IQ ARENA <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">7S PER PUZZLE</span>
            </h2>
            <p className="text-[11px] text-gray-400 font-sans">Solve sequences, emoji oddities, and rapid math before the bar runs out.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetGame}
            className="p-2 rounded-lg bg-slate-900 border border-gray-800 text-gray-400 hover:text-white hover:border-[#00F0FF]/40 transition-colors"
            title="Restart Arena"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Score & Timer HUD */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-[#00F0FF]/30 bg-[#00F0FF]/10">
          <span className="text-[10px] text-gray-400 font-mono block">ARENA SCORE</span>
          <span className="text-3xl font-black text-[#00F0FF] font-display">{score}</span>
          <span className="text-[9px] text-gray-500 block">PTS</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-pink-500/30 bg-pink-500/5 text-center flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-pink-400 font-mono">⏳ {timeLeft}s</span>
          <div className="w-full h-1.5 bg-slate-950 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-amber-400 transition-all duration-1000"
              style={{ width: `${(timeLeft / 7) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-[#ADFF2F]/30 bg-[#ADFF2F]/10 text-right">
          <span className="text-[10px] text-gray-400 font-mono block">COMBO STREAK</span>
          <span className="text-3xl font-black text-[#ADFF2F] font-display">{combo}x</span>
          <span className="text-[9px] text-gray-500 block">MULTIPLIER</span>
        </div>
      </div>

      {/* Question Canvas Stage */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-purple-900/40 shadow-2xl bg-gradient-to-b from-[#130d24] via-[#0b0817] to-[#06040d] p-8 space-y-6">
        <div className="flex justify-between items-center text-xs font-mono text-gray-400 border-b border-purple-900/30 pb-3">
          <span>CHALLENGE {questionIndex + 1} OF {PUZZLE_BANK.length}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-900/50 text-purple-300 font-bold uppercase">
            {currentQ.type.replace('_', ' ')}
          </span>
        </div>

        {/* Question Prompt */}
        <div className="min-h-20 flex items-center justify-center text-center">
          <h3 className="text-xl md:text-2xl font-black text-white font-display leading-snug">
            {currentQ.prompt}
          </h3>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;
            return (
              <button
                key={idx}
                disabled={feedback !== null || gameOver}
                onClick={() => handleOptionClick(option)}
                className={`p-5 rounded-2xl font-display font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 select-none border ${
                  feedback
                    ? isCorrect
                      ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 scale-102 shadow-emerald-500/20'
                      : isSelected
                      ? 'bg-red-600/30 border-red-400 text-red-300'
                      : 'bg-slate-900/40 border-gray-800 text-gray-600'
                    : 'bg-slate-900/80 hover:bg-purple-950/60 border-purple-800/40 hover:border-cyan-400 text-white hover:scale-102 active:scale-98'
                }`}
              >
                <span>{option}</span>
                {feedback && isCorrect && <Check className="w-5 h-5 text-emerald-400" />}
                {feedback && isSelected && !isCorrect && <X className="w-5 h-5 text-red-400" />}
              </button>
            );
          })}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-3 rounded-xl text-center text-xs font-mono font-bold ${
            feedback === 'correct'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-red-500/20 text-red-400 border border-red-500/40'
          }`}>
            {feedback === 'correct' ? 'EXCELLENT! SPEED BONUS AWARDED! ⚡' : 'WRONG OR TIMED OUT! Streak broken.'}
          </div>
        )}
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/90 to-slate-950/90 border-2 border-[#00F0FF] text-center space-y-4 shadow-2xl animate-fadeIn">
          <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide">
            🏆 BRAIN ARENA COMPLETE!
          </h3>
          <p className="text-sm text-cyan-300 font-mono">
            Final IQ Score: <strong className="text-2xl text-[#ADFF2F]">{score} PTS</strong>
          </p>
          <button
            onClick={resetGame}
            className="cyber-button px-6 py-2.5 rounded-xl font-display text-xs font-black text-slate-950 shadow-lg"
          >
            PLAY NEXT ARENA 🧠
          </button>
        </div>
      )}
    </div>
  );
};
