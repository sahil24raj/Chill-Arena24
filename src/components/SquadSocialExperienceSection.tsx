'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { soundFx } from '@/lib/audio';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import {
  Users,
  KeyRound,
  Share2,
  Hourglass,
  Flame,
  Crown,
  Skull,
  ArrowRight,
  Sparkles,
  Zap,
  Play
} from 'lucide-react';

const SOCIAL_STEPS = [
  {
    step: '01',
    action: 'CREATE ROOM',
    headline: 'Create Your Vibe',
    description: 'Pick any game in 1 click. Get an instant, private 6-character room code with zero sign-up friction.',
    badge: 'INSTANT LOBBY',
    icon: Sparkles,
    highlightColor: 'border-[#D946EF]/50 text-[#F472B6]',
    quote: 'Dost bulao. Game lagao.'
  },
  {
    step: '02',
    action: 'INVITE FRIENDS',
    headline: 'Call Your Squad',
    description: 'Share your 1-tap invite link directly to WhatsApp, Discord or copy the room code to your group chat.',
    badge: '1-TAP INVITE',
    icon: Share2,
    highlightColor: 'border-[#06B6D4]/50 text-[#38BDF8]',
    quote: 'Who in your squad always says "last game"?'
  },
  {
    step: '03',
    action: 'WAITING ROOM',
    headline: 'Squad Loading... 👀',
    description: 'Watch friends drop in live with real-time avatars, ready badges, and live room matchmaking.',
    badge: 'LIVE SYNC',
    icon: Hourglass,
    highlightColor: 'border-purple-500/50 text-purple-300',
    quote: 'Bas ek aur game.'
  },
  {
    step: '04',
    action: 'GAME START',
    headline: 'LET THE CHAOS BEGIN',
    description: 'Simultaneous action, synchronized turns, high-energy rounds, and instant voice/text banter.',
    badge: 'CHAOS MODE',
    icon: Flame,
    highlightColor: 'border-amber-500/50 text-amber-400',
    quote: 'No downloads. No boring setup. Just play.'
  },
  {
    step: '05',
    action: 'THE RESULT',
    headline: 'VIBE KING 👑 or Bro... Skill Issue 💀',
    description: 'Winner gets crowned Vibe King with confetti fireworks. Losers get roasted on the squad leaderboard.',
    badge: 'BRAGGING RIGHTS',
    icon: Crown,
    highlightColor: 'border-[#EC4899]/50 text-[#F472B6]',
    quote: 'Your squad is waiting.'
  }
];

export const SquadSocialExperienceSection: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const { openMultiplayerModal } = useAppStore();

  const currentStep = SOCIAL_STEPS[activeStepIndex];

  return (
    <section className="w-full space-y-10 py-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10131D] border border-white/10 text-xs font-mono text-[#06B6D4]">
          <Users className="w-3.5 h-3.5" />
          <span>BUILT FOR SQUAD MOMENTS</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
          WHERE FRIENDS <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] via-[#A855F7] to-[#06B6D4]">
            COME TO PLAY.
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
          Not another solitary single-player arcade. Vibe Arena is designed around friendship, hilarious competition, and unhinged squad banter.
        </p>
      </div>

      {/* Step Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SOCIAL_STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = idx === activeStepIndex;

          return (
            <button
              key={s.step}
              onClick={() => {
                soundFx.playClick();
                setActiveStepIndex(idx);
              }}
              className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 border ${
                isActive
                  ? 'bg-[#181C2A] border-[#D946EF]/50 shadow-lg shadow-[#D946EF]/10'
                  : 'bg-[#10131D] border-white/[0.06] hover:border-white/20 hover:bg-[#141824]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold ${isActive ? 'text-[#D946EF]' : 'text-slate-500'}`}>
                  {s.step}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#06B6D4]' : 'text-slate-500'}`} />
              </div>

              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{s.action}</div>
                <div className={`text-xs font-bold font-display mt-0.5 truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {s.headline}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Step Spotlight Showcase Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#10131D] border border-white/10 relative overflow-hidden shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#D946EF]/15 via-transparent to-transparent pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Step Breakdown */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-slate-300">
              <span className="font-bold text-[#D946EF]">STEP {currentStep.step}</span>
              <span>•</span>
              <span>{currentStep.badge}</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black text-white font-display">
              {currentStep.headline}
            </h3>

            <p className="text-sm text-slate-300 font-sans leading-relaxed max-w-lg">
              {currentStep.description}
            </p>

            {/* Conversational Quote */}
            <div className="p-3.5 rounded-xl bg-[#080A12] border border-white/[0.08] inline-flex items-center gap-2.5 text-xs font-mono text-[#38BDF8]">
              <span>💬</span>
              <span>"{currentStep.quote}"</span>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  soundFx.playClick();
                  openMultiplayerModal(GAMES_CATALOG[0]);
                }}
                className="px-6 py-3 rounded-full va-btn-primary text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Create Your Vibe Room</span>
              </button>

              <Link
                href="/multiplayer"
                onClick={() => soundFx.playClick()}
                className="px-6 py-3 rounded-full va-btn-secondary text-xs font-semibold flex items-center gap-2"
              >
                <span>Learn How It Works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: Live Experience Simulation Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#080A12] border border-white/10 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono border-b border-white/[0.08] pb-3">
                <span className="text-slate-400">ROOM #X7K92P</span>
                <span className="text-emerald-400 font-bold">● ONLINE</span>
              </div>

              {/* Simulation State Visual */}
              <div className="space-y-2.5 py-1">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#10131D] border border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">👑</span>
                    <div>
                      <div className="text-xs font-bold text-white font-display">Aarav (Host)</div>
                      <div className="text-[10px] font-mono text-emerald-400">VIBE KING 👑</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">1,450 pts</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#10131D] border border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🎯</span>
                    <div>
                      <div className="text-xs font-bold text-white font-display">Priya</div>
                      <div className="text-[10px] font-mono text-[#38BDF8]">Runner Up</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">1,200 pts</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#10131D] border border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">💀</span>
                    <div>
                      <div className="text-xs font-bold text-white font-display">Kabir</div>
                      <div className="text-[10px] font-mono text-red-400">Bro... Skill Issue 💀</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400">450 pts</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[11px] font-mono text-slate-500">
                Synchronized across all browsers in realtime
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SquadSocialExperienceSection;
