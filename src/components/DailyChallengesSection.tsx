'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { Target, CheckCircle2, Gift, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DailyChallengesSection: React.FC = () => {
  const { challenges, claimChallenge } = useAppStore();

  const handleClaim = (challengeId: string) => {
    soundFx.playCoin();
    claimChallenge(challengeId);
    confetti({ particleCount: 40, spread: 50 });
  };

  return (
    <section className="p-6 lg:p-8 rounded-3xl glass-panel border border-[#00F0FF]/20 bg-[#0e1218]/90 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#ADFF2F]" />
            <h2 className="text-xl font-black text-white font-display">🎯 DAILY CHALLENGES & MISSIONS</h2>
          </div>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Complete daily classroom & meme duels to earn bonus Meme Coins and level up faster!
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-gray-500 bg-slate-950 px-3 py-1.5 rounded-lg border border-gray-800">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>RESETS DAILY AT 00:00 UTC</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {challenges.map((ch) => {
          const isComplete = ch.progress >= ch.target;
          const percentage = Math.min(100, Math.round((ch.progress / ch.target) * 100));

          return (
            <div
              key={ch.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                ch.claimed
                  ? 'bg-slate-950/40 border-gray-900 opacity-60'
                  : isComplete
                  ? 'bg-gradient-to-b from-[#ADFF2F]/10 to-slate-950 border-[#ADFF2F]/40 shadow-lg shadow-[#ADFF2F]/10'
                  : 'bg-slate-950/80 border-gray-800/80 hover:border-gray-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-2xl">{ch.icon}</span>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="text-amber-300 font-bold">+{ch.rewardCoins} 🪙</span>
                    <span className="text-[#00F0FF] font-bold">+{ch.rewardXP} XP</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white font-display leading-tight">{ch.title}</h3>
                  <p className="text-[10px] text-gray-400 font-sans line-clamp-2 mt-1">{ch.description}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-800/50">
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                  <span>PROGRESS</span>
                  <span className={isComplete ? 'text-[#ADFF2F] font-bold' : 'text-gray-300'}>
                    {ch.progress} / {ch.target} ({percentage}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-gray-800 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isComplete ? 'bg-[#ADFF2F]' : 'bg-gradient-to-r from-blue-500 to-[#00F0FF]'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Action Button */}
                {ch.claimed ? (
                  <div className="py-1.5 text-center text-[10px] font-mono text-gray-500 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gray-600" />
                    <span>CLAIMED</span>
                  </div>
                ) : isComplete ? (
                  <button
                    onClick={() => handleClaim(ch.id)}
                    className="w-full py-1.5 rounded-lg bg-[#ADFF2F] hover:bg-[#9de824] text-slate-950 text-xs font-black font-display flex items-center justify-center gap-1.5 shadow-md shadow-[#ADFF2F]/20 animate-pulse"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>CLAIM REWARDS</span>
                  </button>
                ) : (
                  <div className="py-1 text-center text-[10px] font-mono text-gray-500">
                    IN PROGRESS
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
