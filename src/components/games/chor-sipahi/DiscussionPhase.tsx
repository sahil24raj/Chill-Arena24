'use client';

import React, { useEffect } from 'react';
import { Player, ChatMessage, ROLE_DEFINITIONS } from './chorSipahiTypes';
import { GameChat } from './GameChat';
import { GameTimer } from './GameTimer';
import { Crown, Shield, Swords, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface DiscussionPhaseProps {
  players: Player[];
  currentPlayer: Player;
  rajaPlayer?: Player;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onProceedToGuess: () => void;
}

export const DiscussionPhase: React.FC<DiscussionPhaseProps> = ({
  players,
  currentPlayer,
  rajaPlayer,
  chatMessages,
  onSendMessage,
  onProceedToGuess
}) => {
  const isSipahi = currentPlayer.role === 'sipahi';
  const isRaja = currentPlayer.role === 'raja';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Status & Timer Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b101e] border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center text-xl shadow-md">
            ⚖️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#00F0FF] font-bold">
                Phase 2: Courtroom Discussion
              </span>
              <span className="w-2 h-2 rounded-full bg-[#ADFF2F] animate-ping" />
            </div>
            <p className="text-xs text-slate-300 font-sans">
              Interrogate, defend, and bluff before the Sipahi makes the final arrest!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <GameTimer initialSeconds={45} onExpire={onProceedToGuess} label="Interrogation in" />
          
          <button
            onClick={() => {
              soundFx.playClick();
              onProceedToGuess();
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-[#00F0FF]/20 border border-white/10 hover:border-[#00F0FF]/40 text-white text-xs font-display font-black tracking-wider transition-all cursor-pointer shadow-md"
          >
            <span>Proceed to Arrest</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#00F0FF]" />
          </button>
        </div>
      </div>

      {/* Main Grid: Courtroom Player Circle & Live Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Courtroom Players Presence (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5 px-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Courtroom Suspects</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {players.map((player) => {
              const isMe = player.id === currentPlayer.id;
              const isThisRaja = player.role === 'raja' || player.id === rajaPlayer?.id;

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-40 relative overflow-hidden ${
                    isThisRaja
                      ? 'bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-[#0c101d] border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : isMe
                      ? 'bg-gradient-to-b from-[#00F0FF]/15 to-[#0c101d] border-[#00F0FF]/40'
                      : 'bg-[#0e1424]/90 border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] text-slate-950 flex items-center justify-center text-xl font-black shadow-md">
                      {player.avatar}
                    </div>

                    {isThisRaja ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/30 border border-amber-500/50 text-[9px] font-mono text-amber-300 font-bold flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" /> RAJA
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400">
                        SECRET CHIT
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-display font-black text-xs sm:text-sm text-white truncate">
                      {player.name} {isMe && '(You)'}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Score: {player.totalScore} pts
                    </p>
                  </div>

                  {/* Role status */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">Identity</span>
                    <span className={isThisRaja ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      {isThisRaja ? 'Crown Ruler 👑' : 'Hidden 🤔'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Player Personal Role Reminder Banner */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{currentPlayer.role ? ROLE_DEFINITIONS[currentPlayer.role].icon : '📜'}</span>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Your Role</span>
                <p className="text-xs font-bold text-white capitalize font-display">
                  {currentPlayer.role ? ROLE_DEFINITIONS[currentPlayer.role].hindiName : 'Loading...'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-[#ADFF2F]">
              {currentPlayer.role ? `${ROLE_DEFINITIONS[currentPlayer.role].points} PTS` : ''}
            </span>
          </div>
        </div>

        {/* Right: Live Interactive Discussion Chat (7 cols) */}
        <div className="lg:col-span-7 h-[420px]">
          <GameChat
            messages={chatMessages}
            currentPlayer={currentPlayer}
            onSendMessage={onSendMessage}
          />
        </div>
      </div>
    </div>
  );
};
