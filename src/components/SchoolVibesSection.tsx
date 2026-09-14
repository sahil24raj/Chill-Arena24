'use client';

import React from 'react';
import Link from 'next/link';
import { GameItem } from '@/types';
import { GameCard } from '@/components/GameCard';
import { soundFx } from '@/lib/audio';
import { Backpack, Sparkles, BookOpen, PenTool, ArrowRight } from 'lucide-react';

interface SchoolVibesSectionProps {
  games: GameItem[];
  onOpenMultiplayer: (game: GameItem) => void;
}

export const SchoolVibesSection: React.FC<SchoolVibesSectionProps> = ({
  games,
  onOpenMultiplayer
}) => {
  return (
    <section className="space-y-6 relative">
      {/* Section Header with Nostalgic Classroom Flair */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-6 rounded-3xl border border-amber-500/25 bg-gradient-to-r from-[#21150c] via-[#170e08] to-[#0d0905] relative overflow-hidden shadow-xl">
        {/* Notebook Doodles & Marginal Accent */}
        <div className="absolute top-0 right-0 w-80 h-full bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500 via-orange-500 to-red-600" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-mono text-amber-300">
            <Backpack className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold tracking-wider">CANTEEN & LAST BENCH NOSTALGIA</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center gap-2.5">
            <span>🏫 SCHOOL VIBES</span>
            <span className="text-xs font-mono font-normal text-amber-400/80 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-900/50">
              REYNOLDS • BOOK CRICKET • ERASERS
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 font-sans max-w-2xl leading-relaxed">
            Relive the high-stakes classroom duels from school & college benches. Flip Reynolds pens, fling non-dust erasers at moving blackboard targets, and spin notebook book-cricket for sixers!
          </p>
        </div>

        <Link
          href="/games?cat=school"
          onClick={() => soundFx.playClick()}
          className="relative z-10 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 font-display transition-all hover:translate-x-1 shrink-0"
        >
          <span>ALL SCHOOL GAMES ({games.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of School Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            theme="school"
            onQuickPlay={onOpenMultiplayer}
          />
        ))}
      </div>
    </section>
  );
};
