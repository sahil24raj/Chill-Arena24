'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Globe,
  Users,
  Calendar,
  Crown,
  Medal,
  Flame,
  Star,
  Sparkles,
  Swords,
  RefreshCw,
  Send,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '@/lib/audio';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import {
  fetchCloudLeaderboard,
  subscribeToCloudLeaderboard,
  saveScoreToCloudLeaderboard
} from '@/lib/firebaseService';
import { isFirebaseConfigured } from '@/lib/firebase';
import { LeaderboardEntry } from '@/types';

const SEED_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'Gigachad_69', country: '🇮🇳 India', score: 18450, wins: 142, xp: 9800, badge: '👑 Meme Legend', avatar: '🗿' },
  { rank: 2, username: 'DayaDoorSmash', country: '🇮🇳 India', score: 15890, wins: 118, xp: 8200, badge: '🚪 CID Destroyer', avatar: '🚪' },
  { rank: 3, username: 'PenFlipper_Raju', country: '🇮🇳 India', score: 13840, wins: 98, xp: 7400, badge: '🖊️ Desk Master', avatar: '😎' },
  { rank: 4, username: 'ChaiBoss_Delhi', country: '🇮🇳 India', score: 11750, wins: 82, xp: 6500, badge: '☕ Tapri Owner', avatar: '☕' },
  { rank: 5, username: 'GullyKing_Virat', country: '🇮🇳 India', score: 10200, wins: 76, xp: 5900, badge: '🏏 Sixer Machine', avatar: '🏏' },
  { rank: 6, username: 'BrainPot_Newton', country: '🇺🇸 USA', score: 9540, wins: 68, xp: 5200, badge: '🧠 Big Brain', avatar: '🤖' },
  { rank: 7, username: 'WordMaster_Alex', country: '🇬🇧 UK', score: 8790, wins: 59, xp: 4800, badge: '🔤 Vocabulary Pro', avatar: '📚' }
];

export default function LeaderboardPage() {
  const { user } = useAppStore();
  const [tab, setTab] = useState<'GLOBAL' | 'WEEKLY' | 'MONTHLY' | 'FRIENDS'>('GLOBAL');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(SEED_LEADERBOARD);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Compute highest score of current user
  const highestUserScore = Math.max(0, ...Object.values(user.stats.highScores));

  useEffect(() => {
    // Load real-time cloud leaderboard from Firestore
    const unsubscribe = subscribeToCloudLeaderboard((cloudEntries) => {
      if (cloudEntries && cloudEntries.length > 0) {
        // Merge cloud entries with seed entries, unique by username
        const combined = [...cloudEntries];
        SEED_LEADERBOARD.forEach((seed) => {
          if (!combined.some((c) => c.username.toLowerCase() === seed.username.toLowerCase())) {
            combined.push(seed);
          }
        });
        combined.sort((a, b) => b.score - a.score);
        const ranked = combined.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
        setLeaderboardData(ranked);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handlePostMyScore = async () => {
    if (highestUserScore <= 0) return;
    soundFx.playClick();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await saveScoreToCloudLeaderboard(
        'overall',
        'Top Arena Score',
        highestUserScore,
        user
      );

      // Local optimistic update
      const updatedList = [
        ...leaderboardData.filter((i) => i.username !== user.username),
        {
          rank: 1,
          username: user.username,
          avatar: user.avatar,
          score: highestUserScore,
          country: '🇮🇳 India',
          badge: user.authType === 'google' ? '🌐 Google Verified' : '⚡ Challenger',
          wins: user.stats.totalWins,
          xp: user.xp
        }
      ].sort((a, b) => b.score - a.score);

      setLeaderboardData(updatedList.map((e, idx) => ({ ...e, rank: idx + 1 })));
      soundFx.playLevelUp();
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const top1 = leaderboardData[0] || SEED_LEADERBOARD[0];
  const top2 = leaderboardData[1] || SEED_LEADERBOARD[1];
  const top3 = leaderboardData[2] || SEED_LEADERBOARD[2];

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-mono text-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>FIRESTORE CLOUD ESPORTS ARENA STANDINGS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
          HALL OF FAME & RANKINGS
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-sans leading-relaxed">
          Compete across classroom duels, endless runners, and rapid mind games to climb the global Firestore leaderboard and earn verified crowns.
        </p>

        {/* Live Sync Status Pill */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Firestore Database Connected</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
        {[
          { id: 'GLOBAL', label: '🌐 Global All-Time', icon: Globe },
          { id: 'WEEKLY', label: '⚡ Weekly Cup', icon: Flame },
          { id: 'MONTHLY', label: '📅 Monthly League', icon: Calendar },
          { id: 'FRIENDS', label: '👥 Squad Standings', icon: Users }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              soundFx.playClick();
              setTab(t.id as any);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold font-display transition-all ${
              tab === t.id
                ? 'bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F] text-slate-950 shadow-lg shadow-[#00F0FF]/20'
                : 'bg-slate-900/80 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Submit Current User Score Banner */}
      <div className="max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl glass-panel border border-[#00F0FF]/30 bg-[#0d121c] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] text-slate-950 flex items-center justify-center text-2xl font-bold shadow shrink-0">
            {user.avatar}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-black text-white font-display">{user.username}</span>
              <span className="text-[10px] font-mono text-[#00F0FF] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                LVL {user.level}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Your Top High Score: <strong className="text-[#ADFF2F] font-mono">{highestUserScore.toLocaleString()} pts</strong>
            </p>
          </div>
        </div>

        <button
          disabled={isSubmitting || highestUserScore <= 0}
          onClick={handlePostMyScore}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F] hover:brightness-110 text-slate-950 font-display text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-[#00F0FF]/20 hover:scale-105 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>SAVING TO FIRESTORE...</span>
            </>
          ) : submitSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-950" />
              <span>POSTED TO LEADERBOARD!</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>POST HIGH SCORE TO CLOUD</span>
            </>
          )}
        </button>
      </div>

      {/* Top 3 Podium Visuals */}
      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto items-end pt-6">
        {/* Rank 2 (Silver) */}
        <div className="glass-panel p-5 rounded-3xl border-gray-400/30 bg-[#0f131a] text-center space-y-3 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-3xl border-2 border-gray-400 shadow-md">
            {top2.avatar}
          </div>
          <div>
            <span className="text-xs font-bold text-white block truncate font-display">{top2.username}</span>
            <span className="text-[10px] text-gray-400 font-mono">{top2.country}</span>
          </div>
          <span className="text-sm font-black text-[#00F0FF] font-mono block">
            {top2.score.toLocaleString()} pts
          </span>
          <div className="py-1 bg-gray-500/20 rounded-xl text-[10px] font-black text-gray-300 font-display">
            🥈 #2 SILVER
          </div>
        </div>

        {/* Rank 1 (Gold Champion) */}
        <div className="glass-panel p-6 rounded-3xl border-2 border-amber-500 bg-gradient-to-b from-[#1f160b] to-[#0d0a06] text-center space-y-3 transform -translate-y-4 shadow-2xl shadow-amber-500/20">
          <Crown className="w-7 h-7 text-amber-400 mx-auto animate-bounce" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center text-3xl border-2 border-amber-300 shadow-lg shadow-amber-500/30">
            {top1.avatar}
          </div>
          <div>
            <span className="text-sm font-black text-white block truncate font-display">{top1.username}</span>
            <span className="text-[10px] text-amber-300 font-mono">{top1.badge}</span>
          </div>
          <span className="text-base font-black text-amber-400 font-mono block">
            {top1.score.toLocaleString()} pts
          </span>
          <div className="py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-[11px] font-black text-slate-950 font-display">
            👑 #1 CHAMPION
          </div>
        </div>

        {/* Rank 3 (Bronze) */}
        <div className="glass-panel p-5 rounded-3xl border-amber-800/40 bg-[#0f131a] text-center space-y-3 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-3xl border-2 border-amber-700 shadow-md">
            {top3.avatar}
          </div>
          <div>
            <span className="text-xs font-bold text-white block truncate font-display">{top3.username}</span>
            <span className="text-[10px] text-gray-400 font-mono">{top3.country}</span>
          </div>
          <span className="text-sm font-black text-[#00F0FF] font-mono block">
            {top3.score.toLocaleString()} pts
          </span>
          <div className="py-1 bg-amber-800/30 rounded-xl text-[10px] font-black text-amber-500 font-display">
            🥉 #3 BRONZE
          </div>
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="glass-panel rounded-3xl border-gray-800 overflow-hidden max-w-4xl mx-auto bg-[#0c1017]/90 shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between text-[11px] font-mono text-gray-500 uppercase px-6">
          <span>RANK & GAMER</span>
          <div className="flex gap-8">
            <span className="hidden sm:inline">TOTAL WINS</span>
            <span className="hidden md:inline">ARENA XP</span>
            <span>TOTAL SCORE</span>
          </div>
        </div>

        <div className="divide-y divide-gray-850">
          {leaderboardData.map((row) => (
            <div
              key={`${row.rank}_${row.username}`}
              className={`p-4 px-6 flex items-center justify-between hover:bg-slate-900/60 transition-colors ${
                row.username === user.username ? 'bg-[#00F0FF]/10 border-l-4 border-[#00F0FF]' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-6 font-black text-center text-sm font-display ${
                    row.rank === 1
                      ? 'text-amber-400'
                      : row.rank === 2
                      ? 'text-gray-300'
                      : row.rank === 3
                      ? 'text-amber-600'
                      : 'text-gray-500'
                  }`}
                >
                  #{row.rank}
                </span>

                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-gray-800 flex items-center justify-center text-xl">
                  {row.avatar}
                </div>

                <div>
                  <span className="text-xs font-bold text-white block font-display flex items-center gap-1.5">
                    <span>{row.username}</span>
                    {row.username === user.username && (
                      <span className="text-[9px] font-mono bg-[#00F0FF] text-slate-950 px-1.5 py-0.2 rounded font-bold">
                        YOU
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {row.country} • {row.badge}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8 font-mono text-xs">
                <span className="hidden sm:inline text-gray-400">{row.wins || 0} wins</span>
                <span className="hidden md:inline text-purple-400">{row.xp || 0} XP</span>
                <span className="font-black text-[#00F0FF]">{row.score.toLocaleString()} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
