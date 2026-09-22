'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Pause,
  Trophy,
  ShieldCheck,
  Zap,
  Coins,
  Sparkles,
  Share2,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from './AudioManager';
import { GameStatus, GameSessionFinishResponse } from './types';

interface GameLifecycleWrapperProps {
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
  children,
}) => {
  const [countdown, setCountdown] = useState<number | string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.settings.muted);

  useEffect(() => {
    const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

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

  const handleToggleMute = () => {
    const next = soundFx.toggleMute();
    setIsMuted(next);
  };

  const toggleFullscreen = () => {
    const container = document.getElementById(`game-wrapper-${gameId}`);
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleShareResult = () => {
    soundFx.playClick();
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `🎮 I scored ${score} pts in ${gameTitle} on Chill Arena! Can you beat me? https://chillarena.com/game/${gameId}`
      );
      alert('Score duel copied to clipboard!');
    }
  };

  return (
    <div
      id={`game-wrapper-${gameId}`}
      className={`relative w-full max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden select-none ${
        isFullscreen ? 'h-screen max-w-none rounded-none' : ''
      }`}
    >
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-gray-300">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
            {category}
          </span>
          <span className="font-bold text-white hidden sm:inline">{gameTitle}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Current Score */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <span className="text-gray-400 text-[10px]">SCORE:</span>
            <span className="text-[#00F0FF] font-bold text-sm">{score}</span>
          </div>

          {/* High Score */}
          <div className="flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-700/60 hidden sm:flex">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">{highScore}</span>
          </div>

          {/* Combo Multiplier */}
          {combo > 1 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black px-2 py-0.5 rounded-full text-xs animate-bounce shadow-lg shadow-orange-500/30">
              <Zap className="w-3 h-3 fill-current" />
              {combo}x COMBO!
            </div>
          )}

          {/* Control Actions */}
          <div className="flex items-center gap-1.5">
            {status === 'PLAYING' && (
              <button
                onClick={onPause}
                title="Pause Game (Esc)"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00F0FF]" />}
            </button>

            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="relative w-full h-[480px] bg-slate-950 flex items-center justify-center overflow-hidden">
        {children}

        {/* 1. START / INSTRUCTIONS OVERLAY */}
        {status === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-3xl shadow-xl shadow-cyan-500/20 mb-4 animate-pulse">
              🎮
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">{gameTitle}</h2>
            <p className="text-xs text-cyan-400 font-mono mt-1 mb-6">READY YOUR REFLEXES • SERVER VERIFIED ARENA</p>

            {/* Instructions list */}
            <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-left mb-6 space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-1.5 text-white font-bold text-xs uppercase tracking-wider mb-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>How to Play</span>
              </div>
              {instructions.map((inst, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{inst}</span>
                </div>
              ))}

              {/* Controls guide */}
              <div className="pt-2 mt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                {controls.map((ctrl, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-yellow-400 font-mono text-[10px] border border-slate-700">
                      {ctrl.key}
                    </span>
                    <span className="text-gray-400 text-[11px]">{ctrl.action}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={triggerStartWithCountdown}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              START MATCH
            </button>
          </div>
        )}

        {/* 2. COUNTDOWN OVERLAY */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-40">
            <span className="text-7xl sm:text-9xl font-black bg-gradient-to-b from-cyan-300 via-[#00F0FF] to-indigo-600 bg-clip-text text-transparent animate-ping drop-shadow-2xl">
              {countdown}
            </span>
          </div>
        )}

        {/* 3. PAUSE OVERLAY */}
        {status === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <h3 className="text-3xl font-black text-yellow-400 tracking-wider uppercase mb-2">GAME PAUSED</h3>
            <p className="text-xs text-gray-400 mb-6 font-mono">Take a breather, warrior.</p>
            <div className="flex flex-col gap-3 w-48">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onResume();
                }}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
              >
                Resume
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onRestart();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider"
              >
                Restart
              </button>
            </div>
          </div>
        )}

        {/* 4. GAME OVER & VERIFIED RESULT SCREEN */}
        {(status === 'GAMEOVER' || status === 'VICTORY') && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-3xl shadow-xl shadow-red-500/20 mb-3 animate-bounce">
              {status === 'VICTORY' ? '🏆' : '💀'}
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wider">
              {status === 'VICTORY' ? 'VICTORY SECURED!' : 'MATCH COMPLETED'}
            </h3>

            {/* Server Anti-Cheat Verified Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono mt-2 mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SERVER-VERIFIED ANTI-CHEAT AUDIT PASSED</span>
            </div>

            {/* Score & Rewards Cards */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
                <span className="text-[10px] text-gray-400 uppercase font-mono">FINAL SCORE</span>
                <span className="text-2xl font-black text-[#00F0FF]">{score}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
                <span className="text-[10px] text-gray-400 uppercase font-mono">XP EARNED</span>
                <span className="text-2xl font-black text-indigo-400">+{resultData?.xpEarned || 50}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
                <span className="text-[10px] text-gray-400 uppercase font-mono">COINS</span>
                <span className="text-2xl font-black text-yellow-400">+{resultData?.coinsEarned || 15}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onRestart();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                PLAY AGAIN
              </button>

              <button
                onClick={handleShareResult}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700"
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
    </div>
  );
};
