'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { ShoppingBag, Sparkles, Crown, Zap, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ShopPage() {
  const { user, addCoins } = useAppStore();

  const shopItems = [
    { id: 'pass_1', name: 'Gigachad Battle Pass (Season 1)', price: '₹199 / Mo', type: 'Battle Pass', desc: 'Unlock exclusive Modi & Daya skins, 5,000 Meme Coins & VIP Chat Frame!', image: '👑', highlight: true },
    { id: 'skin_modi_gold', name: 'Gold rally Jacket Modi', price: '1,500 Coins', type: 'Skin', desc: 'Shine on the rally track with 24k Gold Saffron jacket!', image: '✨' },
    { id: 'skin_daya_laser', name: 'Laser Door Smasher Daya', price: '2,000 Coins', type: 'Skin', desc: 'Smash doors with neon blue plasma energy effects!', image: '⚡' },
    { id: 'coins_5000', name: '5,000 Meme Coins Pack', price: '₹99', type: 'Currency', desc: 'Instant coin boost for skins and daily spin retries!', image: '🪙' }
  ];

  const handleBuy = (itemName: string) => {
    soundFx.playLevelUp();
    confetti({ particleCount: 60, spread: 70 });
    alert(`Successfully Purchased ${itemName}!`);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white flex items-center justify-center gap-2">
          <ShoppingBag className="w-8 h-8 text-pink-500" /> MemeVerse Shop & Battle Pass
        </h1>
        <p className="text-xs text-gray-400">Unlock Battle Passes, Cosmetic Skins, Profile Frames, & Coin Bundles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shopItems.map((item) => (
          <div
            key={item.id}
            className={`glass-panel p-6 rounded-2xl border-purple-900/40 relative flex flex-col justify-between ${
              item.highlight ? 'border-amber-500/60 shadow-xl shadow-amber-500/20' : ''
            }`}
          >
            {item.highlight && (
              <span className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                FEATURED PASS
              </span>
            )}

            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-purple-800/40 flex items-center justify-center text-4xl mb-2">
                {item.image}
              </div>
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{item.type}</span>
                <h3 className="text-lg font-black text-white">{item.name}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-purple-900/30 flex items-center justify-between">
              <span className="text-base font-black text-amber-400">{item.price}</span>
              <button
                onClick={() => handleBuy(item.name)}
                className="cyber-button px-6 py-2.5 rounded-full text-xs font-black text-white shadow-lg"
              >
                UNLOCKED / BUY
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
