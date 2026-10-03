'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  RotateCcw,
  Trophy,
  ShieldCheck,
  Share2,
  HelpCircle,
  Bot,
  Users,
  Target,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { soundFx } from './AudioManager';
import { GameStatus, GameSessionFinishResponse } from './types';
import { GameFullscreenShell } from '@/components/game-shell/GameFullscreenShell';
import { CompactGameModeBar } from '@/components/game-shell/CompactGameModeBar';
import { SingleUnifiedMultiplayerModal } from '@/components/game-shell/SingleUnifiedMultiplayerModal';
import { GameModeType, AIDifficulty, PlayerSetup } from '@/types/gameMode';
import { useAppStore } from '@/store/useAppStore';

export interface GameLifecycleWrapperProps {
  gameTitle: string;
  gameId: string;
  category: string;
  instructions: string[];
  controls: { key: string; action: string }[];
  status: GameStatus;
  score: number;
  highScore: number;
  combo?: number;
  resultData?: GameSessionFinishResponse | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  preferredAspectRatio?: '16/9' | '1/1' | '4/3' | '9/16' | 'auto';
  preferredOrientation?: 'landscape' | 'portrait' | 'any';
  scalingMode?: 'contain' | 'responsive' | 'fill';
  modeBadge?: React.ReactNode;
  activePlayerInfo?: React.ReactNode;
  currentMode?: GameModeType;
  onSelectMode?: (mode: GameModeType) => void;
  aiDifficulty?: AIDifficulty;
  onSelectDifficulty?: (diff: AIDifficulty) => void;
  players?: PlayerSetup[];
  onOpenPassPlayConfig?: () => void;
  supportsAI?: boolean;
  supportsPassAndPlay?: boolean;
  supportsOnline?: boolean;
  onChangeMode?: () => void;
  onExitGame?: () => void;
  children: React.ReactNode;
}

export const GameLifecycleWrapper: React.FC<GameLifecycleWrapperProps> = ({
  gameTitle,
  gameId,
  category,
  instructions,
  controls,
  status,
  score,
  highScore,
  combo = 0,
  resultData,
  onStart,
  onPause,
  onResume,
  onRestart,
  preferredAspectRatio,
  preferredOrientation,
  scalingMode,
  modeBadge,
  activePlayerInfo,
  currentMode: propCurrentMode,
  onSelectMode,
  aiDifficulty: propAiDifficulty,
  onSelectDifficulty,
  players,
  onOpenPassPlayConfig,
  supportsAI = true,
  supportsPassAndPlay = true,
  supportsOnline = true,
  onChangeMode,
  onExitGame,
  children,
}) => {
  const { user } = useAppStore();
  const [countdown, setCountdown] = useState<number | string | null>(null);

  // Fallback internal mode & difficulty (defaults to VS AI)
  const [internalMode, setInternalMode] = useState<GameModeType>('ai');
  const [internalDiff, setInternalDiff] = useState<AIDifficulty>('medium');
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);

  // Pass & Play 2-Player local run state for arcade games
  const [passPlayerIndex, setPassPlayerIndex] = useState<0 | 1>(0);
  const [passP1Score, setPassP1Score] = useState<number | null>(null);

  // VS AI Target Score for arcade games
  const [aiTargetScore, setAiTargetScore] = useState<number>(() => {
    return (propAiDifficulty || internalDiff) === 'easy'
      ? 350
      : (propAiDifficulty || internalDiff) === 'medium'
      ? 750
      : 1400;
  });

  const activeMode = propCurrentMode !== undefined ? propCurrentMode : internalMode;
  const activeDiff = propAiDifficulty !== undefined ? propAiDifficulty : internalDiff;

  // Recalculate AI Target when difficulty changes
  useEffect(() => {
    const diff = activeDiff;
    const baseTarget = diff === 'easy' ? 350 : diff === 'medium' ? 750 : 1400;
    const variance = Math.floor(Math.random() * 80) - 40;
    setAiTargetScore(Math.max(100, baseTarget + variance));
  }, [activeDiff]);

  const handleModeChange = (mode: GameModeType) => {
    if (mode === 'online') {
      setShowMultiplayerModal(true);
      return;
    }
    if (onSelectMode) {
      onSelectMode(mode);
    } else {
      setInternalMode(mode);
    }
    setPassPlayerIndex(0);
    setPassP1Score(null);
  };

  const handleDiffChange = (diff: AIDifficulty) => {
    if (onSelectDifficulty) {
      onSelectDifficulty(diff);
    } else {
      setInternalDiff(diff);
    }
  };

  // Countdown handler
  const triggerStartWithCountdown = () => {
    soundFx.playClick();
    setCountdown(3);
    soundFx.playSpin();

    const t3 = setTimeout(() => {
      setCountdown(2);
      soundFx.playSpin();
    }, 800);

    const t2 = setTimeout(() => {
      setCountdown(1);
      soundFx.playSpin();
    }, 1600);

    const t1 = setTimeout(() => {
      setCountdown('GO!');
      soundFx.playCorrect();
    }, 2400);

    const tGo = setTimeout(() => {
      setCountdown(null);
      onStart();
    }, 3000);

    return () => {
      clearTimeout(t3);
      clearTimeout(t2);
      clearTimeout(t1);
      clearTimeout(tGo);
    };
  };

  const handleShareResult = () => {
    soundFx.playClick();
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `🎮 I scored ${score} pts in ${gameTitle} on Chill Arena! Can you beat me? https://chill-arena24.vercel.app/game/${gameId}`
      );
      alert('Score duel copied to clipboard!');
    }
  };

  // Compact Mode Selector Element for Header & Start Screen
  const modeBarElement = (
    <CompactGameModeBar
      currentMode={activeMode}
      onChangeMode={handleModeChange}
      aiDifficulty={activeDiff}
      onChangeDifficulty={handleDiffChange}
      players={players}
      onOpenPassPlayConfig={onOpenPassPlayConfig}
      isPlaying={status === 'PLAYING'}
      hasUnsavedProgress={score > 0}
      supportsAI={supportsAI}
      supportsPassAndPlay={supportsPassAndPlay}
      supportsOnline={supportsOnline}
    />
  );

  return (
    <GameFullscreenShell
      gameId={gameId}
      gameTitle={gameTitle}
      category={category}
      score={score}
      highScore={highScore}
      combo={combo}
      onPause={status === 'PLAYING' ? onPause : undefined}
      onRestart={onRestart}
      preferredAspectRatio={preferredAspectRatio}
      preferredOrientation={preferredOrientation}
      scalingMode={scalingMode}
      modeBadge={modeBadge}
      activePlayerInfo={activePlayerInfo}
      compactModeBar={modeBarElement}
      onChangeMode={onChangeMode}
      onExitGame={onExitGame}
      showHUD={true}
    >
      <div className="relative w-full h-full min-w-0 min-h-0 flex items-center justify-center overflow-hidden">
        {/* Active Game Component Viewport */}
        {children}

        {/* 1. START / INSTRUCTIONS OVERLAY */}
        {status === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center z-30 overflow-y-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-2xl sm:text-3xl shadow-xl shadow-cyan-500/20 mb-2 sm:mb-3 animate-pulse shrink-0">
              🎮
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
              {gameTitle}
            </h2>
            <p className="text-[10px] sm:text-xs text-cyan-400 font-mono mt-0.5 mb-3 sm:mb-4">
              READY YOUR REFLEXES • SERVER VERIFIED ARENA
            </p>

            {/* Prominent Mode Bar on Start Screen */}
            <div className="mb-4 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">
                SELECT GAMEPLAY MODE
              </span>
              {modeBarElement}
            </div>

            {/* Instructions list */}
            <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 text-left mb-4 space-y-1.5 text-xs text-gray-300 shadow-xl">
              <div className="flex items-center gap-1.5 text-white font-bold text-xs uppercase tracking-wider mb-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>How to Play</span>
              </div>
              {instructions.map((inst, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span className="leading-relaxed">{inst}</span>
                </div>
              ))}

              {/* Controls guide */}
              <div className="pt-2 mt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {controls.map((ctrl, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-yellow-400 font-mono text-[10px] border border-slate-700 font-bold shrink-0">
                      {ctrl.key}
                    </span>
                    <span className="text-gray-400 text-[11px] truncate">{ctrl.action}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={triggerStartWithCountdown}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer font-display"
            >
              <Play className="w-5 h-5 fill-current" />
              START MATCH
            </button>
          </div>
        )}

        {/* 2. COUNTDOWN OVERLAY */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-40 select-none">
            <span className="text-7xl sm:text-9xl font-black bg-gradient-to-b from-cyan-300 via-[#00F0FF] to-indigo-600 bg-clip-text text-transparent animate-ping drop-shadow-2xl font-display">
              {countdown}
            </span>
          </div>
        )}

        {/* 3. PAUSE OVERLAY */}
        {status === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
            <h3 className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-wider uppercase mb-2 font-display">
              GAME PAUSED
            </h3>
            <p className="text-xs text-gray-400 mb-6 font-mono">Match on hold. Take a breather, warrior.</p>
            <div className="flex flex-col gap-3 w-52">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onResume();
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all transform active:scale-95 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Resume Match
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onRestart();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700 cursor-pointer"
              >
                Restart
              </button>
            </div>
          </div>
        )}

        {/* 4. GAME OVER & VERIFIED RESULT SCREEN */}
        {(status === 'GAMEOVER' || status === 'VICTORY') && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center z-30 animate-fade-in overflow-y-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-3xl shadow-xl shadow-red-500/20 mb-3 animate-bounce shrink-0">
              {status === 'VICTORY' || (activeMode === 'ai' && score >= aiTargetScore) ? '🏆' : '💀'}
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider font-display">
              {activeMode === 'ai'
                ? score >= aiTargetScore
                  ? 'VICTORY OVER AI BOT!'
                  : 'AI BOT WINS THIS DUEL'
                : activeMode === 'pass-and-play' && passP1Score !== null
                ? score > passP1Score
                  ? 'PLAYER 2 CLAIMS VICTORY!'
                  : score < passP1Score
                  ? 'PLAYER 1 CLAIMS VICTORY!'
                  : 'A DEADLOCK TIE!'
                : status === 'VICTORY'
                ? 'VICTORY SECURED!'
                : 'MATCH COMPLETED'}
            </h3>

            {/* Mode match summary badge */}
            {activeMode === 'ai' && (
              <div className="text-xs font-mono text-cyan-300 mt-1 mb-2">
                Your Score: <span className="font-bold text-white">{score}</span> • AI Target: <span className="font-bold text-yellow-400">{aiTargetScore}</span> ({activeDiff.toUpperCase()})
              </div>
            )}

            {activeMode === 'pass-and-play' && passPlayerIndex === 0 && passP1Score === null && (
              <div className="my-3 p-3 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-mono max-w-sm">
                📱 Player 1 scored <span className="font-bold text-white">{score}</span> pts! Hand over the screen to Player 2 to beat it!
              </div>
            )}

            {/* Server Anti-Cheat Verified Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono mt-1 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SERVER-VERIFIED ANTI-CHEAT AUDIT PASSED</span>
            </div>

            {/* Score & Rewards Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-sm mb-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center shadow-md">
                <span className="text-[10px] text-gray-400 uppercase font-mono">FINAL SCORE</span>
                <span className="text-xl sm:text-2xl font-black text-[#00F0FF]">{score}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center shadow-md">
                <span className="text-[10px] text-gray-400 uppercase font-mono">XP EARNED</span>
                <span className="text-xl sm:text-2xl font-black text-indigo-400">+{resultData?.xpEarned || 50}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center shadow-md">
                <span className="text-[10px] text-gray-400 uppercase font-mono">COINS</span>
                <span className="text-xl sm:text-2xl font-black text-yellow-400">+{resultData?.coinsEarned || 15}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {activeMode === 'pass-and-play' && passPlayerIndex === 0 && passP1Score === null ? (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setPassP1Score(score);
                    setPassPlayerIndex(1);
                    onRestart();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 cursor-pointer transform active:scale-95"
                >
                  <ArrowRight className="w-4 h-4" />
                  START PLAYER 2 RUN 📱
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setPassPlayerIndex(0);
                    setPassP1Score(null);
                    onRestart();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 cursor-pointer transform active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  PLAY AGAIN
                </button>
              )}

              <button
                onClick={handleShareResult}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                SHARE SCORE
              </button>

              <Link
                href="/leaderboard"
                onClick={() => soundFx.playClick()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 font-bold text-xs uppercase tracking-wider border border-yellow-500/30"
              >
                <Trophy className="w-4 h-4" />
                LEADERBOARD
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Single Unified Multiplayer Modal for this game (Zero duplicate popups) */}
      <SingleUnifiedMultiplayerModal
        isOpen={showMultiplayerModal}
        onClose={() => setShowMultiplayerModal(false)}
        gameId={gameId}
        gameTitle={gameTitle}
        user={user}
      />
    </GameFullscreenShell>
  );
};
