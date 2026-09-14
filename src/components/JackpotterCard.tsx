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
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between bg-[#0D1220] border border-[#1A243C] hover:border-[#00F0FF] hover:shadow-2xl hover:shadow-[#00F0FF]/20 hover:-translate-y-1.5 shrink-0 h-full w-full"
    >
      {/* 1. Unobstructed Full 3D Game Poster Viewport */}
      <div className="relative aspect-[4/3] bg-[#070914] overflow-hidden w-full">
        <img
          src={game.bannerImage}
          alt={game.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
        />

        {/* Hover Glowing Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00F0FF] via-purple-500 to-[#ADFF2F] flex items-center justify-center text-slate-950 shadow-2xl shadow-[#00F0FF]/50 transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* 2. Metadata Section (Below the image - clean and organized) */}
      <div className="p-3.5 sm:p-4 space-y-3 flex-1 flex flex-col justify-between bg-[#0D1220]">
        {/* Badges & Rating Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {game.isTrending && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#FF0055]/15 border border-[#FF0055]/40 text-[#FF0055] flex items-center gap-1 leading-none">
                <Flame className="w-2.5 h-2.5" /> TRENDING
              </span>
            )}
            {game.isNew && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center gap-1 leading-none">
                <Zap className="w-2.5 h-2.5 fill-[#00F0FF]" /> NEW
              </span>
            )}
            {game.isPopular && !game.isTrending && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-amber-400/15 border border-amber-400/40 text-amber-400 flex items-center gap-1 leading-none">
                <Crown className="w-2.5 h-2.5 fill-amber-400" /> POPULAR
              </span>
            )}
            {game.multiplayer && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#ADFF2F]/15 border border-[#ADFF2F]/40 text-[#ADFF2F] flex items-center gap-1 leading-none">
                <Users className="w-2.5 h-2.5 text-[#ADFF2F]" /> 1v1
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 shrink-0 font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{game.rating}</span>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base shrink-0">{game.thumbnail}</span>
            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00F0FF] transition-colors font-display truncate">
              {game.title}
            </h4>
          </div>
          <p className="text-[11px] text-gray-400 font-sans line-clamp-1 leading-relaxed">
            {game.tagline}
          </p>
        </div>

        {/* Bottom Bar: Duration, Plays & Play Button */}
        <div className="pt-2.5 border-t border-[#1A243C] flex items-center justify-between text-[10px] font-mono text-gray-400">
          <div className="flex items-center gap-1.5">
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
