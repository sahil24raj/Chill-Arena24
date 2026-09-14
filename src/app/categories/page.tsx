'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { Flame, Star, Play, Search, Filter } from 'lucide-react';

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const categories = [
    'ALL',
    '🇮🇳 Indian Meme Games',
    '😂 Meme Games',
    '🏃 Endless Runner',
    '⚡ Reaction',
    '🧠 Puzzle',
    '🎯 Skill Games'
  ];

  const filtered = GAMES_CATALOG.filter((game) => {
    const matchesCat = selectedCategory === 'ALL' || game.category === selectedCategory;
    const matchesSearch = game.title.toLowerCase().includes(search.toLowerCase()) || game.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Flame className="w-8 h-8 text-pink-500" /> Meme Game Directory
          </h1>
          <p className="text-xs text-gray-400">Browse all 9+ game categories inspired by viral memes & trends</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-purple-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-purple-800/50 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              soundFx.playClick();
              setSelectedCategory(cat);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/30'
                : 'bg-slate-900/80 border border-purple-900/40 text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((game) => (
          <Link
            key={game.id}
            href={`/game/${game.id}`}
            onClick={() => soundFx.playClick()}
            className="glass-card rounded-2xl overflow-hidden group cursor-pointer border-purple-900/30"
          >
            <div className="relative aspect-video bg-slate-950 overflow-hidden">
              <img
                src={game.bannerImage}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-cyan-300 border border-cyan-500/30">
                {game.category}
              </div>
              <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-pink-500/50">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xl">{game.thumbnail}</span>
                <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                  {game.title}
                </h3>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                {game.tagline}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-3 border-t border-purple-900/30 text-gray-500 font-bold">
                <span>{(game.playCount / 1000).toFixed(1)}k Plays</span>
                <span className="text-purple-400">Play Instant →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
