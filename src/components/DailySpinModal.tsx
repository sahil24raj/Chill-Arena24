'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { X, Gift, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DailySpinModal = () => {
  const { user, activeSpinModal, closeSpinModal, spinDailyReward } = useAppStore();
  const [spinning, setSpinning] = useState(false);
  const [rewardResult, setRewardResult] = useState<string | null>(null);

  if (!activeSpinModal) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = user.badges.some((b) => b.id === `spin_${todayStr}`);

  const handleSpin = () => {
    if (spinning || isClaimedToday) return;
    setSpinning(true);
    soundFx.playSpin();

    setTimeout(() => {
      const result = spinDailyReward();
      setSpinning(false);
      setRewardResult(result.rewardName);

      if (result.alreadyClaimed) {
        soundFx.playBuzzer();
      } else {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm glass-panel p-6 rounded-2xl border-amber-500/40 shadow-2xl shadow-amber-900/40 text-center">
        <button
          onClick={() => {
            soundFx.playClick();
            closeSpinModal();
            setRewardResult(null);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-slate-900/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto mb-3 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/40">
          🎁
        </div>

        <h3 className="text-xl font-black text-white tracking-wide">
          Daily Meme Wheel <span className="text-amber-400">Spin & Win</span>
        </h3>
        <p className="text-xs text-gray-400 mt-1 mb-6">
          Spin daily for free Meme Coins, XP Boosters, and Exclusive Gigachad Skins!
        </p>

        {/* Wheel representation */}
        <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
          <div
            className={`w-full h-full rounded-full border-4 border-amber-400/80 bg-gradient-to-tr from-purple-900 via-pink-900 to-amber-900 p-2 shadow-xl shadow-amber-500/20 flex items-center justify-center transition-all duration-1000 ${
              spinning ? 'animate-spin' : ''
            }`}
          >
            <div className="grid grid-cols-2 gap-2 text-2xl">
              <span>🪙</span>
              <span>👑</span>
              <span>⚡</span>
              <span>💎</span>
            </div>
          </div>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 text-2xl animate-bounce">
            🔻
          </div>
        </div>

        {rewardResult ? (
          <div className="bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400/50 p-4 rounded-xl mb-4">
            <span className="text-xs font-bold text-amber-300 block uppercase tracking-wider mb-1">
              🎉 Congratulations!
            </span>
            <span className="text-lg font-black text-white block">
              {rewardResult}
            </span>
          </div>
        ) : null}

        <button
          onClick={handleSpin}
          disabled={spinning || isClaimedToday}
          className="cyber-button w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Gift className="w-4 h-4" />
          <span>
            {spinning
              ? 'Spinning...'
              : isClaimedToday
              ? 'CLAIMED TODAY (NEXT AT 00:00 UTC)'
              : 'SPIN WHEEL NOW!'}
          </span>
        </button>
      </div>
    </div>
  );
};
