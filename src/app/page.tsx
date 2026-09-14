'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Gamepad2,
  Flame,
  Trophy,
  Sparkles,
  Play,
  Star,
  Zap,
  Cpu,
  Activity,
  Terminal
} from 'lucide-react';

export default function HomePage() {
  const { user, openSpinModal } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    '🇮🇳 Indian Meme Games',
    '😂 Meme Games',
    '🏃 Endless Runner',
    '⚡ Reaction',
    '🧠 Puzzle',
    '🎯 Skill Games'
  ];

  const filteredGames = selectedCategory === 'ALL'
    ? GAMES_CATALOG
    : GAMES_CATALOG.filter((g) => g.category === selectedCategory);

  const featuredGame = GAMES_CATALOG[0];

  return (
    <div className="space-y-12 pb-12">
      {/* SaaS Terminal Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl glass-panel p-8 lg:p-12 border-[#00F0FF]/25 bg-[#0e1015]/95 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-gradient-to-tr from-[#00F0FF]/15 to-[#ADFF2F]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center relative z-10">
          <div className="lg:col-span-3 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[10px] font-mono text-[#00F0FF]">
              <Sparkles className="w-3.5 h-3.5 text-[#ADFF2F]" />
              <span>MEME-GAMING SYSTEM STATUS: OPTIMAL</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-none text-white font-display uppercase">
              DECENTRALISED <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#00f0ff]/80 to-[#ADFF2F] neon-text-cyan">
                MEME ENGINE
              </span>
            </h1>

            <p className="text-xs text-gray-400 font-sans leading-relaxed max-w-lg">
              Compile, deploy, and execute Gen-Z micro-games natively in your sandbox. 0% installs. 100% processing throughput. Escape ACP Pradyuman, smash cricket sixes, and brew cutting chai in 60 FPS.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={`/game/${featuredGame.id}`}
                onClick={() => soundFx.playClick()}
                className="cyber-button px-8 py-3.5 rounded font-display text-xs font-black flex items-center gap-2.5 shadow-xl transition-all shadow-[#00F0FF]/10"
              >
                <Play className="w-4 h-4 fill-slate-950" /> EXECUTE CAUGHT MODI
              </Link>

              <button
                onClick={() => {
                  soundFx.playClick();
                  openSpinModal();
                }}
                className="px-6 py-3.5 rounded bg-[#111318] border border-gray-800 hover:border-[#ADFF2F]/50 text-xs font-black text-[#ADFF2F] flex items-center gap-2 transition-all font-display hover:bg-[#ADFF2F]/5"
              >
                <span>CLAIM DAILY SPIN</span>
              </button>
            </div>

            {/* Tech SaaS Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-850 font-mono text-[10px] text-gray-500">
              <div>
                <span className="text-lg font-bold text-[#00F0FF] block">500,000+</span>
                <span>ACTIVE_NODES</span>
              </div>
              <div>
                <span className="text-lg font-bold text-[#ADFF2F] block">1.4 Million</span>
                <span>MEME_LOADS</span>
              </div>
              <div>
                <span className="text-lg font-bold text-pink-500 block">&lt; 1.5ms</span>
                <span>LATENCY_PING</span>
              </div>
            </div>
          </div>

          {/* Hero Featured Game Preview HUD */}
          <div className="lg:col-span-2 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00F0FF]/20 to-[#ADFF2F]/10 rounded-xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative rounded-xl overflow-hidden glass-panel border-[#00F0FF]/25 p-4 bg-[#0e1015]">
              <div className="flex justify-between items-center mb-3 font-mono text-[9px]">
                <span className="text-[#00F0FF] flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-[#ADFF2F]" /> NODE_HIGHLIGHT: HOT
                </span>
                <span className="text-[#ADFF2F] bg-[#ADFF2F]/10 px-2 py-0.5 rounded border border-[#ADFF2F]/20">
                  ★ 4.97_RATING
                </span>
              </div>

              <div className="relative aspect-video rounded overflow-hidden bg-slate-950 flex items-center justify-center border border-gray-850 group-hover:scale-[1.01] transition-transform">
                <img
                  src={featuredGame.bannerImage}
                  alt={featuredGame.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
                  <span className="text-2xl mb-1">{featuredGame.thumbnail}</span>
                  <h3 className="text-base font-black text-white font-display">{featuredGame.title}</h3>
                  <p className="text-[10px] text-gray-300 font-sans line-clamp-1">{featuredGame.tagline}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Dashboard controls */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="font-display">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#00F0FF]" /> MEME PROTOCOL REPOSITORIES
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Select category to filter execution threads</p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-[#111318] p-1 rounded-lg border border-gray-850">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded text-[10px] font-bold font-mono tracking-tight transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/35'
                    : 'text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Game Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.id}`}
              onClick={() => soundFx.playClick()}
              className="glass-card rounded-xl overflow-hidden group cursor-pointer border-[#00F0FF]/10 bg-[#111318]"
            >
              <div className="relative aspect-video bg-slate-950 overflow-hidden border-b border-gray-850">
                <img
                  src={game.bannerImage}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                />
                <div className="absolute top-3 left-3 bg-[#0a0c10]/95 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-mono text-[#00F0FF] border border-[#00F0FF]/30">
                  {game.category.toUpperCase()}
                </div>
                <div className="absolute top-3 right-3 bg-[#0a0c10]/95 backdrop-blur-md px-2.5 py-1 rounded text-[9px] font-mono text-[#ADFF2F] flex items-center gap-1 border border-[#ADFF2F]/30">
                  <Star className="w-3 h-3 fill-[#ADFF2F] text-[#ADFF2F]" /> {game.rating}
                </div>
                <div className="absolute inset-0 bg-[#0A0C10]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-11 h-11 rounded bg-[#00F0FF] flex items-center justify-center text-slate-950 shadow-lg shadow-[#00F0FF]/20">
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{game.thumbnail}</span>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#00F0FF] transition-colors font-display">
                    {game.title}
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed line-clamp-2 h-8">
                  {game.description}
                </p>

                <div className="flex items-center justify-between text-[9px] font-mono pt-3 border-t border-gray-850 text-gray-500">
                  <span>LOADS: {(game.playCount / 1000).toFixed(1)}K</span>
                  <span className="text-[#00F0FF] font-bold group-hover:translate-x-0.5 transition-transform">RUN_NODE &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SaaS Diagnostics Console */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Quests Widget */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border-[#00F0FF]/15 bg-[#111318]/90 space-y-4">
          <div className="flex items-center justify-between font-display">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#ADFF2F]" /> SYSTEM_DIAG_QUESTS
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">NEXT_REFRESH: 48h</span>
          </div>

          <div className="space-y-3 font-mono">
            <div className="p-4 rounded bg-[#0e1015] border border-gray-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏃‍♂️</span>
                <div>
                  <h4 className="text-[11px] font-bold text-white">MODI_RUN_CHASE_MAX</h4>
                  <p className="text-[9px] text-gray-500">Escape ACP Pradyuman for 1,000+ points</p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-[#ADFF2F] bg-[#ADFF2F]/10 px-2.5 py-1 rounded border border-[#ADFF2F]/20">
                +300 COINS
              </span>
            </div>

            <div className="p-4 rounded bg-[#0e1015] border border-gray-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">☕</span>
                <div>
                  <h4 className="text-[11px] font-bold text-white">CHAI_SERVER_CYCLE</h4>
                  <p className="text-[9px] text-gray-500">Deploy 50 cutting chais to client nodes</p>
                </div>
              </div>
              <span className="text-[9px] font-bold text-[#ADFF2F] bg-[#ADFF2F]/10 px-2.5 py-1 rounded border border-[#ADFF2F]/20">
                +500 COINS
              </span>
            </div>
          </div>
        </div>

        {/* Leaderboard HUD */}
        <div className="glass-panel p-6 rounded-xl border-[#00F0FF]/15 bg-[#111318]/90 space-y-4">
          <div className="flex items-center justify-between font-display">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#00F0FF]" /> HIGHEST_CORE_METRICS
            </h3>
            <Link href="/leaderboard" className="text-[10px] text-[#00F0FF] font-mono hover:underline">
              ALL_USERS
            </Link>
          </div>

          <div className="space-y-2.5 font-mono">
            {[
              { rank: 1, name: 'Gigachad_69', score: '14,250 pts', avatar: '🗿' },
              { rank: 2, name: 'Daya_Smash', score: '11,890 pts', avatar: '🚪' },
              { rank: 3, name: 'ChaiTapriBoss', score: '9,450 pts', avatar: '☕' }
            ].map((usr) => (
              <div key={usr.rank} className="flex items-center justify-between p-2.5 rounded bg-[#0e1015] border border-gray-850 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className={`font-bold w-4 text-center ${usr.rank === 1 ? 'text-[#ADFF2F]' : 'text-gray-500'}`}>
                    #0{usr.rank}
                  </span>
                  <span className="text-sm">{usr.avatar}</span>
                  <span className="text-gray-300 font-semibold">{usr.name}</span>
                </div>
                <span className="font-bold text-[#00F0FF]">{usr.score}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
