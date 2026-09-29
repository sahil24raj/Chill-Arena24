'use client';

import React, { useState, useEffect } from 'react';
import { Player, ROLE_DEFINITIONS, ChorSipahiRole } from './chorSipahiTypes';
import { Crown, Sparkles, Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { soundFx } from '@/lib/audio';
import { GameTimer } from './GameTimer';

interface RoleRevealProps {
  currentPlayer: Player;
  rajaPlayer?: Player;
  onContinue: () => void;
}

export const RoleReveal: React.FC<RoleRevealProps> = ({
  currentPlayer,
  rajaPlayer,
  onContinue
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const myRoleKey = currentPlayer.role || 'chor';
  const roleConfig = ROLE_DEFINITIONS[myRoleKey];

  useEffect(() => {
    soundFx.playFlip();
    const timer = setTimeout(() => {
      setIsFlipped(true);
      soundFx.playLevelUp();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Public Raja Coronation Announcement */}
      {rajaPlayer && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-900/30 border border-amber-500/40 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-md">
              👑
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                Royal Proclamation
              </span>
              <h3 className="font-display font-black text-sm sm:text-base text-white">
                {rajaPlayer.name} is the RAJA of this Court!
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
            1000 PTS
          </span>
        </div>
      )}

      {/* Main Secret Role Chit Card */}
      <div className="relative flex flex-col items-center">
        
        {/* Chit / Card Wrapper */}
        <div
          onClick={() => {
            setIsFlipped(!isFlipped);
            soundFx.playFlip();
          }}
          className={`w-full max-w-md cursor-pointer transition-all duration-700 transform ${
            isFlipped ? 'scale-100' : 'scale-95'
          }`}
        >
          <div
            className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl relative overflow-hidden bg-gradient-to-b ${roleConfig.bgGradient} backdrop-blur-2xl transition-all`}
            style={{ borderColor: roleConfig.color }}
          >
            {/* Background Icon Watermark */}
            <div className="absolute -right-6 -bottom-6 text-9xl opacity-10 pointer-events-none select-none">
              {roleConfig.icon}
            </div>

            {/* Top Secret Badge */}
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono text-slate-300 uppercase tracking-widest">
                <Shield className="w-3 h-3 text-[#00F0FF]" /> CONFIDENTIAL CHIT
              </span>
              <span className="text-xs font-mono font-black text-white bg-black/40 px-3 py-1 rounded-xl border border-white/10">
                {roleConfig.points} POINTS
              </span>
            </div>

            {/* Center Role Avatar & Title */}
            <div className="text-center space-y-3 my-4">
              <div className="inline-block p-4 rounded-3xl bg-black/40 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] text-6xl transform hover:scale-110 transition-transform">
                {roleConfig.icon}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-300 uppercase tracking-widest font-semibold">
                  You are assigned
                </span>
                <h2
                  className="text-3xl sm:text-4xl font-black font-display tracking-tight uppercase"
                  style={{ color: roleConfig.color }}
                >
                  {roleConfig.hindiName}
                </h2>
              </div>
            </div>

            {/* Objective & Mission */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 mt-6">
              <div className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-wider font-bold">
                🎯 Mission Directive:
              </div>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                {roleConfig.objective}
              </p>
            </div>

            {/* Tap to toggle hint */}
            <div className="mt-4 text-center">
              <span className="text-[10px] font-mono text-slate-400">
                Tap card anytime to peek / flip
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timer & Proceed Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d1222] border border-white/10">
        <GameTimer initialSeconds={10} onExpire={onContinue} label="Discussion starts in" />

        <button
          onClick={() => {
            soundFx.playClick();
            onContinue();
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#3B82F6] text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
        >
          <span>ENTER COURT DISCUSSION</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
