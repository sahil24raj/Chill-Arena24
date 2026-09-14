'use client';

import React, { useState } from 'react';
import { Shield, PlusCircle, Users, BarChart3, DollarSign, Upload, Check } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export default function AdminPage() {
  const [gameTitle, setGameTitle] = useState('');
  const [category, setCategory] = useState('🇮🇳 Indian Meme Games');
  const [controls, setControls] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameTitle.trim()) return;
    soundFx.playLevelUp();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setGameTitle('');
    setControls('');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white flex items-center justify-center gap-2">
          <Shield className="w-8 h-8 text-cyan-400" /> MemeVerse Creator & Admin Control Panel
        </h1>
        <p className="text-xs text-gray-400">Manage games, analytics, tournament hosts, and platform monetization</p>
      </div>

      {/* Overview Analytics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border-purple-900/40">
          <span className="text-xs font-bold text-gray-400 block mb-1">Total Platform Gamers</span>
          <span className="text-2xl font-black text-cyan-400">542,890</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-purple-900/40">
          <span className="text-xs font-bold text-gray-400 block mb-1">Active Game Plays</span>
          <span className="text-2xl font-black text-pink-400">1,428,900</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-purple-900/40">
          <span className="text-xs font-bold text-gray-400 block mb-1">Monthly Revenue (Est.)</span>
          <span className="text-2xl font-black text-emerald-400">₹4,28,500</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-purple-900/40">
          <span className="text-xs font-bold text-gray-400 block mb-1">Server Status</span>
          <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/40">
            ● 99.9% Uptime
          </span>
        </div>
      </div>

      {/* Upload New Game Form */}
      <div className="glass-panel p-6 rounded-2xl border-purple-900/40 max-w-2xl mx-auto space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-purple-400" /> Upload & Feature New Meme Game
        </h3>

        {submitted && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4" /> Game submitted successfully for publishing!
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">Game Title</label>
            <input
              type="text"
              placeholder="e.g. Elvish Roast Simulator"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              className="w-full bg-slate-950 border border-purple-800/50 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-purple-800/50 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="🇮🇳 Indian Meme Games">🇮🇳 Indian Meme Games</option>
              <option value="🏃 Endless Runner">🏃 Endless Runner</option>
              <option value="⚡ Reaction">⚡ Reaction</option>
              <option value="🧠 Puzzle">🧠 Puzzle</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">Control Instructions</label>
            <input
              type="text"
              placeholder="e.g. Press Space to jump, Arrow Keys to move"
              value={controls}
              onChange={(e) => setControls(e.target.value)}
              className="w-full bg-slate-950 border border-purple-800/50 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="cyber-button w-full py-3 rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 shadow-lg"
          >
            <Upload className="w-4 h-4" /> PUBLISH GAME TO MEMEVERSE
          </button>
        </form>
      </div>
    </div>
  );
}
