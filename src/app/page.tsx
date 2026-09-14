'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore, Game } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { HeroTrendingCarousel } from '@/components/HeroTrendingCarousel';
import { JackpotterGameRow } from '@/components/JackpotterGameRow';
import { SquadPartyLounge } from '@/components/SquadPartyLounge';
import { DailyChallengesSection } from '@/components/DailyChallengesSection';
import { RecentMatchesCommunity } from '@/components/RecentMatchesCommunity';
import { MultiplayerLobbyModal } from '@/components/MultiplayerLobbyModal';
import {
  Sparkles,
  Flame,
  GraduationCap,
  Brain,
  Users,
  Coffee,
  Trophy,
  Swords,
  Crown,
  ArrowRight
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Games', icon: Sparkles, color: 'from-[#00F0FF] to-[#00A3FF]' },
  { id: 'school', label: 'School Nostalgia', icon: GraduationCap, color: 'from-[#FFB800] to-[#FF8800]' },
  { id: 'mind', label: 'Mind Battles', icon: Brain, color: 'from-[#9945FF] to-[#14F195]' },
  { id: 'meme', label: 'Desi Meme Vibes', icon: Coffee, color: 'from-[#FF6B6B] to-[#FFE66D]' },
  { id: 'multiplayer', label: '1v1 Duels', icon: Users, color: 'from-[#00F0FF] to-[#7928CA]' }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('all');
  const { openMultiplayerModal } = useAppStore();

  const trendingGames: Game[] = [
    GAMES_CATALOG.find((g) => g.id === 'pen-flip')!,
    GAMES_CATALOG.find((g) => g.id === 'modi-run')!,
    GAMES_CATALOG.find((g) => g.id === 'spin-cricket')!,
    GAMES_CATALOG.find((g) => g.id === 'cid-escape')!,
    GAMES_CATALOG.find((g) => g.id === 'chai-tapri')!,
    GAMES_CATALOG.find((g) => g.id === 'word-builder')!
  ].filter(Boolean);

  const schoolVibes: Game[] = GAMES_CATALOG.filter((g) => g.categoryKey === 'school');
  const mindGames: Game[] = GAMES_CATALOG.filter((g) => g.categoryKey === 'mind');
  const memeGames: Game[] = GAMES_CATALOG.filter((g) => g.categoryKey === 'meme');
  const multiplayerGames: Game[] = GAMES_CATALOG.filter((g) => g.multiplayer);

  const topPlayers = [
    { rank: 1, name: 'Gigachad_69', score: '24,850 pts', avatar: '🗿', badge: 'Meme Emperor', winRate: '88%' },
    { rank: 2, name: 'Daya_Smash', score: '19,420 pts', avatar: '🚪', badge: 'CID Destroyer', winRate: '82%' },
    { rank: 3, name: 'ChaiTapriBoss', score: '15,750 pts', avatar: '☕', badge: 'Tapri Master', winRate: '79%' }
  ];

  const filteredGames = React.useMemo(() => {
    if (activeTab === 'all') return null;
    if (activeTab === 'multiplayer') return multiplayerGames;
    return GAMES_CATALOG.filter((g) => g.categoryKey === activeTab);
  }, [activeTab, multiplayerGames]);

  return (
    <div className="space-y-12">
      <MultiplayerLobbyModal />

      {/* 1. HERO TRENDING 5-GAME SLIDER */}
      <HeroTrendingCarousel />

      {/* 2. CATEGORY FILTER NAVIGATION PILLS */}
      <section className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-3 min-w-max p-0.5">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id);
                }}
                className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-display text-xs font-bold transition-all duration-200 border whitespace-nowrap leading-normal ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0F1629] to-[#151D33] border-[#00F0FF] text-white shadow-lg shadow-[#00F0FF]/15 scale-[1.02]'
                    : 'bg-[#0D1220] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 hover:bg-[#12192C]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-transform group-hover:scale-110 ${
                    isActive
                      ? `bg-gradient-to-tr ${tab.color} text-slate-950 font-black`
                      : 'bg-slate-800 text-gray-400 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{tab.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tab Filtered View IF Tab is selected */}
      {filteredGames ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
              <span className="text-[#00F0FF]">●</span>
              <span>
                {CATEGORY_TABS.find((t) => t.id === activeTab)?.label} ({filteredGames.length})
              </span>
            </h2>
            <button
              onClick={() => setActiveTab('all')}
              className="text-xs font-mono text-gray-400 hover:text-[#00F0FF] transition-colors"
            >
              Show All Categories &rarr;
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredGames.map((game) => (
              <div key={game.id} className="w-full">
                <JackpotterGameRow.Card game={game} />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-12">
          {/* 3. 🔥 TRENDING NOW ROW */}
          <JackpotterGameRow
            title="🔥 Trending & Top Played"
            subtitle="Most active games right now with live player duels & high score battles"
            games={trendingGames}
            badge="HOT ARCADE"
            badgeColor="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/40 text-red-300"
            viewAllLink="/categories"
          />

          {/* 4. 🏫 SCHOOL & COLLEGE NOSTALGIA */}
          <JackpotterGameRow
            title="🏫 School Vibes & Classroom Duels"
            subtitle="Pen flip tricks, eraser battles, desk spin cricket & hostel corridors"
            games={schoolVibes}
            badge="NOSTALGIA"
            badgeColor="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300"
            viewAllLink="/categories?cat=school"
          />

          {/* 5. 🧠 MIND BATTLES & COGNITIVE ARENA */}
          <JackpotterGameRow
            title="🧠 Mind Battles & IQ Duels"
            subtitle="Rapid puzzle duels, lightning word builders & reflex cognitive speed"
            games={mindGames}
            badge="IQ WARS"
            badgeColor="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300"
            viewAllLink="/categories?cat=mind"
          />

          {/* 6. ☕ INDIAN MEME & TAPRI VIBES */}
          <JackpotterGameRow
            title="☕ Desi Memes & Tapri Vibes"
            subtitle="Escape ACP Pradyuman, run from Modi, and brew 50 cutting chais for office techies"
            games={memeGames}
            badge="VIRAL"
            badgeColor="bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-300"
            viewAllLink="/categories?cat=meme"
          />
        </div>
      )}

      {/* 7. SQUAD CHILL & BACKCHODI LOUNGE */}
      <SquadPartyLounge />

      {/* 8. 1V1 QUICK DUEL CHALLENGE BANNER */}
      <section className="p-6 sm:p-8 rounded-3xl border border-[#00F0FF]/30 bg-gradient-to-r from-[#0C1527] via-[#0E1B33] to-[#080D18] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#00F0FF]/10 to-transparent pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-xs font-mono text-[#00F0FF]">
              <Swords className="w-3.5 h-3.5" />
              <span>1V1 MULTIPLAYER QUICK DUELS</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
              GOT 60 SECONDS? CHALLENGE A FRIEND TO A DUEL.
            </h3>

            <p className="text-xs sm:text-sm text-gray-300 font-sans max-w-xl leading-relaxed">
              Create an instant room code (like #A82KD), share the link in WhatsApp or Discord, and settle hostel bets in Pen Flip, Spin Cricket or Word Scramble with 0 downloads!
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <button
              onClick={() => {
                soundFx.playClick();
                openMultiplayerModal();
              }}
              className="py-3.5 px-6 rounded-xl cyber-button font-display text-xs font-black text-slate-950 flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-transform"
            >
              <Swords className="w-4 h-4" />
              <span>CREATE CUSTOM DUEL ROOM</span>
            </button>
            <Link
              href="/multiplayer"
              onClick={() => soundFx.playClick()}
              className="py-3 px-6 rounded-xl bg-slate-900/90 border border-gray-800 hover:border-[#00F0FF] text-xs font-bold font-display text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <span>MULTIPLAYER LOBBY HUB &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 9. LEADERBOARD PODIUM SUMMARY */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0D1220]/90 border border-gray-800/80 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-black text-white font-display">
                🏆 GLOBAL LEADERBOARD & PODIUM
              </h2>
            </div>
            <p className="text-xs text-gray-400 font-sans mt-1">
              Top champions across all 12 games. Compete weekly to win legendary badges & 50,000 coins!
            </p>
          </div>

          <Link
            href="/leaderboard"
            onClick={() => soundFx.playClick()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-xs font-mono font-bold text-[#00F0FF] hover:bg-[#00F0FF]/20 transition-all hover:translate-x-0.5 shrink-0"
          >
            <span>FULL LEADERBOARD</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Podium Top 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPlayers.map((usr) => (
            <div
              key={usr.rank}
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between relative overflow-hidden ${
                usr.rank === 1
                  ? 'bg-gradient-to-tr from-amber-500/15 via-[#121927] to-[#0A0E17] border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-[#0B0F1A] border-gray-800 hover:border-gray-700'
              }`}
            >
              {usr.rank === 1 && (
                <div className="absolute top-2 right-2 text-amber-400/30">
                  <Crown className="w-12 h-12" />
                </div>
              )}
              <div className="flex items-center gap-3.5 relative z-10">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm border ${
                    usr.rank === 1
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : usr.rank === 2
                      ? 'bg-gray-400/20 border-gray-400/40 text-gray-300'
                      : 'bg-amber-700/20 border-amber-700/40 text-amber-600'
                  }`}
                >
                  #{usr.rank}
                </div>
                <div className="w-11 h-11 rounded-xl bg-slate-900 border border-gray-800 flex items-center justify-center text-2xl shadow-inner">
                  {usr.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-display">{usr.name}</h4>
                  <span className="text-[10px] text-gray-400 font-mono block">{usr.badge}</span>
                  <span className="text-[9px] text-emerald-400 font-mono">Winrate: {usr.winRate}</span>
                </div>
              </div>

              <div className="text-right font-mono relative z-10">
                <span
                  className={`text-sm font-black block ${
                    usr.rank === 1 ? 'text-amber-400' : 'text-[#00F0FF]'
                  }`}
                >
                  {usr.score}
                </span>
                <span className="text-[9px] text-gray-500">POINTS</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. DAILY CHALLENGES SECTION */}
      <DailyChallengesSection />

      {/* 11. RECENT COMMUNITY MATCHES */}
      <RecentMatchesCommunity />
    </div>
  );
}
