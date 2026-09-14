'use client';

import React from 'react';
import Link from 'next/link';
import { GameItem } from '@/types';
import { soundFx } from '@/lib/audio';
import { Play, Star, Users, Flame, Zap, Crown, Clock } from 'lucide-react';

interface JackpotterCardProps {
  game: GameItem;
  size?: 'normal' | 'compact' | 'featured';
  onQuickPlay?: (game: GameItem) => void;
}

export const JackpotterCard: React.FC<JackpotterCardProps> = ({
  game,
  size = 'normal',
  onQuickPlay
}) => {
  return (
    <Link
      href={`/game/${game.id}`}
      onClick={() => soundFx.playClick()}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between bg-[#0E1322] border border-[#1A233A] hover:border-[#00F0FF] hover:shadow-2xl hover:shadow-[#00F0FF]/20 hover:-translate-y-1.5 shrink-0 h-full w-full"
    >
      {/* 3D Game Poster Container - Full Definition without awkward cropping */}
      <div className="relative aspect-[4/3] bg-[#070914] overflow-hidden w-full">
        <img
          src={game.bannerImage}
          alt={game.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
        />

        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1322] via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
          {game.isTrending && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black font-display bg-[#FF0055] text-white shadow-md flex items-center gap-1 leading-none tracking-wide">
              <Flame className="w-2.5 h-2.5" /> TRENDING
            </span>
          )}
          {game.isNew && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black font-display bg-[#00F0FF] text-slate-950 shadow-md flex items-center gap-1 leading-none tracking-wide">
              <Zap className="w-2.5 h-2.5 fill-slate-950" /> NEW
            </span>
          )}
          {game.isPopular && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black font-display bg-amber-400 text-slate-950 shadow-md flex items-center gap-1 leading-none tracking-wide">
              <Crown className="w-2.5 h-2.5 fill-slate-950" /> POPULAR
            </span>
          )}
        </div>

        {/* Rating Pill */}
        <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-mono text-amber-400 flex items-center gap-1 border border-amber-400/30 shadow z-10 leading-none">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span className="font-bold">{game.rating}</span>
        </div>

        {/* 1v1 Multiplayer Duel Pill */}
        {game.multiplayer && (
          <div className="absolute bottom-2.5 left-2.5 bg-[#080B14]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-mono font-bold text-[#00F0FF] flex items-center gap-1 border border-[#00F0FF]/40 z-10 shadow-sm leading-none">
            <Users className="w-2.5 h-2.5 text-[#00F0FF]" /> 1v1 DUEL
          </div>
        )}

        {/* Hover Glowing Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00F0FF] via-purple-500 to-[#ADFF2F] flex items-center justify-center text-slate-950 shadow-2xl shadow-[#00F0FF]/50 transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between bg-[#0E1322]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg shrink-0">{game.thumbnail}</span>
            <h4 className="text-sm font-bold text-white group-hover:text-[#00F0FF] transition-colors font-display truncate">
              {game.title}
            </h4>
          </div>
          <p className="text-[11px] text-gray-400 font-sans line-clamp-2 leading-relaxed">
            {game.tagline}
          </p>
        </div>

        {/* Bottom Bar: Duration, Plays & Play Button */}
        <div className="pt-2.5 border-t border-[#1A233A] flex items-center justify-between text-[10px] font-mono text-gray-500">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>{game.duration}</span>
            <span>•</span>
            <span>{(game.playCount / 1000).toFixed(0)}k plays</span>
          </div>

          <span className="text-[#00F0FF] font-bold group-hover:translate-x-1 transition-transform font-display flex items-center gap-1 text-xs">
            <span>PLAY</span>
            <span>&rarr;</span>
          </span>
        </div>
      </div>
    </Link>
  );
};
