'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { ShoppingBag, Sparkles, Crown, Zap, Check, AlertCircle, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShopItemDef {
  id: string;
  name: string;
  priceCoins: number;
  type: string;
  desc: string;
  image: string;
  skinKey?: string;
  highlight?: boolean;
}

export default function ShopPage() {
  const { user, buyShopItem } = useAppStore();
  const [purchaseMsg, setPurchaseMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const shopItems: ShopItemDef[] = [
    {
      id: 'skin_neon_visor',
      skinKey: 'neon_visor',
      name: 'Cyber Neon Visor',
      priceCoins: 350,
      type: 'Avatar Skin',
      desc: 'Sleek holographic cyber visor for your gamer avatar!',
      image: '🕶️'
    },
    {
      id: 'skin_gold_crown',
      skinKey: 'gold_crown',
      name: '24K Gold Champion Crown',
      priceCoins: 800,
      type: 'Avatar Skin',
      desc: 'Gleaming royal gold crown earned by arena champions!',
      image: '👑',
      highlight: true
    },
    {
      id: 'skin_modi_gold',
      skinKey: 'modi_gold',
      name: 'Gold Saffron Rally Jacket',
      priceCoins: 1200,
      type: 'Special Skin',
      desc: 'Shine on the rally track with radiant 24k Gold jacket!',
      image: '✨'
    },
    {
      id: 'skin_daya_laser',
      skinKey: 'daya_laser',
      name: 'Laser Door Smasher Plasma',
      priceCoins: 1500,
      type: 'Special Skin',
      desc: 'Smash doors with neon blue plasma energy aura!',
      image: '⚡'
    }
  ];

  const handleBuy = (item: ShopItemDef) => {
    const isUnlocked = item.skinKey && user.unlockedSkins.includes(item.skinKey);
    if (isUnlocked) {
      setPurchaseMsg({ text: `Already unlocked ${item.name}! Equipped on profile.` });
      return;
    }

    const res = buyShopItem({
      id: item.id,
      name: item.name,
      priceCoins: item.priceCoins,
      skinKey: item.skinKey
    });

    if (res.success) {
      confetti({ particleCount: 60, spread: 70 });
      setPurchaseMsg({ text: `🎉 Successfully unlocked & equipped ${item.name}!` });
    } else {
      soundFx.playHit();
      setPurchaseMsg({ text: res.error || 'Failed to purchase', isError: true });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white flex items-center justify-center gap-2">
          <ShoppingBag className="w-8 h-8 text-pink-500" /> Chill Arena Shop & Cosmetics
        </h1>
        <p className="text-xs text-gray-400">Unlock authentic avatar skins and cosmetics using your earned Meme Coins</p>

        {/* Real User Coins Balance */}
        <div className="inline-flex items-center gap-2 bg-slate-950 px-4 py-1.5 rounded-full border border-amber-500/40 text-amber-300 font-mono text-xs font-bold mt-2 shadow-lg shadow-amber-950/40">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>YOUR COIN BALANCE: {user.coins} 🪙</span>
        </div>
      </div>

      {purchaseMsg && (
        <div
          className={`p-3 rounded-2xl border text-xs font-bold max-w-xl mx-auto flex items-center justify-center gap-2 animate-fadeIn ${
            purchaseMsg.isError
              ? 'bg-red-950/80 border-red-500/50 text-red-200'
              : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
          }`}
        >
          {purchaseMsg.isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          <span>{purchaseMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shopItems.map((item) => {
          const isUnlocked = item.skinKey && user.unlockedSkins.includes(item.skinKey);
          const canAfford = user.coins >= item.priceCoins;

          return (
            <div
              key={item.id}
              className={`glass-panel p-6 rounded-2xl border-purple-900/40 relative flex flex-col justify-between ${
                item.highlight ? 'border-amber-500/60 shadow-xl shadow-amber-500/20' : ''
              }`}
            >
              {item.highlight && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  FEATURED
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
                <span className="text-base font-black text-amber-400">{item.priceCoins} Coins 🪙</span>
                {isUnlocked ? (
                  <span className="px-4 py-2 rounded-full text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> UNLOCKED
                  </span>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`px-6 py-2.5 rounded-full text-xs font-black transition-all ${
                      canAfford
                        ? 'cyber-button text-white shadow-lg cursor-pointer hover:scale-105'
                        : 'bg-slate-900 text-gray-500 border border-gray-800 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'PURCHASE' : 'NEED MORE COINS'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
