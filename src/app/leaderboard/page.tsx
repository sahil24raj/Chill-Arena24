'use client';

import React, { useState } from 'react';
import { Trophy, Globe, Users, Calendar, Crown, Medal, Flame, Star, Sparkles, Swords } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'GLOBAL' | 'FRIENDS' | 'WEEKLY' | 'MONTHLY' | 'GAME_SPECIFIC'>('GLOBAL');
  const [selectedGame, setSelectedGame] = useState<string>('all');

  const leaderboardData = [
    { rank: 1, name: 'Gigachad_69', country: '🇮🇳 India', score: 18450, wins: 142, xp: 9800, badge: '👑 Meme Legend', avatar: '🗿' },
    { rank: 2, name: 'DayaDoorSmash', country: '🇮🇳 India', score: 15890, wins: 118, xp: 8200, badge: '🚪 CID Destroyer', avatar: '🚪' },
    { rank: 3, name: 'PenFlipper_Raju', country: '🇮🇳 India', score: 13840, wins: 98, xp: 7400, badge: '🖊️ Desk Master', avatar: '😎' },
    { rank: 4, name: 'ChaiBoss_Delhi', country: '🇮🇳 India', score: 11750, wins: 82, xp: 6500, badge: '☕ Tapri Owner', avatar: '☕' },
    { rank: 5, name: 'GullyKing_Virat', country: '🇮🇳 India', score: 10200, wins: 76, xp: 5900, badge: '🏏 Sixer Machine', avatar: '🏏' },
    { rank: 6, name: 'BrainPot_Newton', country: '🇺🇸 USA', score: 9540, wins: 68, xp: 5200, badge: '🧠 Big Brain', avatar: '🤖' },
    { rank: 7, name: 'WordMaster_Alex', country: '🇬🇧 UK', score: 8790, wins: 59, xp: 4800, badge: '🔤 Vocabulary Pro', avatar: '📚' }
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-mono text-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>WEEKLY ESPORTS ARENA STANDINGS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
          HALL OF FAME & RANKINGS
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-sans leading-relaxed">
          Compete across classroom duels, endless runners, and rapid mind games to climb the global leaderboard and win custom profile crowns.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
        {[
          { id: 'GLOBAL', label: '🌐 Global All-Time', icon: Globe },
          { id: 'FRIENDS', label: '👥 Squad & Friends', icon: Users },
          { id: 'WEEKLY', label: '⚡ Weekly Cup', icon: Flame },
          { id: 'MONTHLY', label: '📅 Monthly League', icon: Calendar }
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

      {/* Top 3 Podium Visuals */}
      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto items-end pt-6">
        
        {/* Rank 2 (Silver) */}
        <div className="glass-panel p-5 rounded-3xl border-gray-400/30 bg-[#0f131a] text-center space-y-3 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-3xl border-2 border-gray-400 shadow-md">
            {leaderboardData[1].avatar}
          </div>
          <div>
            <span className="text-xs font-bold text-white block truncate">{leaderboardData[1].name}</span>
            <span className="text-[10px] text-gray-400 font-mono">{leaderboardData[1].country}</span>
          </div>
          <span className="text-sm font-black text-[#00F0FF] font-mono block">
            {leaderboardData[1].score.toLocaleString()} pts
          </span>
          <div className="py-1 bg-gray-500/20 rounded-xl text-[10px] font-black text-gray-300 font-display">
            🥈 #2 SILVER
          </div>
        </div>

        {/* Rank 1 (Gold Champion) */}
        <div className="glass-panel p-6 rounded-3xl border-2 border-amber-500 bg-gradient-to-b from-[#1f160b] to-[#0d0a06] text-center space-y-3 transform -translate-y-4 shadow-2xl shadow-amber-500/20">
          <Crown className="w-7 h-7 text-amber-400 mx-auto animate-bounce" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center text-3xl border-2 border-amber-300 shadow-lg shadow-amber-500/30">
            {leaderboardData[0].avatar}
          </div>
          <div>
            <span className="text-sm font-black text-white block truncate">{leaderboardData[0].name}</span>
            <span className="text-[10px] text-amber-300 font-mono">{leaderboardData[0].badge}</span>
          </div>
          <span className="text-base font-black text-amber-400 font-mono block">
            {leaderboardData[0].score.toLocaleString()} pts
          </span>
          <div className="py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-[11px] font-black text-slate-950 font-display">
            👑 #1 CHAMPION
          </div>
        </div>

        {/* Rank 3 (Bronze) */}
        <div className="glass-panel p-5 rounded-3xl border-amber-800/40 bg-[#0f131a] text-center space-y-3 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-3xl border-2 border-amber-700 shadow-md">
            {leaderboardData[2].avatar}
          </div>
          <div>
            <span className="text-xs font-bold text-white block truncate">{leaderboardData[2].name}</span>
            <span className="text-[10px] text-gray-400 font-mono">{leaderboardData[2].country}</span>
          </div>
          <span className="text-sm font-black text-[#00F0FF] font-mono block">
            {leaderboardData[2].score.toLocaleString()} pts
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
              key={row.rank}
              className="p-4 px-6 flex items-center justify-between hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`w-6 font-black text-center text-sm font-display ${
                  row.rank === 1 ? 'text-amber-400' : row.rank === 2 ? 'text-gray-300' : row.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                }`}>
                  #{row.rank}
                </span>

                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-gray-800 flex items-center justify-center text-xl">
                  {row.avatar}
                </div>

                <div>
                  <span className="text-xs font-bold text-white block font-display">{row.name}</span>
                  <span className="text-[10px] text-gray-500 font-mono">{row.country} • {row.badge}</span>
                </div>
              </div>

              <div className="flex items-center gap-8 font-mono text-xs">
                <span className="hidden sm:inline text-gray-400">{row.wins} wins</span>
                <span className="hidden md:inline text-purple-400">{row.xp} XP</span>
                <span className="font-black text-[#00F0FF]">{row.score.toLocaleString()} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
