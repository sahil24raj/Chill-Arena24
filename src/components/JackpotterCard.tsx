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
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between bg-[#121522] border border-[#1e2235] hover:border-[#00F0FF] hover:shadow-xl hover:shadow-[#00F0FF]/15 hover:-translate-y-1.5 shrink-0"
    >
      {/* 3D Artwork Image Viewport */}
      <div className="relative aspect-[16/10] bg-[#090b10] overflow-hidden">
        <img
          src={game.bannerImage}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {game.isTrending && (
            <span className="px-2 py-0.5 rounded-full text-[8px] font-black font-display bg-[#FF0080] text-white backdrop-blur-md flex items-center gap-1 shadow-md">
              <Flame className="w-2.5 h-2.5" /> TRENDING
            </span>
          )}
          {game.isNew && (
            <span className="px-2 py-0.5 rounded-full text-[8px] font-black font-display bg-[#00F0FF] text-slate-950 backdrop-blur-md flex items-center gap-1 shadow-md">
              <Zap className="w-2.5 h-2.5 fill-slate-950" /> NEW
            </span>
          )}
          {game.isPopular && (
            <span className="px-2 py-0.5 rounded-full text-[8px] font-black font-display bg-amber-400 text-slate-950 backdrop-blur-md flex items-center gap-1 shadow-md">
              <Crown className="w-2.5 h-2.5 fill-slate-950" /> POPULAR
            </span>
          )}
        </div>

        {/* Rating Pill */}
        <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-mono text-[#ADFF2F] flex items-center gap-1 border border-[#ADFF2F]/30 shadow z-10">
          <Star className="w-2.5 h-2.5 fill-[#ADFF2F] text-[#ADFF2F]" />
          <span>{game.rating}</span>
        </div>

        {/* 1v1 Multiplayer Duel Pill (Jackpotter Style) */}
        {game.multiplayer && (
          <div className="absolute bottom-2.5 left-2.5 bg-[#090b14]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-mono text-[#00F0FF] flex items-center gap-1 border border-[#00F0FF]/30 z-10">
            <Users className="w-2.5 h-2.5" /> 1v1 DUEL
          </div>
        )}

        {/* Hover Glowing Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00F0FF] via-purple-500 to-[#ADFF2F] flex items-center justify-center text-slate-950 shadow-2xl shadow-[#00F0FF]/50 transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Bottom Card Title & Metadata Info */}
      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg shrink-0">{game.thumbnail}</span>
            <h4 className="text-xs font-bold text-white group-hover:text-[#00F0FF] transition-colors font-display line-clamp-1">
              {game.title}
            </h4>
          </div>
          <p className="text-[10px] text-gray-400 font-sans line-clamp-2 leading-relaxed">
            {game.tagline}
          </p>
        </div>

        {/* Bottom Bar: Duration & Plays */}
        <div className="pt-2 border-t border-[#1e2235] flex items-center justify-between text-[9px] font-mono text-gray-500">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-2.5 h-2.5" />
            <span>{game.duration}</span>
            <span>•</span>
            <span>{(game.playCount / 1000).toFixed(0)}k plays</span>
          </div>

          <span className="text-[#00F0FF] font-bold group-hover:translate-x-1 transition-transform font-display flex items-center">
            PLAY &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
};
