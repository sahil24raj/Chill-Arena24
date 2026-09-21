'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { Activity, Swords, Users, Play, Shield } from 'lucide-react';

export const RecentMatchesCommunity: React.FC = () => {
  const { user, recentMatches, openMultiplayerModal } = useAppStore();

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Live Recent Matches Feed */}
      <div className="lg:col-span-8 p-6 lg:p-8 rounded-3xl glass-panel border border-[#00F0FF]/20 bg-[#0e1218]/90 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00F0FF]" />
            <h2 className="text-lg font-black text-white font-display">RECENT 1V1 DUEL CLUTCHES</h2>
          </div>
          <span className="text-[10px] font-mono text-[#00F0FF] flex items-center gap-1 font-bold">
            <Shield className="w-3 h-3 text-[#ADFF2F]" /> MATCH HISTORY
          </span>
        </div>

        {recentMatches.length > 0 ? (
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
                    <span className="text-[#00F0FF] font-bold">
                      {m.player1.name} ({m.player1.score})
                    </span>
                    <span className="text-gray-500 font-sans">vs</span>
                    <span className="text-pink-400 font-bold">
                      {m.player2.name} ({m.player2.score})
                    </span>
                  </div>

                  {m.roastQuote && (
                    <p className="text-[10px] text-amber-300/90 font-sans italic pt-0.5">
                      "{m.roastQuote}"
                    </p>
                  )}
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
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-gray-850 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-800/40 text-2xl flex items-center justify-center mx-auto text-cyan-400">
              ⚔️
            </div>
            <p className="text-xs font-bold text-gray-300">No match history recorded yet</p>
            <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
              Play a local 1v1 duel or create an online room code to record your head-to-head match history!
            </p>
          </div>
        )}
      </div>

      {/* Online Squad & Quick Challenge List */}
      <div className="lg:col-span-4 p-6 rounded-3xl glass-panel border border-purple-500/20 bg-[#0e1218]/90 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-black text-white font-display">INSTANT 1V1 DUELS</h3>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-display">🎮 Pass & Play (Local)</span>
                <span className="text-[10px] text-[#ADFF2F]">Same Device</span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                Take turns flipping pens and spinning cricket wheels with a friend right beside you.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-display">🔗 Room Code Duel</span>
                <span className="text-[10px] text-[#00F0FF]">Online Link</span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                Generate a 5-character private code and share via WhatsApp or Discord for real-time play.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            openMultiplayerModal();
          }}
          className="w-full py-3 rounded-xl cyber-button font-display text-xs font-black text-slate-950 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
        >
          <Swords className="w-4 h-4" />
          <span>CREATE MULTIPLAYER ROOM</span>
        </button>
      </div>
    </section>
  );
};
