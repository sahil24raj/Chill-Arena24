'use client';

import React from 'react';
import Link from 'next/link';
import { GameItem } from '@/types';
import { GameCard } from '@/components/GameCard';
import { soundFx } from '@/lib/audio';
import { Brain, Sparkles, Cpu, ArrowRight } from 'lucide-react';

interface MindGamesSectionProps {
  games: GameItem[];
  onOpenMultiplayer: (game: GameItem) => void;
}

export const MindGamesSection: React.FC<MindGamesSectionProps> = ({
  games,
  onOpenMultiplayer
}) => {
  return (
    <section className="space-y-6 relative">
      {/* Section Header with Futuristic Esports Brain Glow */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-6 rounded-3xl border border-purple-500/25 bg-gradient-to-r from-[#170e28] via-[#0f091b] to-[#08050e] relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-purple-600/15 to-transparent pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 via-pink-500 to-[#00F0FF]" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-mono text-purple-300">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold tracking-wider">COGNITIVE ESPORTS & RAPID REFLEXES</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center gap-2.5">
            <span>🧠 MIND GAMES ARENA</span>
            <span className="text-xs font-mono font-normal text-pink-400/80 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-900/50">
              30S WORD DUELS • RAPID IQ POT • MATRIX
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 font-sans max-w-2xl leading-relaxed">
            High-octane brain workouts built for speed and strategy. Race the clock to build dictionary words, out-smart rivals in neon Tic-Tac-Toe sets, and ace 7-second Brain Pot micro puzzles.
          </p>
        </div>

        <Link
          href="/games?cat=mind"
          onClick={() => soundFx.playClick()}
          className="relative z-10 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-bold text-purple-300 font-display transition-all hover:translate-x-1 shrink-0"
        >
          <span>ALL MIND GAMES ({games.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Mind Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            theme="mind"
            onQuickPlay={onOpenMultiplayer}
          />
        ))}
      </div>
    </section>
  );
};
