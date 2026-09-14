'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Game } from '@/store/useAppStore';
import { JackpotterCard } from '@/components/JackpotterCard';
import { soundFx } from '@/lib/audio';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface GameRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  games: Game[];
  viewAllLink?: string;
  viewAllHref?: string;
  badge?: string;
  badgeColor?: string;
  onQuickPlay?: (game: Game) => void;
}

export const JackpotterGameRow: React.FC<GameRowProps> & { Card: typeof JackpotterCard } = ({
  title,
  subtitle,
  icon,
  games,
  viewAllLink,
  viewAllHref,
  badge,
  badgeColor = 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40',
  onQuickPlay
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const finalHref = viewAllLink || viewAllHref || '/categories';

  const handleScroll = (direction: 'left' | 'right') => {
    soundFx.playClick();
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-4">
      {/* Section Header with View All & Arrow Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {icon && <div className="text-xl shrink-0">{icon}</div>}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white font-display uppercase tracking-wide truncate">
                {title}
              </h3>
              {badge && (
                <span
                  className={`text-[9px] font-mono font-bold border px-2.5 py-0.5 rounded-full leading-none shrink-0 ${badgeColor}`}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-gray-400 font-sans mt-0.5 hidden sm:block truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* View All & Navigation Arrows */}
        <div className="flex items-center gap-2.5 shrink-0">
          {finalHref && (
            <Link
              href={finalHref}
              onClick={() => soundFx.playClick()}
              className="text-xs font-mono font-bold text-gray-400 hover:text-[#00F0FF] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#121829] leading-none"
            >
              <span>View All ({games.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              className="p-2 rounded-xl bg-[#101524] border border-[#1E2844] hover:border-[#00F0FF]/50 text-gray-400 hover:text-white transition-colors"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-2 rounded-xl bg-[#101524] border border-[#1E2844] hover:border-[#00F0FF]/50 text-gray-400 hover:text-white transition-colors"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Row / Grid of Game Cards */}
      <div
        ref={rowRef}
        className="grid grid-flow-col auto-cols-[minmax(240px,280px)] sm:auto-cols-[minmax(260px,300px)] gap-4 overflow-x-auto scrollbar-none pb-2 pt-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {games.map((game) => (
          <div key={game.id} style={{ scrollSnapAlign: 'start' }} className="h-full">
            <JackpotterCard game={game} onQuickPlay={onQuickPlay} />
          </div>
        ))}
      </div>
    </section>
  );
};

JackpotterGameRow.Card = JackpotterCard;
