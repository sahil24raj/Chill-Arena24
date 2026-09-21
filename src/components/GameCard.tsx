'use client';

import React from 'react';
import Link from 'next/link';
import { GameItem } from '@/types';
import { soundFx } from '@/lib/audio';
import { Play, Star, Users, Flame, Zap, Crown, Clock } from 'lucide-react';

interface GameCardProps {
  game: GameItem;
  theme?: 'default' | 'school' | 'mind' | 'meme';
  onQuickPlay?: (game: GameItem) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, theme = 'default', onQuickPlay }) => {
  return (
    <Link
      href={`/game/${game.id}`}
      onClick={() => soundFx.playClick()}
      className={`group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
        theme === 'school'
          ? 'bg-[#18130e]/95 border-amber-900/40 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10'
          : theme === 'mind'
          ? 'bg-[#0f0e1c]/95 border-purple-900/40 hover:border-[#00F0FF] hover:shadow-xl hover:shadow-[#00F0FF]/15'
          : theme === 'meme'
          ? 'bg-[#160e18]/95 border-pink-900/40 hover:border-pink-500 hover:shadow-xl hover:shadow-pink-500/15'
          : 'bg-[#11141c]/95 border-gray-800/80 hover:border-[#00F0FF] hover:shadow-xl hover:shadow-[#00F0FF]/15'
      } hover:-translate-y-1.5`}
    >
      {/* Thumbnail Banner Image */}
      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
        <img
          src={game.bannerImage}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75 group-hover:opacity-90"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {game.isTrending && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black font-display bg-pink-600/90 text-white backdrop-blur-md flex items-center gap-1 shadow">
              <Flame className="w-2.5 h-2.5" /> TRENDING
            </span>
          )}
          {game.isNew && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black font-display bg-[#00F0FF]/90 text-slate-950 backdrop-blur-md flex items-center gap-1 shadow">
              <Zap className="w-2.5 h-2.5 fill-slate-950" /> NEW
            </span>
          )}
          {game.isPopular && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black font-display bg-amber-500/90 text-slate-950 backdrop-blur-md flex items-center gap-1 shadow">
              <Crown className="w-2.5 h-2.5 fill-slate-950" /> POPULAR
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-mono text-[#ADFF2F] flex items-center gap-1 border border-[#ADFF2F]/30 shadow">
          <Star className="w-2.5 h-2.5 fill-[#ADFF2F] text-[#ADFF2F]" />
          <span>{game.rating}</span>
        </div>

        {/* Multiplayer Badge */}
        {game.multiplayer && (
          <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-mono text-cyan-300 flex items-center gap-1 border border-cyan-500/30">
            <Users className="w-2.5 h-2.5" /> 1v1 DUEL
          </div>
        )}

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] flex items-center justify-center text-slate-950 shadow-xl shadow-[#00F0FF]/40 transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl shrink-0">{game.thumbnail}</span>
            <h3 className="text-sm font-bold text-white group-hover:text-[#00F0FF] transition-colors font-display line-clamp-1">
              {game.title}
            </h3>
          </div>
          <p className="text-[11px] text-gray-400 font-sans line-clamp-2 leading-relaxed">
            {game.tagline}
          </p>
        </div>

        {/* Bottom Meta Stats */}
        <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between text-[10px] font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" /> {game.duration}
            </span>
            <span>•</span>
            <span className="text-[#00F0FF]">{game.difficulty}</span>
          </div>

          <span className="text-[#00F0FF] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
            PLAY &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
};
