'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { User, Trophy, Award, Flame, Shield, Coins, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Header */}
      <div className="glass-panel p-8 rounded-3xl border-purple-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 p-1 shadow-xl shadow-purple-500/40 flex items-center justify-center text-5xl">
            {user.avatar}
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white">{user.username}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-[10px] font-black text-cyan-300 uppercase">
                {user.authType} account
              </span>
            </div>
            <p className="text-xs text-gray-400">Joined MemeVerse • 🔥 {user.streak} Day Login Streak</p>

            {/* Level XP Bar */}
            <div className="w-64 pt-2">
              <div className="flex justify-between text-[11px] font-bold text-gray-300 mb-1">
                <span>Level {user.level}</span>
                <span>{user.xp} / {user.level * 500} XP</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-purple-900/60">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                  style={{ width: `${Math.min(100, (user.xp / (user.level * 500)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Currency & Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border-purple-900/40 text-center">
          <span className="text-xs font-bold text-gray-400 block mb-1">Meme Coins</span>
          <span className="text-2xl font-black text-amber-400">🪙 {user.coins}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl border-purple-900/40 text-center">
          <span className="text-xs font-bold text-gray-400 block mb-1">Total Wins</span>
          <span className="text-2xl font-black text-emerald-400">{user.stats.totalWins}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl border-purple-900/40 text-center">
          <span className="text-xs font-bold text-gray-400 block mb-1">Chai Served</span>
          <span className="text-2xl font-black text-cyan-400">☕ {user.stats.chaiServed}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl border-purple-900/40 text-center">
          <span className="text-xs font-bold text-gray-400 block mb-1">Sixes Hit</span>
          <span className="text-2xl font-black text-pink-400">🏏 {user.stats.sixesHit}</span>
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="glass-panel p-6 rounded-2xl border-purple-900/40 space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-pink-500" /> Achievement Badges ({user.badges.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {user.badges.map((b) => (
            <div key={b.id} className="p-4 rounded-xl bg-slate-950/60 border border-purple-900/40 flex items-center gap-3">
              <span className="text-3xl">{b.icon}</span>
              <div>
                <h4 className="text-xs font-bold text-white">{b.name}</h4>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game High Scores History */}
      <div className="glass-panel p-6 rounded-2xl border-purple-900/40 space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" /> Personal High Scores
        </h3>

        <div className="divide-y divide-purple-900/30">
          {Object.entries(user.stats.highScores).map(([gameId, score]) => (
            <div key={gameId} className="py-3 flex justify-between items-center text-xs">
              <span className="font-bold text-cyan-300 capitalize">{gameId.replace('-', ' ')}</span>
              <span className="font-black text-pink-400">{score} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
