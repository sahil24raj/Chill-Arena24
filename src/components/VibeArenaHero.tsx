'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { VibeArenaLogo } from '@/components/VibeArenaLogo';
import {
  Play,
  Users,
  Copy,
  Check,
  Sparkles,
  Swords,
  Crown,
  Share2,
  Gamepad2,
  ArrowRight,
  Zap,
  MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VibeArenaHero: React.FC = () => {
  const { openMultiplayerModal } = useAppStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [squadPings, setSquadPings] = useState([
    { id: 1, name: 'Aarav', avatar: '👑', status: 'Ready to roast', time: 'now' },
    { id: 2, name: 'Priya', avatar: '🎯', status: 'Challenged in Spin Cricket', time: '1m ago' },
    { id: 3, name: 'Kabir', avatar: '🥷', status: 'In Chor Sipahi room #X7K92P', time: '3m ago' }
  ]);
  const [demoRoomCode] = useState('X7K92P');

  const handleCopyLink = () => {
    soundFx.playCoin();
    setCopiedLink(true);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`https://vibearena.fun/play/room/${demoRoomCode}`);
    }
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendPing = () => {
    soundFx.playLevelUp();
    confetti({ particleCount: 35, spread: 60 });
    const avatars = ['🚀', '⚡', '🔥', '👑', '😎', '🍕'];
    const names = ['Rohan', 'Sneha', 'Vikram', 'Ananya', 'Dev', 'Tara'];
    const quotes = ['Bas ek aur game!', 'Skill issue incoming 💀', 'Ready for rematch', 'King in the room 👑'];
    const newPing = {
      id: Date.now(),
      name: names[Math.floor(Math.random() * names.length)],
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      status: quotes[Math.floor(Math.random() * quotes.length)],
      time: 'just now'
    };
    setSquadPings((prev) => [newPing, ...prev.slice(0, 2)]);
  };

  return (
    <section className="relative w-full pt-4 pb-8 md:pt-6 md:pb-12 overflow-hidden">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#D946EF]/10 via-[#8B5CF6]/10 to-[#06B6D4]/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Narrative Headline & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Small Brand Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10131D] border border-white/10 text-xs font-mono text-[#F472B6]">
            <span className="w-2 h-2 rounded-full bg-[#D946EF] animate-pulse" />
            <span className="font-bold tracking-wider uppercase">VIBE ARENA</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Dost. Games. Full Vibe.</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black font-display tracking-tight text-white uppercase leading-[0.95]">
              YOUR SQUAD. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F472B6] via-[#D946EF] to-[#A855F7]">
                YOUR ARENA.
              </span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#06B6D4] to-[#0284C7]">
                YOUR VIBE.
              </span>
            </h1>
          </div>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-slate-300 font-sans max-w-xl leading-relaxed">
            Play quick games, challenge your friends, roast your squad and create unforgettable moments. Zero downloads. Zero tedious setups. Just instant pure fun.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <Link
              href="#pick-your-vibe"
              onClick={() => soundFx.playClick()}
              className="px-8 py-3.5 rounded-full va-btn-primary text-sm font-black tracking-wide flex items-center justify-center gap-2.5 shadow-lg group cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white transition-transform group-hover:scale-110" />
              <span>PLAY NOW</span>
            </Link>

            <button
              onClick={() => {
                soundFx.playClick();
                openMultiplayerModal(GAMES_CATALOG[0]);
              }}
              className="px-8 py-3.5 rounded-full va-btn-secondary text-sm font-bold tracking-wide flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#06B6D4] transition-transform group-hover:scale-110" />
              <span>INVITE YOUR SQUAD</span>
            </button>
          </div>

          {/* Social Proof Tags / Micro Points */}
          <div className="pt-3 flex flex-wrap items-center gap-5 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">⚡</span>
              <span>Instant Room Codes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#06B6D4]">📱</span>
              <span>Mobile & Desktop Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#D946EF]">👑</span>
              <span>Chor Sipahi & 12+ Games</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Squad Room Playground Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl bg-[#10131D] border border-white/10 p-6 shadow-2xl space-y-5 transition-all hover:border-[#D946EF]/30">
            
            {/* Top Room Status Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D946EF] to-[#06B6D4] flex items-center justify-center text-sm font-bold shadow-md">
                  VA
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-display">Squad Room #X7K92P</div>
                  <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Matchmaking</span>
                  </div>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono font-bold text-slate-300">
                4/4 SQUAD
              </div>
            </div>

            {/* Active Game Preview */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-white/10 group">
              <Image
                src="/games/chor-sipahi.jpg"
                alt="Chor Sipahi Active Match"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-[#080A12]/40 to-transparent" />
              
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#080A12]/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#F472B6]">
                FEATURED MATCH
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                  <div className="text-xs font-mono text-[#38BDF8]">Round 3 of 5</div>
                  <div className="text-base font-black text-white font-display">Chor Sipahi (Raja Mantri)</div>
                </div>

                <Link
                  href="/game/chor-sipahi"
                  onClick={() => soundFx.playClick()}
                  className="px-3.5 py-1.5 rounded-lg va-btn-primary text-xs font-bold flex items-center gap-1 shadow-md"
                >
                  <span>Launch</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Live Squad Banter Feed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>RECENT SQUAD ACTIVITY</span>
                <button
                  onClick={handleSendPing}
                  className="text-[#06B6D4] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3" />
                  <span>Send Banter</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {squadPings.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#080A12]/80 border border-white/[0.06] text-xs transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{p.avatar}</span>
                      <span className="font-bold text-white font-display">{p.name}</span>
                      <span className="text-slate-400 text-[11px]">{p.status}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{p.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Share Bar */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Room Invite Link'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default VibeArenaHero;
