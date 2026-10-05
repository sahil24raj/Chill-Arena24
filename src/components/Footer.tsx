'use client';

import React from 'react';
import Link from 'next/link';
import { soundFx } from '@/lib/audio';
import { VibeArenaLogo } from '@/components/VibeArenaLogo';
import { Swords, Trophy, Users, Shield, Code2, Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#080A12] py-14 px-4 lg:px-8 mt-20 text-slate-400">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              onClick={() => soundFx.playClick()}
              className="inline-block"
            >
              <VibeArenaLogo size="md" showTagline={true} />
            </Link>

            <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm">
              A social gaming playground where friends create instant rooms, play quick multiplayer games, compete, joke around, and spend time together. Zero downloads, pure unadulterated vibe.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10131D] border border-white/[0.08] text-[11px] font-mono text-[#F472B6]">
              <span>✨</span>
              <span>Dost. Games. Full Vibe.</span>
            </div>
          </div>

          {/* Col 2: Games */}
          <div className="space-y-3 font-display">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">PICK YOUR VIBE</h4>
            <ul className="space-y-2 text-xs font-sans text-slate-400">
              <li>
                <Link href="/categories?cat=squad" className="hover:text-white transition-colors">
                  🎭 Squad Games (Chor Sipahi)
                </Link>
              </li>
              <li>
                <Link href="/categories?cat=nostalgia" className="hover:text-white transition-colors">
                  🎒 School Nostalgia (Pen Flip)
                </Link>
              </li>
              <li>
                <Link href="/categories?cat=brain" className="hover:text-white transition-colors">
                  🧠 Brain Games (Word Builder)
                </Link>
              </li>
              <li>
                <Link href="/categories?cat=duel" className="hover:text-white transition-colors">
                  ⚔️ 1v1 Battles (Tic-Tac-Toe)
                </Link>
              </li>
              <li>
                <Link href="/categories?cat=meme" className="hover:text-white transition-colors">
                  🔥 Desi Meme Games (CID Escape)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div className="space-y-3 font-display">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">PLATFORM</h4>
            <ul className="space-y-2 text-xs font-sans text-slate-400">
              <li>
                <Link href="/multiplayer" className="hover:text-white transition-colors">
                  🎮 Play with Friends
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-white transition-colors">
                  🏆 Vibe Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  👤 Gamer Profile & Stats
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  🪙 Vibe Rewards Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Squad Banter */}
          <div className="space-y-3 font-display">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">THE SQUAD CODE</h4>
            <div className="p-3.5 rounded-2xl bg-[#10131D] border border-white/[0.08] space-y-2">
              <div className="text-[11px] font-mono text-[#38BDF8]">"Bas ek aur game."</div>
              <div className="text-[10px] text-slate-400 leading-relaxed">
                Who in your squad always says "last game"? Drop the room link and let the chaos begin.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            &copy; {new Date().getFullYear()} Vibe Arena. All rights reserved. Where Friends Come to Play.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-[#EC4899] fill-[#EC4899]" />
              <span>for friends who game together</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
