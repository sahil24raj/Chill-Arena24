'use client';

import React from 'react';
import Link from 'next/link';
import { soundFx } from '@/lib/audio';
import { ChillArenaLogo } from '@/components/ChillArenaLogo';
import { Gamepad2, Heart, Sparkles, Trophy, Users, Shield, Code2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-800/80 bg-[#05070a] py-12 px-4 lg:px-8 mt-16 text-gray-400">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              onClick={() => soundFx.playClick()}
              className="flex items-center"
            >
              <ChillArenaLogo size="md" showTagline={false} />
            </Link>

            <p className="text-xs text-gray-400 font-sans leading-relaxed max-w-sm">
              The ultimate Indian multiplayer gaming lounge. Built for midnight hostel banter, canteen pen flips, and chaotic squad roasts with friends. 0 downloads. 100% pure dopamine.
            </p>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-[11px] font-mono text-[#ADFF2F]">
              💬 "Built for midnight hostel banter, canteen pen flips, and chaotic squad roasts."
            </div>
          </div>

          {/* Col 2: Games */}
          <div className="space-y-3 font-display">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">GAME MODES</h4>
            <ul className="space-y-2 text-xs font-sans text-gray-400">
              <li>
                <Link href="/categories?cat=meme" className="hover:text-[#00F0FF] transition-colors">
                  🔥 Trending Meme Games
                </Link>
              </li>
              <li>
                <Link href="/categories?cat=school" className="hover:text-amber-400 transition-colors">
                  🏫 School Vibes Duels
                </Link>
              </li>
              <li>
                <Link href="/categories?cat=mind" className="hover:text-purple-400 transition-colors">
                  🧠 Mind Games Arena
                </Link>
              </li>
              <li>
                <Link href="/multiplayer" className="hover:text-[#ADFF2F] transition-colors">
                  👥 1v1 Pass & Play
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div className="space-y-3 font-display">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">PLATFORM</h4>
            <ul className="space-y-2 text-xs font-sans text-gray-400">
              <li>
                <Link href="/leaderboard" className="hover:text-[#00F0FF] transition-colors">
                  🏆 Global Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#00F0FF] transition-colors">
                  🚀 Player Profile & XP
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#00F0FF] transition-colors">
                  🪙 Meme Coin Shop
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#00F0FF] transition-colors">
                  🛡️ System Diagnostics
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Community & Legal */}
          <div className="space-y-3 font-display">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">COMMUNITY</h4>
            <ul className="space-y-2 text-xs font-sans text-gray-400">
              <li>
                <a href="https://github.com/sahil24raj/Chill-Arena24" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#00F0FF]" /> GitHub Repository
                </a>
              </li>
              <li>
                <span className="text-gray-500 text-[11px] block">Privacy Policy</span>
              </li>
              <li>
                <span className="text-gray-500 text-[11px] block">Terms of Service</span>
              </li>
              <li>
                <span className="text-gray-500 text-[11px] block">Support & Squad Chat</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-gray-500">
          <span>&copy; {new Date().getFullYear()} CHILL ARENA Gaming Platform. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <span>Powered by Next.js 16 & Turbopack</span>
            <span>•</span>
            <span className="text-[#ADFF2F]">● 60 FPS WebAudio Synthesis</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
