'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { Sparkles, TrendingUp, Zap, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export const MemeClickerCanvas = () => {
  const { addCoins, addXP, updateHighScore } = useAppStore();

  const [views, setViews] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [clickPower, setClickPower] = useState(1);
  const [autoTrolls, setAutoTrolls] = useState(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundFx.playCoin();
    const added = clickPower * multiplier;
    const newViews = views + added;
    setViews(newViews);
    addCoins(added);
    addXP(1);
    updateHighScore('meme-clicker', newViews);

    if (newViews % 500 === 0) {
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const buyPowerUpgrade = () => {
    const cost = clickPower * 50;
    if (views >= cost) {
      soundFx.playLevelUp();
      setViews(views - cost);
      setClickPower(clickPower + 1);
    }
  };

  const buyAutoTroll = () => {
    const cost = (autoTrolls + 1) * 150;
    if (views >= cost) {
      soundFx.playLevelUp();
      setViews(views - cost);
      setAutoTrolls(autoTrolls + 1);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto glass-panel p-6 rounded-2xl border-purple-800/40 text-center shadow-2xl">
      <div className="flex justify-between items-center mb-6 text-xs font-black">
        <span className="text-pink-400 text-lg">🔥 Viral Views: {views}</span>
        <span className="text-cyan-400">⚡ Click Power: +{clickPower}</span>
        <span className="text-amber-400">🤖 Auto-Trolls: {autoTrolls}/sec</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Main Clicker Target */}
        <div className="flex flex-col items-center justify-center p-8 bg-slate-950/80 rounded-2xl border border-purple-900/60 shadow-inner">
          <button
            onClick={handleClick}
            className="w-44 h-44 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 p-1.5 shadow-2xl shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center text-6xl group-hover:rotate-12 transition-transform">
              📈
              <span className="text-xs font-bold text-cyan-300 mt-2">TAP VIRAL MEME</span>
            </div>
          </button>
          <span className="text-xs text-gray-400 mt-4">Click as fast as you can to farm Viral Views & Meme Coins!</span>
        </div>

        {/* Upgrades Store */}
        <div className="flex flex-col gap-3 text-left">
          <h3 className="text-sm font-black uppercase text-purple-300 tracking-wider flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4" /> Viral Upgrades
          </h3>

          <button
            onClick={buyPowerUpgrade}
            disabled={views < clickPower * 50}
            className="p-3 rounded-xl bg-slate-900 border border-purple-800/40 flex items-center justify-between hover:border-cyan-400 transition-colors disabled:opacity-50"
          >
            <div>
              <span className="text-xs font-bold text-white block">🚀 Upgrade Dank Post Quality</span>
              <span className="text-[10px] text-gray-400">+1 Click Power multiplier</span>
            </div>
            <span className="text-xs font-black text-amber-400">Cost: {clickPower * 50} Views</span>
          </button>

          <button
            onClick={buyAutoTroll}
            disabled={views < (autoTrolls + 1) * 150}
            className="p-3 rounded-xl bg-slate-900 border border-purple-800/40 flex items-center justify-between hover:border-cyan-400 transition-colors disabled:opacity-50"
          >
            <div>
              <span className="text-xs font-bold text-white block">🤖 Hire Internet Auto-Trolls</span>
              <span className="text-[10px] text-gray-400">Generates passive viral clicks per second</span>
            </div>
            <span className="text-xs font-black text-amber-400">Cost: {(autoTrolls + 1) * 150} Views</span>
          </button>
        </div>
      </div>
    </div>
  );
};
