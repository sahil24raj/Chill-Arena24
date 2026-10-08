'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GAMES_CATALOG, useAppStore, Game } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Play,
  Users,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Zap,
  Crown,
  Trophy,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const FEATURED_GAMES_IDS = [
  'escape-door',
  'chor-sipahi',
  'word-builder',
  'spin-cricket',
  'pen-flip',
  'brain-pot',
  'tic-tac-toe'
];

const RANK_BADGES = [
  {
    rankText: '🚪 MYSTERY ESCAPE ARENA',
    icon: Sparkles,
    colorClass: 'bg-[#00F0FF]/20 border-[#00F0FF]/50 text-[#00F0FF]'
  },
  {
    rankText: '#1 SQUAD FAVORITE',
    icon: Flame,
    colorClass: 'bg-[#D946EF]/20 border-[#D946EF]/50 text-[#F472B6]'
  },
  {
    rankText: '#2 RAPID BRAIN DUEL',
    icon: Trophy,
    colorClass: 'bg-[#06B6D4]/20 border-[#06B6D4]/50 text-[#38BDF8]'
  },
  {
    rankText: '#3 NOSTALGIA HIT',
    icon: Crown,
    colorClass: 'bg-amber-500/20 border-amber-500/50 text-amber-300'
  },
  {
    rankText: '#4 LAST BENCH CLASSIC',
    icon: Zap,
    colorClass: 'bg-purple-500/20 border-purple-500/50 text-purple-300'
  },
  {
    rankText: '#5 SPEED IQ ARENA',
    icon: Sparkles,
    colorClass: 'bg-pink-500/20 border-pink-500/50 text-pink-300'
  },
  {
    rankText: '#6 1v1 DUEL',
    icon: Users,
    colorClass: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
  }
];

export const HeroTrendingCarousel: React.FC = () => {
  const { openMultiplayerModal } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const featuredGames: Game[] = FEATURED_GAMES_IDS
    .map((id) => GAMES_CATALOG.find((g) => g.id === id))
    .filter(Boolean) as Game[];

  const currentGame = featuredGames[currentIndex] || featuredGames[0];
  const rankInfo = RANK_BADGES[currentIndex] || RANK_BADGES[0];
  const RankIcon = rankInfo.icon;

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
    }, 6000);
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
      className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#10131D] shadow-2xl group transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Cinematic Art with Smooth Vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src={currentGame.bannerImage}
          alt={currentGame.title}
          fill
          priority
          className="object-cover object-center filter blur-[1px] opacity-35 transition-all duration-700 ease-out group-hover:opacity-45"
        />
        {/* Editorial Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10131D] via-[#10131D]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#10131D] via-[#10131D]/90 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#D946EF]/10 to-transparent pointer-events-none" />
      </div>

      {/* Main Content Showcase */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 min-h-[380px] flex flex-col justify-between space-y-6">
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border leading-none transition-all ${rankInfo.colorClass}`}
            >
              <RankIcon className="w-3.5 h-3.5" />
              <span>{rankInfo.rankText}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#38BDF8] leading-none">
              <Zap className="w-3.5 h-3.5" />
              <span>ZERO DOWNLOADS</span>
            </span>

            {currentGame.multiplayer && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#D946EF]/15 border border-[#D946EF]/30 text-[#F472B6] leading-none">
                <Users className="w-3.5 h-3.5" />
                <span>ONLINE SQUAD ROOMS</span>
              </span>
            )}
          </div>

          {/* Rating Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="font-bold">{currentGame.rating}</span>
            <span className="text-slate-400 text-[10px]">
              ({(currentGame.playCount / 1000).toFixed(0)}k plays)
            </span>
          </div>
        </div>

        {/* Center Headline & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight flex items-center gap-3">
                <span>{currentGame.title}</span>
              </h2>
              <p className="text-sm sm:text-base text-[#38BDF8] font-display font-medium">
                {currentGame.tagline}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-sans line-clamp-2 max-w-2xl leading-relaxed">
              {currentGame.description}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/game/${currentGame.id}`}
                onClick={() => soundFx.playClick()}
                className="px-6 py-3 rounded-full va-btn-primary text-xs font-bold flex items-center gap-2 shadow-lg group/btn cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white transition-transform group-hover/btn:scale-110" />
                <span>PLAY NOW</span>
              </Link>

              {currentGame.multiplayer && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    openMultiplayerModal(currentGame);
                  }}
                  className="px-6 py-3 rounded-full va-btn-secondary text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#06B6D4]" />
                  <span>CHALLENGE SQUAD</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Thumbnails / Navigation Dots */}
          <div className="lg:col-span-4 flex flex-col justify-end items-end space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-full bg-[#181C2A] border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                aria-label="Previous Featured Game"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2.5 rounded-full bg-[#181C2A] border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                aria-label="Next Featured Game"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pill Selectors */}
            <div className="flex items-center gap-1.5">
              {featuredGames.map((g, idx) => (
                <button
                  key={g.id}
                  onClick={() => handleSelectGame(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx ? 'w-8 bg-[#D946EF]' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Jump to ${g.title}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroTrendingCarousel;
