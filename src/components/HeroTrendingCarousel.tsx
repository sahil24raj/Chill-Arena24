'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore, Game } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Play,
  Swords,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Users,
  Sparkles,
  Zap,
  Volume2
} from 'lucide-react';

const FEATURED_GAMES_IDS = ['pen-flip', 'modi-run', 'spin-cricket', 'cid-escape', 'chai-tapri'];

export const HeroTrendingCarousel: React.FC = () => {
  const { openMultiplayerModal } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const featuredGames: Game[] = FEATURED_GAMES_IDS
    .map((id) => GAMES_CATALOG.find((g) => g.id === id))
    .filter(Boolean) as Game[];

  const currentGame = featuredGames[currentIndex] || featuredGames[0];

  // Auto-advance every 5.5 seconds unless hovered
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHovered, featuredGames.length]);

  const handleSelectGame = (index: number) => {
    soundFx.playClick();
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    soundFx.playClick();
    setCurrentIndex((prev) => (prev === 0 ? featuredGames.length - 1 : prev - 1));
  };

  const handleNext = () => {
    soundFx.playClick();
    setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
  };

  if (!currentGame) return null;

  return (
    <section
      className="relative rounded-3xl overflow-hidden border border-[#1E2945] bg-[#0A0E1A] shadow-2xl group transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Cinematic Art with Blur & Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentGame.bannerImage}
          alt={currentGame.title}
          className="w-full h-full object-cover object-center scale-105 filter blur-[2px] opacity-35 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-45"
        />
        {/* Gradient Overlays for Ultra-Clear Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-[#0A0E1A]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E1A] via-[#0A0E1A]/90 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#00F0FF]/10 to-transparent pointer-events-none" />
      </div>

      {/* Main Content Showcase */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-12 min-h-[380px] sm:min-h-[440px] flex flex-col justify-between">
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF0055]/20 border border-[#FF0055]/40 text-[#FF0055] shadow-lg shadow-[#FF0055]/10 animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>🔥 #1 TRENDING NOW</span>
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#00F0FF]">
              <Zap className="w-3.5 h-3.5" />
              <span>60 FPS ARCADE</span>
            </span>

            {currentGame.multiplayer && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#ADFF2F]/15 border border-[#ADFF2F]/30 text-[#ADFF2F]">
                <Users className="w-3.5 h-3.5" />
                <span>1v1 MULTIPLAYER DUEL</span>
              </span>
            )}
          </div>

          {/* Rating Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/30 text-xs font-mono text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-bold">{currentGame.rating} / 5.0</span>
            <span className="text-gray-400 text-[10px]">({(currentGame.playCount / 1000).toFixed(0)}k plays)</span>
          </div>
        </div>

        {/* Center Headline & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-6">
          {/* Left Description */}
          <div className="lg:col-span-8 space-y-4">
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display uppercase tracking-tight flex items-center gap-3">
                <span>{currentGame.thumbnail}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">
                  {currentGame.title}
                </span>
              </div>
              <p className="text-base sm:text-lg text-[#00F0FF] font-display font-bold">
                {currentGame.tagline}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 font-sans max-w-2xl leading-relaxed">
              {currentGame.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href={`/game/${currentGame.id}`}
                onClick={() => soundFx.playClick()}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00F0FF] via-[#00C2FF] to-[#0077FF] hover:brightness-110 text-slate-950 font-display text-sm font-black flex items-center gap-2.5 shadow-xl shadow-[#00F0FF]/25 hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>PLAY INSTANTLY</span>
              </Link>

              {currentGame.multiplayer && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    openMultiplayerModal(currentGame);
                  }}
                  className="px-6 py-3.5 rounded-xl bg-[#131A2E] hover:bg-[#1C2642] border border-[#00F0FF]/40 hover:border-[#00F0FF] text-white font-display text-sm font-bold flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Swords className="w-4 h-4 text-[#00F0FF]" />
                  <span>CHALLENGE SQUAD (1v1)</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Featured 3D Game Poster Artwork */}
          <div className="lg:col-span-4 hidden lg:flex justify-end">
            <Link
              href={`/game/${currentGame.id}`}
              onClick={() => soundFx.playClick()}
              className="relative rounded-2xl overflow-hidden border-2 border-[#00F0FF]/50 shadow-2xl shadow-[#00F0FF]/25 group/poster hover:scale-105 transition-all duration-300 w-80 aspect-[4/3] bg-[#070A12]"
            >
              <img
                src={currentGame.bannerImage}
                alt={currentGame.title}
                className="w-full h-full object-cover object-center group-hover/poster:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#00F0FF] uppercase tracking-wider block">
                    {currentGame.category}
                  </span>
                  <span className="text-sm font-bold text-white font-display">
                    {currentGame.title}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Carousel Controls & Game Selector Thumbnails */}
        <div className="pt-4 border-t border-[#1E2945]/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* 5-Game Thumbnail Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
            {featuredGames.map((game, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={game.id}
                  onClick={() => handleSelectGame(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#00F0FF]/20 to-[#7928CA]/20 border-[#00F0FF] text-white shadow-lg shadow-[#00F0FF]/15 scale-105'
                      : 'bg-[#101524]/80 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  <span className="text-sm">{game.thumbnail}</span>
                  <span className="truncate max-w-[90px]">{game.title.split(':')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Arrow Buttons & Slide Number */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-gray-400 font-bold mr-2">
              0{currentIndex + 1} / 0{featuredGames.length}
            </span>
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-[#121829] border border-gray-800 hover:border-[#00F0FF] text-gray-400 hover:text-white transition-colors"
              title="Previous Game"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-[#121829] border border-gray-800 hover:border-[#00F0FF] text-gray-400 hover:text-white transition-colors"
              title="Next Game"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
