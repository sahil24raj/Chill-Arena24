'use client';

import React from 'react';
import Link from 'next/link';
import { ChorSipahiGame } from '@/components/games/chor-sipahi/ChorSipahiGame';
import { ArrowLeft, Swords, Sparkles, Scroll } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export default function ChorSipahiDedicatedPage() {
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

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/40 text-[11px] font-mono text-purple-300 font-bold">
          <Swords className="w-3.5 h-3.5 text-pink-400" />
          <span>4-PLAYER SOCIAL DEDUCTION</span>
        </div>
      </div>

      {/* Chor Sipahi Interactive Experience */}
      <ChorSipahiGame />
    </div>
  );
}
