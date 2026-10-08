'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { EscapeDoorGame } from '@/components/games/escape-door/EscapeDoorGame';
import { ArrowLeft, Sparkles, Loader2, Trophy } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export default function EscapeDoorDedicatedPage() {
  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          onClick={() => soundFx.playClick()}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-[#00F0FF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO GAMES CATALOG</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard"
            onClick={() => soundFx.playClick()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300 font-bold hover:bg-amber-500/20 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>LEADERBOARD</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[11px] font-mono text-[#00F0FF] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SINGLE PLAYER ARENA</span>
          </div>
        </div>
      </div>

      {/* Escape From The Door Interactive Game Component */}
      <Suspense
        fallback={
          <div className="w-full min-h-[500px] flex flex-col items-center justify-center gap-3 text-[#00F0FF] rounded-3xl bg-[#090d15] border border-cyan-500/20">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="font-mono text-xs tracking-widest uppercase">
              Preparing Mystery Chambers...
            </span>
          </div>
        }
      >
        <EscapeDoorGame />
      </Suspense>
    </div>
  );
}
