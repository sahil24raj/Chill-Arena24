'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';
import { Brain, HelpCircle, Zap } from 'lucide-react';

interface PuzzleQuestion {
  id: number;
  prompt: string;
  options: string[];
  correctAnswer: string;
}

const PUZZLE_BANK: PuzzleQuestion[] = [
  {
    id: 1,
    prompt: 'Which shape completes the sequence? 🔺 🔷 🔺 🔷 🔺 ?',
    options: ['🔺', '🔷', '🟢', '⭐'],
    correctAnswer: '🔷',
  },
  {
    id: 2,
    prompt: 'Quick calculation: 14 + 19 - 8 = ?',
    options: ['23', '25', '27', '31'],
    correctAnswer: '25',
  },
  {
    id: 3,
    prompt: 'Spot the odd meme emoji out: 🗿 🗿 🗿 🐸 🗿',
    options: ['🗿', '🐸', '🚀', '🔥'],
    correctAnswer: '🐸',
  },
  {
    id: 4,
    prompt: 'What number comes next? 4, 9, 16, 25, ?',
    options: ['30', '36', '49', '32'],
    correctAnswer: '36',
  },
  {
    id: 5,
    prompt: 'Speed equation: (8 x 7) - 16 = ?',
    options: ['40', '48', '38', '42'],
    correctAnswer: '40',
  },
  {
    id: 6,
    prompt: 'Find the odd tea drink: ☕ ☕ 🍵 ☕ ☕',
    options: ['☕', '🍵', '🧋', '🥛'],
    correctAnswer: '🍵',
  },
  {
    id: 7,
    prompt: 'Sequence logic: 3, 6, 12, 24, ?',
    options: ['36', '48', '30', '42'],
    correctAnswer: '48',
  },
  {
    id: 8,
    prompt: 'Brain teaser: If 5 cats catch 5 mice in 5 minutes, how many cats catch 100 mice in 100 minutes?',
    options: ['5', '20', '100', '50'],
    correctAnswer: '5',
  },
];

export const BrainPotCanvas: React.FC = () => {
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const TOTAL_QUESTIONS = 8;
  const currentQ = PUZZLE_BANK[questionIndex % PUZZLE_BANK.length];

  useEffect(() => {
    const stored = user.stats.highScores?.['brain-pot'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const handleStartGame = async () => {
    await GameSessionManager.startSession('brain-pot', user);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
    setQuestionIndex(0);
    setTimeLeft(8);
    setSelectedOption(null);
    setFeedback(null);
    setResultData(null);
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

  // 8-second timer per question
  useEffect(() => {
    if (status !== 'PLAYING') return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleOptionSelect('TIMEOUT');
          return 8;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, questionIndex, score, combo]);

  const onGameOver = async (finalScore: number) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    soundFx.playGameOver();
    setStatus(finalScore >= 500 ? 'VICTORY' : 'GAMEOVER');

    const res = await GameSessionManager.finishSession(finalScore, finalScore >= 500, user, highScore);
    setResultData(res);
    await submitGameScore('brain-pot', finalScore, finalScore >= 500);

    if (finalScore > highScore) {
      setHighScore(finalScore);
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption !== null || status !== 'PLAYING') return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setSelectedOption(option);
    GameSessionManager.recordAction();

    const isCorrect = option === currentQ.correctAnswer;
    let newScore = score;
    let newCombo = combo;

    if (isCorrect) {
      soundFx.playCorrect();
      newCombo += 1;
      const speedBonus = timeLeft * 10;
      const gained = 80 + speedBonus + newCombo * 20;
      newScore += gained;
      setFeedback('correct');
      setScore(newScore);
      setCombo(newCombo);
    } else {
      soundFx.playWrong();
      newCombo = 0;
      setFeedback('wrong');
      setCombo(0);
    }

    setTimeout(() => {
      const nextQ = questionIndex + 1;
      if (nextQ >= TOTAL_QUESTIONS) {
        onGameOver(newScore);
      } else {
        setQuestionIndex(nextQ);
        setSelectedOption(null);
        setFeedback(null);
        setTimeLeft(8);
      }
    }, 1000);
  };

  return (
    <GameLifecycleWrapper
      gameTitle="Brain Pot: Rapid IQ Challenge"
      gameId="brain-pot"
      category="Mind IQ"
      instructions={[
        'Answer 8 rapid-fire cognitive puzzles (Math, Sequences, Odd Emojis, Riddles).',
        'You have only 8 seconds per question — answer fast for maximum speed bonuses!',
        'Score 500+ points to achieve Genius status and rank on the leaderboards.',
      ]}
      controls={[
        { key: 'CLICK / TAP OPTION', action: 'Select Answer' },
        { key: '1, 2, 3, 4', action: 'Keyboard Shortcuts' },
        { key: 'ESC', action: 'Pause' },
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
      <div className="w-full h-full flex flex-col items-center justify-between p-6 select-none">
        {/* Top Progress & Time Bar */}
        <div className="flex items-center justify-between w-full max-w-md px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono">
          <span className="text-cyan-300">
            QUESTION {questionIndex + 1} / {TOTAL_QUESTIONS}
          </span>
          <span
            className={`font-bold ${timeLeft <= 3 ? 'text-red-400 animate-ping' : 'text-yellow-400'}`}
          >
            ⏳ {timeLeft}s LEFT
          </span>
        </div>

        {/* Question Card */}
        <div className="w-full max-w-lg bg-slate-900/80 border-2 border-indigo-500/40 rounded-2xl p-6 text-center shadow-xl my-auto">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white leading-snug">{currentQ.prompt}</h3>
        </div>

        {/* 4 Answer Options */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === currentQ.correctAnswer;
            let btnStyle = 'bg-slate-900 border-slate-800 text-white hover:border-cyan-400 hover:bg-slate-850';

            if (selectedOption !== null) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-300';
              } else if (isSelected) {
                btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-300';
              } else {
                btnStyle = 'bg-slate-900/40 border-slate-800 text-gray-600 opacity-40';
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleOptionSelect(opt)}
                disabled={selectedOption !== null}
                className={`py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center transition-all border-2 shadow-lg cursor-pointer ${btnStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </GameLifecycleWrapper>
  );
};
