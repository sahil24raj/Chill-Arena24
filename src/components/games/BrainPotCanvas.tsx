'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus } from '@/lib/game-engine/types';
import { useGameViewport } from '@/lib/game-engine/useGameViewport';
import { UniversalGameModeSelector } from '@/components/game-shell/UniversalGameModeSelector';
import { UniversalMatchEndModal, MatchStatItem } from '@/components/game-shell/UniversalMatchEndModal';
import { GameModeSelection, GameModeType, AIDifficulty, PlayerSetup } from '@/types/gameMode';
import confetti from 'canvas-confetti';
import { Brain, HelpCircle, Zap, Bot, User, Users, Globe, Trophy } from 'lucide-react';

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
  const { user, submitGameScore, openMultiplayerModal } = useAppStore();
  const { isFullscreen } = useGameViewport();

  // Mode Selection State
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [currentMode, setCurrentMode] = useState<GameModeType>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { id: user.id || 'p1', name: user.displayName || user.username || 'You', avatar: user.avatar || '🧠', isAI: false },
    { id: 'ai-pot', name: 'AI Bot (MED)', avatar: '🤖', isAI: true },
  ]);

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);

  // Turn-based / dual player score
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [isPlayer1Turn, setIsPlayer1Turn] = useState(true);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Match End Modal State
  const [showEndModal, setShowEndModal] = useState(false);
  const [matchWinnerTitle, setMatchWinnerTitle] = useState('');
  const [matchWinnerSubtitle, setMatchWinnerSubtitle] = useState('');
  const [isMatchVictory, setIsMatchVictory] = useState(true);
  const [isMatchDraw, setIsMatchDraw] = useState(false);
  const [matchStats, setMatchStats] = useState<MatchStatItem[]>([]);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const aiAnswerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const TOTAL_QUESTIONS = 8;
  const currentQ = PUZZLE_BANK[questionIndex % PUZZLE_BANK.length];

  useEffect(() => {
    const stored = user.stats.highScores?.['brain-pot'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const activePlayer = isPlayer1Turn ? players[0] : players[1];

  const handleStartGame = (mode?: GameModeType, diff?: AIDifficulty, customPlayers?: PlayerSetup[]) => {
    if (mode) setCurrentMode(mode);
    if (diff) setAiDifficulty(diff);
    if (customPlayers) setPlayers(customPlayers);

    setShowEndModal(false);
    setStatus('PLAYING');
    setScore(0);
    setP1Score(0);
    setP2Score(0);
    setCombo(0);
    setQuestionIndex(0);
    setIsPlayer1Turn(true);
    setTimeLeft(8);
    setSelectedOption(null);
    setFeedback(null);
    GameSessionManager.startSession('brain-pot', user);
  };

  const handleModeSelection = (selection: GameModeSelection) => {
    setShowModeSelector(false);
    if (selection.mode === 'online') {
      return;
    }
    handleStartGame(selection.mode, selection.difficulty, selection.players);
  };

  // Countdown timer for each question
  useEffect(() => {
    if (status !== 'PLAYING') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (aiAnswerTimerRef.current) clearTimeout(aiAnswerTimerRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 8;
        }
        return prev - 1;
      });
    }, 1000);

    // AI Bot Reaction in VS AI mode
    if (currentMode === 'ai' && !selectedOption) {
      let reactionTimeMs = 3200;
      let accuracyChance = 0.75;

      if (aiDifficulty === 'hard') {
        reactionTimeMs = 1800;
        accuracyChance = 0.95;
      } else if (aiDifficulty === 'easy') {
        reactionTimeMs = 5000;
        accuracyChance = 0.5;
      }

      aiAnswerTimerRef.current = setTimeout(() => {
        // If human hasn't answered yet, AI attempts to score
        if (status === 'PLAYING' && !selectedOption) {
          const isCorrect = Math.random() < accuracyChance;
          const chosenOpt = isCorrect
            ? currentQ.correctAnswer
            : currentQ.options.find((o) => o !== currentQ.correctAnswer) || currentQ.options[0];

          if (isCorrect) {
            setP2Score((prev) => prev + 120);
          }
        }
      }, reactionTimeMs);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (aiAnswerTimerRef.current) clearTimeout(aiAnswerTimerRef.current);
    };
  }, [status, questionIndex, currentMode, aiDifficulty, currentQ, selectedOption]);

  const handleTimeOut = () => {
    soundFx.playWrong();
    setFeedback('wrong');
    advanceToNextQuestion(0, false);
  };

  const handleSelectOption = (opt: string) => {
    if (selectedOption || status !== 'PLAYING') return;

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (aiAnswerTimerRef.current) clearTimeout(aiAnswerTimerRef.current);

    setSelectedOption(opt);
    GameSessionManager.recordAction();

    const isCorrect = opt === currentQ.correctAnswer;
    let earned = 0;
    let newCombo = combo;

    if (isCorrect) {
      soundFx.playCorrect();
      soundFx.playCoin();
      newCombo += 1;
      earned = 100 + timeLeft * 15 + newCombo * 20;
      setFeedback('correct');
      confetti({ particleCount: 30, spread: 50 });
    } else {
      soundFx.playWrong();
      newCombo = 0;
      setFeedback('wrong');
    }

    setCombo(newCombo);
    if (isPlayer1Turn) {
      setP1Score((prev) => prev + earned);
    } else {
      setP2Score((prev) => prev + earned);
    }
    setScore((prev) => prev + earned);

    setTimeout(() => {
      advanceToNextQuestion(earned, isCorrect);
    }, 1200);
  };

  const advanceToNextQuestion = async (earned: number, isCorrect: boolean) => {
    const nextQ = questionIndex + 1;

    // Toggle turn for Pass & Play
    if (currentMode === 'pass-and-play') {
      setIsPlayer1Turn((prev) => !prev);
    }

    if (nextQ >= TOTAL_QUESTIONS) {
      // Tournament finished
      setStatus('GAMEOVER');
      const finalP1 = p1Score + (isPlayer1Turn ? earned : 0);
      const finalP2 = p2Score + (!isPlayer1Turn ? earned : 0);

      let title = '';
      let subtitle = '';
      let isVic = false;
      let isTie = false;

      if (finalP1 > finalP2) {
        title = `🏆 ${players[0].name} Wins!`;
        subtitle = `Crowned IQ Maestro with ${finalP1} pts vs ${finalP2} pts!`;
        isVic = true;
      } else if (finalP1 === finalP2) {
        title = `🤝 Equal Brainpower Tie!`;
        subtitle = `Both players matched scores at ${finalP1} pts!`;
        isTie = true;
      } else {
        title = `🏆 ${players[1].name} Wins!`;
        subtitle = `Speed IQ Champion with ${finalP2} pts vs ${finalP1} pts!`;
        isVic = false;
      }

      setMatchWinnerTitle(title);
      setMatchWinnerSubtitle(subtitle);
      setIsMatchVictory(isVic);
      setIsMatchDraw(isTie);

      const statsList: MatchStatItem[] = [
        { label: `${players[0].name} Score`, value: finalP1, highlight: true },
        { label: `${players[1].name} Score`, value: finalP2, highlight: true },
        { label: 'Questions Solved', value: TOTAL_QUESTIONS },
        { label: 'Mode', value: currentMode === 'ai' ? `VS AI (${aiDifficulty.toUpperCase()})` : 'Pass & Play' },
        { label: 'Total Match IQ', value: finalP1 + finalP2 },
      ];
      setMatchStats(statsList);
      setShowEndModal(true);

      if (finalP1 > highScore) setHighScore(finalP1);
      await GameSessionManager.finishSession(finalP1, isVic, user, highScore);
      await submitGameScore('brain-pot', finalP1, isVic);
    } else {
      setQuestionIndex(nextQ);
      setTimeLeft(8);
      setSelectedOption(null);
      setFeedback(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between select-none relative overflow-hidden">
      {/* Universal Mode Selector Modal */}
      <UniversalGameModeSelector
        gameTitle="Brain Pot: Rapid IQ Arena 🧠"
        gameId="brain-pot"
        user={user}
        isOpen={showModeSelector}
        onClose={() => setShowModeSelector(false)}
        onSelectMode={handleModeSelection}
        supportsAI={true}
        supportsPassAndPlay={true}
        supportsOnline={true}
        maxPassAndPlayPlayers={2}
      />

      {/* Universal Match End Modal */}
      <UniversalMatchEndModal
        isOpen={showEndModal}
        gameTitle="Brain Pot: Rapid IQ Arena 🧠"
        gameId="brain-pot"
        winnerTitle={matchWinnerTitle}
        winnerSubtitle={matchWinnerSubtitle}
        isVictory={isMatchVictory}
        isDraw={isMatchDraw}
        stats={matchStats}
        onPlayAgain={() => handleStartGame()}
        onChangeMode={() => {
          setShowEndModal(false);
          setShowModeSelector(true);
        }}
      />

      <GameLifecycleWrapper
        gameTitle="Brain Pot: Rapid IQ Duel"
        gameId="brain-pot"
        category="IQ Micro Challenges"
        instructions={[
          'Answer high-speed cognitive micro-puzzles within 8 seconds.',
          'Solve sequences, spot odd meme emojis, and crack lightning calculations.',
          'Faster answers yield massive speed multiplier bonuses across 8 rounds!',
        ]}
        controls={[
          { key: 'CLICK / TAP OPTION', action: 'Submit Answer' },
          { key: 'ESC', action: 'Pause / Exit Fullscreen' },
        ]}
        status={status}
        score={p1Score + p2Score}
        highScore={highScore}
        combo={combo}
        onStart={() => handleStartGame()}
        onPause={() => setStatus('PAUSED')}
        onResume={() => setStatus('PLAYING')}
        onRestart={() => handleStartGame()}
        currentMode={currentMode}
        onSelectMode={(m) => {
          if (m !== 'online') {
            handleStartGame(m, aiDifficulty);
          }
        }}
        aiDifficulty={aiDifficulty}
        onSelectDifficulty={(d) => {
          setAiDifficulty(d);
          handleStartGame(currentMode, d);
        }}
        players={players}
        onOpenPassPlayConfig={() => setShowModeSelector(true)}
        onChangeMode={() => setShowModeSelector(true)}
        modeBadge={
          <span className="px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-[#00F0FF] text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
            {currentMode === 'ai' ? (
              <>
                <Bot className="w-3 h-3" />
                <span>VS AI ({aiDifficulty})</span>
              </>
            ) : currentMode === 'pass-and-play' ? (
              <>
                <Users className="w-3 h-3 text-purple-400" />
                <span className="text-purple-300">Pass & Play</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3 text-lime-400" />
                <span className="text-lime-300">Online Room</span>
              </>
            )}
          </span>
        }
        activePlayerInfo={
          <span className="text-[10px] font-mono text-gray-300 flex items-center gap-1">
            <span>Solver:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <span>{activePlayer.avatar}</span>
              <span>{activePlayer.name}</span>
            </span>
          </span>
        }
      >
        <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 select-none max-w-xl mx-auto">
          {/* Top Scoreboard & Timer */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-mono shadow-lg">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="text-base">{players[0].avatar}</span>
              <span className="font-bold">{players[0].name}: {p1Score} pts</span>
            </div>
            <span className="text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded-lg border border-yellow-400/30">
              Q {questionIndex + 1} / {TOTAL_QUESTIONS}
            </span>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="font-bold">{players[1].name}: {p2Score} pts</span>
              <span className="text-base">{players[1].avatar}</span>
            </div>
          </div>

          {/* Time Countdown Bar */}
          <div className="w-full bg-slate-900/90 h-2.5 rounded-full overflow-hidden border border-slate-800 my-2">
            <div
              style={{ width: `${(timeLeft / 8) * 100}%` }}
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 2
                  ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                  : timeLeft <= 4
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
              }`}
            />
          </div>

          {/* QUESTION CARD */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center my-auto shadow-2xl relative">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>RAPID COGNITIVE CHALLENGE</span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-white font-display leading-snug">
              {currentQ.prompt}
            </h3>

            {/* Turn notice in Pass & Play */}
            {currentMode === 'pass-and-play' && (
              <div className="mt-3 text-[11px] font-mono text-purple-300">
                👉 Turn: <span className="font-bold text-white">{activePlayer.name}</span>
              </div>
            )}
          </div>

          {/* 4 CHOICES GRID */}
          <div className="grid grid-cols-2 gap-3 my-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectAnswer = opt === currentQ.correctAnswer;

              let btnStyle =
                'bg-slate-900/80 border-slate-800 text-gray-200 hover:border-cyan-400 hover:bg-slate-850';

              if (selectedOption) {
                if (isCorrectAnswer) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-500/30';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-rose-500/30';
                } else {
                  btnStyle = 'bg-slate-950/40 border-slate-850 opacity-40';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={selectedOption !== null || status !== 'PLAYING'}
                  className={`p-4 sm:p-5 rounded-2xl border-2 text-sm sm:text-lg font-black font-display flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Bottom Countdown status */}
          <div className="text-center text-xs font-mono text-gray-400">
            ⏳ {timeLeft}s remaining to answer! Speed gives point bonuses.
          </div>
        </div>
      </GameLifecycleWrapper>
    </div>
  );
};
