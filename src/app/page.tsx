'use client';

import React from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { HeroSection } from '@/components/HeroSection';
import { SchoolVibesSection } from '@/components/SchoolVibesSection';
import { MindGamesSection } from '@/components/MindGamesSection';
import { GameCard } from '@/components/GameCard';
import { DailyChallengesSection } from '@/components/DailyChallengesSection';
import { SquadPartyLounge } from '@/components/SquadPartyLounge';
import { RecentMatchesCommunity } from '@/components/RecentMatchesCommunity';
import { MultiplayerLobbyModal } from '@/components/MultiplayerLobbyModal';
import {
  Gamepad2,
  Flame,
  Trophy,
  Swords,
  Sparkles,
  Play,
  Star,
  Zap,
  Users,
  ArrowRight,
  Shield,
  Crown
} from 'lucide-react';

export default function HomePage() {
  const { openMultiplayerModal, openSpinModal } = useAppStore();

  const featuredGame = GAMES_CATALOG.find((g) => g.id === 'pen-flip') || GAMES_CATALOG[0];

  const trendingMemeGames = GAMES_CATALOG.filter((g) => g.categoryKey === 'meme');
  const schoolVibesGames = GAMES_CATALOG.filter((g) => g.categoryKey === 'school');
  const mindGames = GAMES_CATALOG.filter((g) => g.categoryKey === 'mind');

  const quickPlayGames = [
    GAMES_CATALOG.find((g) => g.id === 'pen-flip')!,
    GAMES_CATALOG.find((g) => g.id === 'modi-run')!,
    GAMES_CATALOG.find((g) => g.id === 'spin-cricket')!,
    GAMES_CATALOG.find((g) => g.id === 'word-builder')!,
    GAMES_CATALOG.find((g) => g.id === 'eraser-throw')!,
    GAMES_CATALOG.find((g) => g.id === 'tic-tac-toe')!
  ].filter(Boolean);

  const topPlayers = [
    { rank: 1, name: 'Gigachad_69', score: '18,450 pts', avatar: '🗿', badge: 'Meme Lord' },
    { rank: 2, name: 'Daya_Smash', score: '15,890 pts', avatar: '🚪', badge: 'CID Destroyer' },
    { rank: 3, name: 'ChaiTapriBoss', score: '11,750 pts', avatar: '☕', badge: 'Tapri Master' }
  ];

  return (
    <div className="space-y-16 pb-16">
      <MultiplayerLobbyModal />

      {/* 1. HERO SECTION */}
      <HeroSection
        featuredGame={featuredGame}
        onOpenMultiplayer={() => openMultiplayerModal()}
        onOpenSpin={() => openSpinModal()}
      />

      {/* 2. LIVE NOW / QUICK PLAY STRIP */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ADFF2F] animate-ping" />
            <h2 className="text-base font-black text-white font-display uppercase tracking-wider">
              ⚡ LIVE NOW / INSTANT QUICK PLAY
            </h2>
          </div>
          <span className="text-[11px] font-mono text-gray-400">Pick any game & start playing in 3 seconds</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickPlayGames.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.id}`}
              onClick={() => soundFx.playClick()}
              className="p-3 rounded-2xl bg-[#0f131c] border border-gray-800 hover:border-[#00F0FF] transition-all group flex flex-col items-center text-center space-y-2 hover:-translate-y-1 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-gray-800 group-hover:border-[#00F0FF]/50 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                {game.thumbnail}
              </div>
              <div className="w-full">
                <h4 className="text-xs font-bold text-white group-hover:text-[#00F0FF] transition-colors font-display truncate">
                  {game.title.split(':')[0]}
                </h4>
                <span className="text-[9px] text-gray-500 font-mono block">
                  ★ {game.rating} • {game.duration}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. 🔥 TRENDING MEME GAMES */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-6 rounded-3xl border border-pink-500/25 bg-gradient-to-r from-[#200c19] via-[#140810] to-[#080407] relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-pink-600/15 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-pink-500 via-rose-500 to-amber-500" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-xs font-mono text-pink-300">
              <Flame className="w-3.5 h-3.5 text-pink-500" />
              <span className="font-bold tracking-wider">VIRAL INDIAN & GEN-Z MEMES</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center gap-2.5">
              <span>🔥 TRENDING MEME GAMES</span>
              <span className="text-xs font-mono font-normal text-pink-400/80 px-2 py-0.5 rounded bg-pink-950/60 border border-pink-900/50">
                MODI CHASE • DAYA SMASH • TAPRI TYCOON
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 font-sans max-w-2xl leading-relaxed">
              Escape ACP Pradyuman, brew 50 cutting chais before office techies rage-quit, smash gully cricket sixes into aunty's balcony, and dodge toxic cringe emojis in 60 FPS!
            </p>
          </div>

          <Link
            href="/categories?cat=meme"
            onClick={() => soundFx.playClick()}
            className="relative z-10 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-xs font-bold text-pink-300 font-display transition-all hover:translate-x-1 shrink-0"
          >
            <span>VIEW ALL MEME GAMES ({trendingMemeGames.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingMemeGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              theme="meme"
              onQuickPlay={() => openMultiplayerModal(game)}
            />
          ))}
        </div>
      </section>

      {/* 4. 🏫 SCHOOL VIBES (NOSTALGIA ARENA) */}
      <SchoolVibesSection
        games={schoolVibesGames}
        onOpenMultiplayer={(game) => openMultiplayerModal(game)}
      />

      {/* 5. 🧠 MIND GAMES (COGNITIVE ESPORTS) */}
      <MindGamesSection
        games={mindGames}
        onOpenMultiplayer={(game) => openMultiplayerModal(game)}
      />

      {/* 6. ☕ SQUAD PARTY & ROAST LOUNGE */}
      <SquadPartyLounge />

      {/* 7. ⚡ QUICK DUELS & CHALLENGE BANNER */}
      <section className="p-8 rounded-3xl border-2 border-[#00F0FF]/30 bg-gradient-to-r from-[#0a121e] via-[#0e1626] to-[#070b12] relative overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-xs font-mono text-[#00F0FF]">
              <Swords className="w-3.5 h-3.5" />
              <span>1V1 MULTIPLAYER QUICK DUELS</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
              GOT 60 SECONDS? CHALLENGE YOUR FRIEND TO A DUEL.
            </h3>

            <p className="text-xs text-gray-300 font-sans max-w-xl">
              Create an instant room code (like #A82KD), share the link in Discord or WhatsApp, and start playing Pen Flip, Spin Cricket or Word Scramble instantly without any app installs.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <button
              onClick={() => {
                soundFx.playClick();
                openMultiplayerModal();
              }}
              className="py-4 px-6 rounded-xl cyber-button font-display text-xs font-black text-slate-950 flex items-center justify-center gap-2 shadow-xl"
            >
              <Swords className="w-4 h-4" />
              <span>CREATE CUSTOM DUEL ROOM</span>
            </button>
            <Link
              href="/multiplayer"
              onClick={() => soundFx.playClick()}
              className="py-3 px-6 rounded-xl bg-slate-900 border border-gray-800 hover:border-[#00F0FF] text-xs font-bold font-display text-gray-300 hover:text-white flex items-center justify-center gap-2"
            >
              <span>MULTIPLAYER LOBBY HUB &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. 🏆 LEADERBOARDS PODIUM SUMMARY */}
      <section className="p-6 lg:p-8 rounded-3xl glass-panel border border-[#00F0FF]/20 bg-[#0e1218]/90 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-black text-white font-display">🏆 TOP PLAYERS & PODIUM STANDINGS</h2>
            </div>
            <p className="text-xs text-gray-400 font-sans mt-0.5">
              Weekly tournament ranking based on total wins, classroom roasts & high scores.
            </p>
          </div>

          <Link
            href="/leaderboard"
            onClick={() => soundFx.playClick()}
            className="text-xs font-mono text-[#00F0FF] hover:underline flex items-center gap-1 font-bold"
          >
            VIEW FULL GLOBAL LEADERBOARD &rarr;
          </Link>
        </div>

        {/* Podium Top 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPlayers.map((usr) => (
            <div
              key={usr.rank}
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
                usr.rank === 1
                  ? 'bg-gradient-to-tr from-amber-500/15 via-slate-950 to-slate-950 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950/80 border-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 text-center font-display font-black text-base ${
                  usr.rank === 1 ? 'text-amber-400' : usr.rank === 2 ? 'text-gray-300' : 'text-amber-600'
                }`}>
                  #{usr.rank}
                </span>
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-gray-800 flex items-center justify-center text-xl">
                  {usr.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-display">{usr.name}</h4>
                  <span className="text-[10px] text-gray-500 font-mono">{usr.badge}</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className={`text-xs font-black block ${usr.rank === 1 ? 'text-amber-400' : 'text-[#00F0FF]'}`}>
                  {usr.score}
                </span>
                <span className="text-[9px] text-gray-500">POINTS</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. 🎯 DAILY CHALLENGES */}
      <DailyChallengesSection />

      {/* 10. COMMUNITY & RECENT MATCHES */}
      <RecentMatchesCommunity />

    </div>
  );
}
