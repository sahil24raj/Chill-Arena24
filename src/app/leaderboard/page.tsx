'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Globe,
  Users,
  Flame,
  Gamepad2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { soundFx } from '@/lib/audio';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { subscribeToCloudLeaderboard } from '@/lib/firebaseService';
import { LeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
  const { user } = useAppStore();
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('all');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Compute highest score of current user
  const highestUserScore = Math.max(0, ...Object.values(user.stats.highScores || {}));

  const loadData = useCallback(() => {
    setIsLoading(true);

    const unsubscribe = subscribeToCloudLeaderboard((cloudEntries) => {
      setIsLoading(false);
      if (cloudEntries && cloudEntries.length > 0) {
        const sorted = [...cloudEntries].sort((a, b) => b.score - a.score);
        const ranked = sorted.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
        setLeaderboardData(ranked);
      } else {
        setLeaderboardData([]);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsub = loadData();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [loadData]);

  // Filter by game
  const filteredData =
    selectedGameFilter === 'all'
      ? leaderboardData
      : leaderboardData.filter((entry) => entry.gameId === selectedGameFilter);

  const top1 = filteredData[0];
  const top2 = filteredData[1];
  const top3 = filteredData[2];

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-mono text-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>PRODUCTION CLOUD ESPORTS ARENA STANDINGS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          HALL OF FAME & RANKINGS
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-sans leading-relaxed">
          Real scores submitted by verified players across all classroom duels, endless runners, and rapid mind games.
        </p>

        {/* Live Sync Status Pill */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Live Server Anti-Cheat Verified Records</span>
          </div>
        </div>
      </div>

      {/* Game Filter Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-5xl mx-auto scrollbar-thin">
        <button
          onClick={() => {
            soundFx.playClick();
            setSelectedGameFilter('all');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedGameFilter === 'all'
              ? 'bg-gradient-to-r from-[#00F0FF] to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900 border border-slate-800 text-gray-400 hover:text-white'
          }`}
        >
          🌐 All Games Global
        </button>

        {GAMES_CATALOG.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              soundFx.playClick();
              setSelectedGameFilter(g.id);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedGameFilter === g.id
                ? 'bg-gradient-to-r from-[#00F0FF] to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 border border-slate-800 text-gray-400 hover:text-white'
            }`}
          >
            <span>{g.thumbnail}</span>
            <span>{g.title}</span>
          </button>
        ))}
      </div>

      {/* User Current Standing Info Card */}
      <div className="max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl border border-[#00F0FF]/30 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-blue-600 text-slate-950 flex items-center justify-center text-2xl font-bold shadow shrink-0">
            {user.avatar}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-sm font-black text-white">{user.displayName || user.username}</span>
              <span className="text-[10px] font-mono text-[#00F0FF] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                LVL {user.level}
              </span>
              <span className="text-[10px] font-mono text-yellow-400 px-1.5 py-0.5 rounded bg-yellow-950 border border-yellow-800">
                {user.rank || 'Bronze II'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Your Personal Best:{' '}
              <strong className="text-[#00F0FF] font-mono">
                {highestUserScore > 0 ? `${highestUserScore.toLocaleString()} pts` : 'No score recorded yet'}
              </strong>
            </p>
          </div>
        </div>

        <Link
          href="/games"
          onClick={() => soundFx.playClick()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20"
        >
          <Play className="w-4 h-4 fill-current" />
          PLAY TO SET RECORD
        </Link>
      </div>

      {/* Top 3 Podium Cards (Rendered if entries exist) */}
      {filteredData.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4 items-end">
          {/* Rank 2 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center order-2 sm:order-1 shadow-xl">
            <span className="text-3xl mb-1">🥈</span>
            <div className="text-3xl my-1">{top2.avatar}</div>
            <div className="text-sm font-black text-white">{top2.username}</div>
            <div className="text-[10px] text-gray-400 font-mono">{top2.gameTitle || 'Top Arena Match'}</div>
            <div className="text-xl font-black text-gray-300 font-mono mt-2">{top2.score.toLocaleString()} pts</div>
          </div>

          {/* Rank 1 (Champion) */}
          <div className="bg-gradient-to-b from-amber-500/20 to-slate-900 border-2 border-yellow-500/60 rounded-2xl p-6 text-center flex flex-col items-center order-1 sm:order-2 shadow-2xl shadow-yellow-500/10 scale-105">
            <span className="text-4xl mb-1 animate-bounce">👑</span>
            <div className="text-4xl my-1">{top1.avatar}</div>
            <div className="text-base font-black text-white">{top1.username}</div>
            <div className="text-xs text-yellow-400 font-mono font-bold">{top1.gameTitle || 'Top Arena Match'}</div>
            <div className="text-2xl font-black text-yellow-400 font-mono mt-2">{top1.score.toLocaleString()} pts</div>
            <span className="mt-2 text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">
              ARENA CHAMPION
            </span>
          </div>

          {/* Rank 3 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center order-3 shadow-xl">
            <span className="text-3xl mb-1">🥉</span>
            <div className="text-3xl my-1">{top3.avatar}</div>
            <div className="text-sm font-black text-white">{top3.username}</div>
            <div className="text-[10px] text-gray-400 font-mono">{top3.gameTitle || 'Top Arena Match'}</div>
            <div className="text-xl font-black text-amber-500 font-mono mt-2">{top3.score.toLocaleString()} pts</div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="max-w-4xl mx-auto rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-gray-400">
          <span>ARENA PLAYERS ({filteredData.length})</span>
          <span>SCORE & BADGE</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400 font-mono text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span>Fetching live verified rankings from Firestore...</span>
          </div>
        ) : filteredData.length === 0 ? (
          /* Honest Empty State */
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 text-3xl flex items-center justify-center mx-auto text-gray-400">
              🏆
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No scores recorded yet</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Be the first player to complete a match and claim the #1 Champion spot on the leaderboard!
              </p>
            </div>
            <Link
              href="/games"
              onClick={() => soundFx.playClick()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-current" />
              PLAY A GAME NOW
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredData.map((entry) => {
              const isCurrentUser =
                entry.username === user.username || entry.username === user.displayName;
              return (
                <div
                  key={entry.rank}
                  className={`px-6 py-3.5 flex items-center justify-between transition-colors ${
                    isCurrentUser ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-6 text-center font-mono font-bold text-sm ${
                        entry.rank === 1
                          ? 'text-yellow-400'
                          : entry.rank === 2
                          ? 'text-gray-300'
                          : entry.rank === 3
                          ? 'text-amber-500'
                          : 'text-gray-500'
                      }`}
                    >
                      #{entry.rank}
                    </span>
                    <div className="text-2xl">{entry.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{entry.username}</span>
                        {isCurrentUser && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {entry.gameTitle || 'Arena Game'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-sm text-[#00F0FF]">
                      {entry.score.toLocaleString()} PTS
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {entry.badge || '⚡ Arena Competitor'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
