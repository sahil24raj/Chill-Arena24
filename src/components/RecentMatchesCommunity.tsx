'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { Activity, MessageSquare, Swords, Users, Trophy, Flame } from 'lucide-react';

export const RecentMatchesCommunity: React.FC = () => {
  const { recentMatches, openMultiplayerModal } = useAppStore();

  const onlineFriends = [
    { name: 'Gully_Master99', avatar: '🏏', status: 'Playing Spin Cricket', badge: 'School Legend' },
    { name: 'ChaiLover_OP', avatar: '☕', status: 'Brewing Cutting Chai', badge: 'Tapri Owner' },
    { name: 'Backbencher_Raju', avatar: '😎', status: 'In Pen Flip Lobby #K89', badge: 'Flipping Pro' },
    { name: 'AuntyKiBalcony', avatar: '👵', status: 'Dodging Sixers', badge: 'Meme Lord' }
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Live Recent Matches Feed */}
      <div className="lg:col-span-8 p-6 lg:p-8 rounded-3xl glass-panel border border-[#00F0FF]/20 bg-[#0e1218]/90 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00F0FF]" />
            <h2 className="text-lg font-black text-white font-display">COMMUNITY & RECENT DUEL CLUTCHES</h2>
          </div>
          <span className="text-[10px] font-mono text-[#ADFF2F] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-ping" /> LIVE ARENA ACTIVITY
          </span>
        </div>

        <div className="space-y-3 font-mono">
          {recentMatches.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-gray-800/80 hover:border-[#00F0FF]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-lg">{m.gameIcon}</span>
                  <span className="font-bold text-white font-display">{m.gameTitle}</span>
                  <span className="text-gray-600 text-[10px]">•</span>
                  <span className="text-[10px] text-gray-500">{m.timeAgo}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                  <span className="text-[#00F0FF] font-bold">{m.player1.name} ({m.player1.score})</span>
                  <span className="text-gray-500 font-sans">vs</span>
                  <span className="text-pink-400 font-bold">{m.player2.name} ({m.player2.score})</span>
                </div>

                <p className="text-[10px] text-amber-300/90 font-sans italic pt-0.5">
                  "{m.roastQuote}"
                </p>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-[#ADFF2F] bg-[#ADFF2F]/10 px-2 py-0.5 rounded border border-[#ADFF2F]/20">
                  👑 {m.winner.split('_')[0]} WON
                </span>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    openMultiplayerModal();
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-purple-800/40 hover:border-[#00F0FF] text-[10px] font-bold text-white hover:text-[#00F0FF] flex items-center gap-1 font-display"
                >
                  <Swords className="w-3 h-3" /> Rematch
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Online Squad & Quick Challenge List */}
      <div className="lg:col-span-4 p-6 rounded-3xl glass-panel border border-purple-500/20 bg-[#0e1218]/90 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-black text-white font-display">FRIENDS & CHALLENGES</h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400">4 ONLINE</span>
          </div>

          <div className="space-y-2.5 font-mono">
            {onlineFriends.map((f, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-gray-800 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-base shrink-0">
                    {f.avatar}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{f.name}</span>
                    <span className="text-[9px] text-[#00F0FF] block truncate">{f.status}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    openMultiplayerModal();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#00F0FF]/15 hover:bg-[#00F0FF] border border-[#00F0FF]/40 text-[#00F0FF] hover:text-slate-950 text-[10px] font-bold font-display transition-colors shrink-0"
                >
                  DUEL
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            openMultiplayerModal();
          }}
          className="w-full py-3 rounded-xl cyber-button font-display text-xs font-black text-slate-950 flex items-center justify-center gap-2 shadow-lg"
        >
          <Swords className="w-4 h-4" />
          <span>CREATE MULTIPLAYER ROOM</span>
        </button>
      </div>
    </section>
  );
};
