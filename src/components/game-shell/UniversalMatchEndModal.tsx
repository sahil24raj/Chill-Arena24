'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Trophy, RotateCcw, LayoutGrid, ArrowLeft, Share2, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '@/lib/audio';

export interface MatchStatItem {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export interface UniversalMatchEndModalProps {
  isOpen: boolean;
  gameTitle: string;
  gameId: string;
  winnerTitle: string;
  winnerSubtitle?: string;
  isDraw?: boolean;
  isVictory?: boolean;
  stats: MatchStatItem[];
  onPlayAgain: () => void;
  onChangeMode?: () => void;
  onExit?: () => void;
}

export const UniversalMatchEndModal: React.FC<UniversalMatchEndModalProps> = ({
  isOpen,
  gameTitle,
  gameId,
  winnerTitle,
  winnerSubtitle,
  isDraw = false,
  isVictory = true,
  stats,
  onPlayAgain,
  onChangeMode,
  onExit,
}) => {
  useEffect(() => {
    if (isOpen) {
      if (isVictory && !isDraw) {
        soundFx.playVictory();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
        });
      } else {
        soundFx.playGameOver();
      }
    }
  }, [isOpen, isVictory, isDraw]);

  if (!isOpen) return null;

  const handleShare = () => {
    soundFx.playClick();
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `🎮 Match Result: ${winnerTitle} in ${gameTitle} on Chill Arena! Can you beat me? https://chill-arena24.vercel.app/game/${gameId}`
      );
      alert('Match result copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0e1422] to-[#070a12] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,240,255,0.2)] text-center my-auto">
        {/* Glow backdrop */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Icon / Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-3xl sm:text-4xl shadow-2xl shadow-yellow-500/30 mb-4 animate-bounce">
          {isDraw ? '🤝' : isVictory ? '🏆' : '💀'}
        </div>

        {/* Game Title */}
        <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-widest mb-1">
          {gameTitle} • MATCH FINISHED
        </div>

        {/* Winner Banner */}
        <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide">
          {winnerTitle}
        </h2>
        {winnerSubtitle && (
          <p className="text-xs sm:text-sm text-gray-300 font-sans mt-1.5 max-w-sm mx-auto">
            {winnerSubtitle}
          </p>
        )}

        {/* Match Stats Grid */}
        {stats.length > 0 && (
          <div className="my-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-inner">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex flex-col items-center justify-center"
              >
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <span
                  className={`text-base sm:text-lg font-black font-mono mt-0.5 ${
                    stat.highlight ? 'text-[#00F0FF]' : 'text-white'
                  }`}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Play Again */}
          <button
            onClick={() => {
              soundFx.playClick();
              onPlayAgain();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-sm font-display uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,240,255,0.4)] active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN (REMATCH)</span>
          </button>

          {/* Change Mode */}
          {onChangeMode && (
            <button
              onClick={() => {
                soundFx.playClick();
                onChangeMode();
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-purple-400" />
              <span>CHANGE GAME MODE</span>
            </button>
          )}

          {/* Share Duel Link & Back */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleShare}
              className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-gray-300 hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>SHARE DUEL</span>
            </button>

            <Link
              href="/games"
              onClick={() => {
                soundFx.playClick();
                if (onExit) onExit();
              }}
              className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-gray-400 hover:text-[#00F0FF] text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>GAMES CATALOG</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
