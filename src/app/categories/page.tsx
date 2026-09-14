'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { GameCard } from '@/components/GameCard';
import { MultiplayerLobbyModal } from '@/components/MultiplayerLobbyModal';
import { soundFx } from '@/lib/audio';
import { Flame, Star, Play, Search, Filter, Backpack, Brain, Swords } from 'lucide-react';

export default function CategoriesPage() {
  const { openMultiplayerModal } = useAppStore();
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const categoryPills = [
    { id: 'ALL', label: 'ALL COLLECTIONS' },
    { id: 'meme', label: '🔥 TRENDING MEME' },
    { id: 'school', label: '🏫 SCHOOL VIBES' },
    { id: 'mind', label: '🧠 MIND GAMES' }
  ];

  const filtered = GAMES_CATALOG.filter((game) => {
    const matchesCat = selectedCat === 'ALL' || game.categoryKey === selectedCat;
    const matchesSearch =
      game.title.toLowerCase().includes(search.toLowerCase()) ||
      game.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      <MultiplayerLobbyModal />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 lg:p-8 rounded-3xl glass-panel border border-[#00F0FF]/25 bg-gradient-to-r from-[#0d121c] to-[#070a0e] shadow-xl">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2 font-display">
            <Flame className="w-8 h-8 text-pink-500" /> GAME CATEGORIES & COLLECTIONS
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Browse our curated hubs: Trending Memes, Nostalgic School Vibes, and Cognitive Mind Games.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search collections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2.5">
        {categoryPills.map((pill) => (
          <button
            key={pill.id}
            onClick={() => {
              soundFx.playClick();
              setSelectedCat(pill.id);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-display transition-all ${
              selectedCat === pill.id
                ? 'bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F] text-slate-950 shadow-md shadow-[#00F0FF]/20'
                : 'bg-slate-900 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            theme={game.categoryKey}
            onQuickPlay={() => openMultiplayerModal(game)}
          />
        ))}
      </div>
    </div>
  );
}
