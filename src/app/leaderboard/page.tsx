'use client';

import React, { useState } from 'react';
import { Trophy, Globe, Flag, Sparkles, Crown, Medal } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'GLOBAL' | 'INDIA' | 'TOURNAMENT'>('GLOBAL');

  const leaderboardData = [
    { rank: 1, name: 'Gigachad_69', country: '🇮🇳 India', score: 14250, badge: '👑 Legend', avatar: '🗿' },
    { rank: 2, name: 'DayaDoorSmash', country: '🇮🇳 India', score: 11890, badge: '🚪 CID Specialist', avatar: '🚪' },
    { rank: 3, name: 'ModiMitronRun', country: '🇮🇳 India', score: 9840, badge: '🏃 Sprint Master', avatar: '🏃‍♂️' },
    { rank: 4, name: 'ChaiBoss_Delhi', country: '🇮🇳 India', score: 8750, badge: '☕ Tapri Owner', avatar: '☕' },
    { rank: 5, name: 'PepeViral_USA', country: '🇺🇸 USA', score: 8200, badge: '⚡ Reaction Pro', avatar: '😎' },
    { rank: 6, name: 'GullyCricketKing', country: '🇮🇳 India', score: 7900, badge: '🏏 Sixer Machine', avatar: '🏏' },
    { rank: 7, name: 'CringeDodger_UK', country: '🇬🇧 UK', score: 6540, badge: '🛡️ Gen-Z Survivor', avatar: '🤖' }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-amber-400" /> MemeVerse Leaderboard
        </h1>
        <p className="text-xs text-gray-400">Compete globally for Meme Coins, Weekly Cash Tournaments & Custom Badges</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-3">
        {[
          { id: 'GLOBAL', label: '🌐 Global Standings', icon: Globe },
          { id: 'INDIA', label: '🇮🇳 India National', icon: Flag },
          { id: 'TOURNAMENT', label: '🏆 Weekly Tournament', icon: Sparkles }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              soundFx.playClick();
              setTab(t.id as 'GLOBAL' | 'INDIA' | 'TOURNAMENT');
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-black transition-all ${
              tab === t.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/30'
                : 'bg-slate-900/80 border border-purple-900/40 text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto items-end pt-6">
        {/* Rank 2 */}
        <div className="glass-panel p-4 rounded-2xl border-purple-800/40 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-2xl border-2 border-gray-400">
            {leaderboardData[1].avatar}
          </div>
          <span className="text-xs font-black text-gray-300 block">{leaderboardData[1].name}</span>
          <span className="text-xs font-bold text-cyan-400 block">{leaderboardData[1].score} pts</span>
          <div className="py-1 bg-gray-500/20 rounded-lg text-[10px] font-black text-gray-300">#2 Silver</div>
        </div>

        {/* Rank 1 */}
        <div className="glass-panel p-5 rounded-2xl border-amber-500/50 text-center space-y-2 transform -translate-y-4 shadow-xl shadow-amber-500/20">
          <Crown className="w-6 h-6 text-amber-400 mx-auto" />
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center text-3xl border-2 border-amber-400">
            {leaderboardData[0].avatar}
          </div>
          <span className="text-sm font-black text-white block">{leaderboardData[0].name}</span>
          <span className="text-xs font-black text-amber-400 block">{leaderboardData[0].score} pts</span>
          <div className="py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-[10px] font-black text-slate-950">#1 Champion</div>
        </div>

        {/* Rank 3 */}
        <div className="glass-panel p-4 rounded-2xl border-purple-800/40 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-2xl border-2 border-amber-700">
            {leaderboardData[2].avatar}
          </div>
          <span className="text-xs font-black text-gray-300 block">{leaderboardData[2].name}</span>
          <span className="text-xs font-bold text-cyan-400 block">{leaderboardData[2].score} pts</span>
          <div className="py-1 bg-amber-800/30 rounded-lg text-[10px] font-black text-amber-500">#3 Bronze</div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel rounded-2xl border-purple-900/40 overflow-hidden max-w-3xl mx-auto">
        <div className="divide-y divide-purple-900/30">
          {leaderboardData.map((row) => (
            <div key={row.rank} className="p-4 flex items-center justify-between hover:bg-purple-950/40 transition-colors">
              <div className="flex items-center gap-4">
                <span className={`w-6 font-black text-center text-sm ${row.rank === 1 ? 'text-amber-400' : 'text-gray-400'}`}>
                  #{row.rank}
                </span>
                <span className="text-xl">{row.avatar}</span>
                <div>
                  <span className="text-xs font-bold text-white block">{row.name}</span>
                  <span className="text-[10px] text-gray-400">{row.country} • {row.badge}</span>
                </div>
              </div>
              <span className="text-sm font-black text-cyan-400">{row.score} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
