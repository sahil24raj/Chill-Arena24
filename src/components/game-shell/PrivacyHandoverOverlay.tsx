'use client';

import React from 'react';
import { Shield, Eye, ArrowRight } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export interface PrivacyHandoverOverlayProps {
  isOpen: boolean;
  nextPlayerName: string;
  nextPlayerAvatar: string;
  roundTitle?: string;
  onReveal: () => void;
}

export const PrivacyHandoverOverlay: React.FC<PrivacyHandoverOverlayProps> = ({
  isOpen,
  nextPlayerName,
  nextPlayerAvatar,
  roundTitle = 'Private Turn',
  onReveal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#121927] to-[#090d16] border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(168,85,247,0.25)] space-y-6">
        
        {/* Top Privacy Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold tracking-widest uppercase">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>{roundTitle}</span>
        </div>

        {/* Player Avatar & Notice */}
        <div className="space-y-3">
          <div className="relative w-24 h-24 mx-auto rounded-3xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(168,85,247,0.35)] animate-bounce">
            <span>{nextPlayerAvatar}</span>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-xs">
              ✓
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-white font-display">
              Pass Device to {nextPlayerName}
            </h3>
            <p className="text-xs font-sans text-gray-400 max-w-xs mx-auto leading-relaxed">
              Keep your screen hidden from opponents. Tap the button below once you are holding the device!
            </p>
          </div>
        </div>

        {/* Reveal Button */}
        <button
          onClick={() => {
            soundFx.playCoin();
            onReveal();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all active:scale-95 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>I AM READY — REVEAL MY TURN</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
