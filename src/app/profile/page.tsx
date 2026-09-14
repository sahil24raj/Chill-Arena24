'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  User,
  Trophy,
  Award,
  Zap,
  Flame,
  Swords,
  Sparkles,
  Shield,
  Star,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function ProfilePage() {
  const { user, recentlyPlayedIds } = useAppStore();

  const xpInLevel = user.xp % 500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / 500) * 100));

  const recentlyPlayedGames = recentlyPlayedIds
    .map((id) => GAMES_CATALOG.find((g) => g.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Profile Header Banner */}
      <div className="p-8 rounded-3xl glass-panel border border-[#00F0FF]/25 bg-gradient-to-r from-[#0e1420] to-[#080b10] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar Frame */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#00F0FF] via-purple-500 to-[#ADFF2F] p-1 shadow-xl shadow-[#00F0FF]/20">
              <div className="w-full h-full bg-[#080b10] rounded-[22px] flex items-center justify-center text-5xl">
                {user.avatar}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[#ADFF2F] text-slate-950 font-mono font-black text-[10px] shadow">
              LVL {user.level}
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center justify-center sm:justify-start gap-2">
                  <span>{user.username}</span>
                  <span className="text-xs font-mono font-normal text-[#00F0FF] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                    CLASSROOM VETERAN
                  </span>
                </h1>
                <p className="text-xs text-gray-400 font-sans">
                  Member of MemeVerse Arena • Streak: {user.streak} Days Active 🔥
                </p>
              </div>

              {/* Currency Badges */}
              <div className="flex items-center justify-center gap-2 font-mono text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-400 font-bold">
                  🪙 {user.coins} Coins
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-purple-500/30 text-purple-300 font-bold">
                  ✨ {user.xp} Total XP
                </div>
              </div>
            </div>

            {/* Level XP Progress Bar */}
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                <span>LEVEL {user.level} PROGRESS</span>
                <span>{xpInLevel} / 500 XP ({xpPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-gray-800 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F] rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gamer Career Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-gray-800 bg-[#0c1017]/90 text-center">
          <span className="text-[10px] text-gray-400 font-mono block">GAMES PLAYED</span>
          <span className="text-2xl font-black text-white font-display">{user.stats.gamesPlayed}</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-gray-800 bg-[#0c1017]/90 text-center">
          <span className="text-[10px] text-gray-400 font-mono block">TOTAL MATCH WINS</span>
          <span className="text-2xl font-black text-[#ADFF2F] font-display">{user.stats.totalWins}</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-gray-800 bg-[#0c1017]/90 text-center">
          <span className="text-[10px] text-gray-400 font-mono block">WIN RATE</span>
          <span className="text-2xl font-black text-[#00F0FF] font-display">{user.stats.winRate}%</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-gray-800 bg-[#0c1017]/90 text-center">
          <span className="text-[10px] text-gray-400 font-mono block">CLASSROOM ROASTS WON</span>
          <span className="text-2xl font-black text-pink-400 font-display">{user.stats.roastsWon}</span>
        </div>
      </div>

      {/* Badges & Unlocked Accolades */}
      <div className="p-6 lg:p-8 rounded-3xl glass-panel border border-gray-800 bg-[#0c1017]/90 space-y-4">
        <h3 className="text-base font-black text-white font-display flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> UNLOCKED ARENA BADGES & TROPHIES ({user.badges.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.badges.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-gray-850 flex items-center gap-3.5 hover:border-[#00F0FF]/40 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-gray-800 flex items-center justify-center text-2xl shrink-0 shadow">
                {b.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-display">{b.name}</h4>
                <p className="text-[10px] text-gray-400 font-sans mt-0.5">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game-Specific High Scores */}
      <div className="p-6 lg:p-8 rounded-3xl glass-panel border border-gray-800 bg-[#0c1017]/90 space-y-4">
        <h3 className="text-base font-black text-white font-display flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#00F0FF]" /> PERSONAL HIGH SCORES
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 font-mono">
          {Object.entries(user.stats.highScores).map(([gameKey, score]) => {
            const game = GAMES_CATALOG.find((g) => g.id === gameKey);
            return (
              <div
                key={gameKey}
                className="p-3 rounded-xl bg-slate-950 border border-gray-850 flex flex-col justify-between space-y-1"
              >
                <span className="text-[10px] text-gray-400 truncate">
                  {game?.title.split(':')[0] || gameKey}
                </span>
                <span className="text-base font-black text-[#ADFF2F]">{score} pts</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recently Played Games */}
      <div className="p-6 lg:p-8 rounded-3xl glass-panel border border-gray-800 bg-[#0c1017]/90 space-y-4">
        <h3 className="text-base font-black text-white font-display flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" /> RECENTLY PLAYED ARENAS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentlyPlayedGames.map((game) => (
            <Link
              key={game!.id}
              href={`/game/${game!.id}`}
              onClick={() => soundFx.playClick()}
              className="p-4 rounded-2xl bg-slate-950 border border-gray-850 hover:border-[#00F0FF] transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-gray-800 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                {game!.thumbnail}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white group-hover:text-[#00F0FF] transition-colors font-display truncate">
                  {game!.title.split(':')[0]}
                </h4>
                <span className="text-[9px] text-gray-500 font-mono block">Play again &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
