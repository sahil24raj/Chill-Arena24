'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, Flame, Shield, Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full glass-panel border-t border-purple-900/40 mt-20 pt-12 pb-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Brand info */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center font-black text-cyan-400">
                M
              </div>
            </div>
            <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300">
              MEMEVERSE
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            The ultimate AAA-inspired web gaming platform for viral meme games, Indian pop culture hits, endless runners, and multiplayer roast battles.
          </p>
          <div className="flex gap-3 text-lg mt-1">
            <span className="cursor-pointer hover:scale-125 transition-transform">🔥</span>
            <span className="cursor-pointer hover:scale-125 transition-transform">🇮🇳</span>
            <span className="cursor-pointer hover:scale-125 transition-transform">🎮</span>
            <span className="cursor-pointer hover:scale-125 transition-transform">🗿</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider mb-3 flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5" /> Popular Categories
          </h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><Link href="/categories" className="hover:text-purple-300">🇮🇳 Indian Meme Games</Link></li>
            <li><Link href="/categories" className="hover:text-purple-300">🏃 Endless Runner</Link></li>
            <li><Link href="/categories" className="hover:text-purple-300">⚡ Reaction & Skill</Link></li>
            <li><Link href="/categories" className="hover:text-purple-300">🧠 Tycoon & Puzzles</Link></li>
          </ul>
        </div>

        {/* Community & Events */}
        <div>
          <h4 className="text-xs font-black uppercase text-pink-400 tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Community & Events
          </h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><Link href="/leaderboard" className="hover:text-purple-300">🏆 Global Leaderboard</Link></li>
            <li><Link href="/shop" className="hover:text-purple-300">👑 Battle Pass & Cosmetics</Link></li>
            <li><Link href="/admin" className="hover:text-purple-300">🛡️ Creator Dashboard</Link></li>
            <li><span className="text-emerald-400 font-bold">🎉 Diwali Special Tournaments</span></li>
          </ul>
        </div>

        {/* Meme News Digest */}
        <div className="bg-purple-950/40 p-4 rounded-xl border border-purple-800/30">
          <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider mb-2 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" /> Meme News Digest
          </h4>
          <p className="text-[11px] text-gray-300 italic mb-2">
            &quot;Modi Run hits 1.4 Million plays on MemeVerse! Daya door smashing record broken in CID Escape!&quot;
          </p>
          <span className="text-[10px] text-cyan-400 font-bold">Updated Today • Gen-Z Gaming Network</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-purple-900/30 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
        <span>© 2026 MemeVerse Inc. Production-Ready Gaming Platform.</span>
        <span className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 inline" /> for Meme Lovers & Gamers worldwide.
        </span>
      </div>
    </footer>
  );
};
