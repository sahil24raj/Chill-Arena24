'use client';

import React, { useState, useEffect } from 'react';
import { Player, ROLE_DEFINITIONS } from './chorSipahiTypes';
import { Shield, AlertTriangle, Check, X, Swords, Crown, Search, HelpCircle } from 'lucide-react';
import { soundFx } from '@/lib/audio';
import { GameTimer } from './GameTimer';

interface SipahiGuessProps {
  players: Player[];
  currentPlayer: Player;
  sipahiPlayer: Player;
  rajaPlayer?: Player;
  onSubmitGuess: (suspectPlayerId: string) => void;
}

export const SipahiGuess: React.FC<SipahiGuessProps> = ({
  players,
  currentPlayer,
  sipahiPlayer,
  rajaPlayer,
  onSubmitGuess
}) => {
  const [selectedSuspect, setSelectedSuspect] = useState<Player | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const isSipahi = currentPlayer.id === sipahiPlayer.id;

  // The 3 suspect candidates (all players except Sipahi)
  const suspects = players.filter((p) => p.id !== sipahiPlayer.id);

  // Auto fallback guess if timer runs out
  const handleTimerExpire = () => {
    if (isSipahi) {
      // Pick current selected or random suspect
      const target = selectedSuspect || suspects[Math.floor(Math.random() * suspects.length)];
      if (target) {
        soundFx.playBuzzer();
        onSubmitGuess(target.id);
      }
    }
  };

  const handleSelectSuspect = (player: Player) => {
    if (!isSipahi) return;
    soundFx.playClick();
    setSelectedSuspect(player);
    setConfirmModalOpen(true);
  };

  const handleConfirmGuess = () => {
    if (!selectedSuspect) return;
    soundFx.playHit();
    setConfirmModalOpen(false);
    onSubmitGuess(selectedSuspect.id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Banner & Timer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#0c1322] via-[#090e1a] to-[#1a0f1d] border-2 border-[#00F0FF]/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-3xl shadow-lg">
            👮
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime-500/15 border border-lime-500/30 text-[10px] font-mono text-lime-400 font-bold mb-0.5">
              FINAL INTERROGATION
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white uppercase tracking-tight">
              {isSipahi ? 'WHO IS THE CHOR? (ARREST PHASE)' : 'SIPAHI IS DECIDING THE ARREST...'}
            </h1>
          </div>
        </div>

        <GameTimer
          initialSeconds={30}
          onExpire={handleTimerExpire}
          label="Interrogation Timer"
        />
      </div>

      {/* Sipahi View: Suspect Cards Selection */}
      {isSipahi ? (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-black font-display text-white uppercase">
              Inspect the Courtroom Suspects 🔍
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto font-sans">
              Choose the player you believe is the <b>Chor (Thief)</b>. You cannot select yourself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {suspects.map((suspect) => {
              const isThisRaja = suspect.id === rajaPlayer?.id || suspect.role === 'raja';
              const isSelected = selectedSuspect?.id === suspect.id;

              return (
                <div
                  key={suspect.id}
                  className={`p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between h-72 relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-b from-red-500/20 via-pink-500/10 to-[#0d1222] border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)] scale-105'
                      : 'bg-[#0d1222]/90 border-white/10 hover:border-[#00F0FF]/40 hover:scale-[1.02]'
                  }`}
                >
                  {/* Watermark */}
                  <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 pointer-events-none select-none">
                    🥷
                  </div>

                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      SUSPECT DOSSIER
                    </span>
                    {isThisRaja && (
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/40 flex items-center gap-1 font-bold">
                        <Crown className="w-3 h-3" /> RAJA
                      </span>
                    )}
                  </div>

                  {/* Avatar & Name */}
                  <div className="text-center space-y-2 my-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg group-hover:rotate-6 transition-transform">
                      {suspect.avatar}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-base text-white truncate">
                        {suspect.name}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400">
                        Total Score: {suspect.totalScore} pts
                      </p>
                    </div>
                  </div>

                  {/* Action Suspect Button */}
                  <button
                    onClick={() => handleSelectSuspect(suspect)}
                    className={`w-full py-3 rounded-xl font-display text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                      isSelected
                        ? 'bg-red-500 text-white shadow-red-500/30'
                        : 'bg-gradient-to-r from-red-600/30 to-amber-600/30 border border-red-500/40 text-red-300 hover:text-white hover:bg-red-600/50'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>[ SUSPECT AS CHOR ]</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Non-Sipahi Suspense Courtroom Waiting View */
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0d1222]/90 border border-white/10 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-lime-500/15 border-2 border-lime-500/40 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(173,255,47,0.2)] animate-pulse">
            👮
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-black font-display text-white uppercase tracking-tight">
              Sipahi ({sipahiPlayer.name}) is Interrogating
            </h2>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Maintain your poker face! The Sipahi is analyzing every movement, chat message, and alibi to make the arrest.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Awaiting Sipahi’s arrest submission...</span>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalOpen && selectedSuspect && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0f1526] border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.4)] text-center animate-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-4xl shadow-md">
              🥷
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
                Final Arrest Order
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                Are you sure <span className="text-[#00F0FF]">{selectedSuspect.name}</span> is the Chor?
              </h3>
              <p className="text-xs text-slate-300 font-sans">
                Once confirmed, all court chits will be revealed to every player in the room.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-display text-xs font-bold uppercase transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5 inline mr-1" /> Cancel
              </button>

              <button
                onClick={handleConfirmGuess}
                className="py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-display text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 inline mr-1" /> Confirm Guess
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
