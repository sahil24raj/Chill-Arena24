'use client';

import React, { useState } from 'react';
import { MultiplayerRoomState } from '@/types/multiplayer';
import { ChorSipahiState, ChorSipahiRole } from '@/lib/multiplayer/adapters/ChorSipahiAdapter';
import { soundFx } from '@/lib/audio';
import { Sparkles, Trophy, Shield, Crown, Brain, Skull, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MultiplayerChorSipahiProps {
  room: MultiplayerRoomState<ChorSipahiState>;
  currentUserId: string;
  isMyTurn: boolean;
  isHost: boolean;
  submitAction: (actionType: string, actionData?: Record<string, any>) => Promise<any>;
}

const ROLE_INFO: Record<ChorSipahiRole, { name: string; icon: string; points: number; color: string; bg: string; border: string }> = {
  raja: {
    name: 'RAJA',
    icon: '👑',
    points: 1000,
    color: 'text-amber-400',
    bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-900/30',
    border: 'border-amber-400/60'
  },
  mantri: {
    name: 'MANTRI',
    icon: '🧠',
    points: 800,
    color: 'text-purple-400',
    bg: 'bg-gradient-to-br from-purple-500/20 to-indigo-900/30',
    border: 'border-purple-400/60'
  },
  sipahi: {
    name: 'SIPAHI',
    icon: '👮',
    points: 500,
    color: 'text-blue-400',
    bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-900/30',
    border: 'border-blue-400/60'
  },
  chor: {
    name: 'CHOR',
    icon: '🥷',
    points: 0,
    color: 'text-rose-400',
    bg: 'bg-gradient-to-br from-rose-500/20 to-red-950/40',
    border: 'border-rose-400/60'
  }
};

export const MultiplayerChorSipahi: React.FC<MultiplayerChorSipahiProps> = ({
  room,
  currentUserId,
  isMyTurn,
  isHost,
  submitAction
}) => {
  const gameState = room.gameState;
  const players = room.players;
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!gameState) {
    return (
      <div className="text-center p-8 text-cyan-300 font-mono">
        Initializing Chor Sipahi match...
      </div>
    );
  }

  const myRole = gameState.roleAssignments?.[currentUserId] as ChorSipahiRole | undefined;
  const isSipahi = gameState.sipahiPlayerId === currentUserId;
  const isRaja = gameState.rajaPlayerId === currentUserId;
  const rajaPlayer = players.find((p) => p.id === gameState.rajaPlayerId);
  const sipahiPlayer = players.find((p) => p.id === gameState.sipahiPlayerId);

  const phase = gameState.phase;

  const handleStartGuessing = async () => {
    soundFx.playClick();
    setSubmitting(true);
    try {
      await submitAction('START_GUESSING');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitGuess = async () => {
    if (!selectedSuspectId || !isSipahi) return;
    soundFx.playClick();
    setSubmitting(true);
    try {
      await submitAction('SUBMIT_SIPAHI_GUESS', { suspectId: selectedSuspectId });
      confetti({ particleCount: 70, spread: 60 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextRound = async () => {
    soundFx.playClick();
    setSubmitting(true);
    setSelectedSuspectId(null);
    try {
      await submitAction('NEXT_ROUND');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header & Round HUD */}
      <div className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-cyan-500/30 bg-[#0c1017]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
            👑
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              ROUND {gameState.currentRound} OF {gameState.maxRounds}
            </div>
            <div className="text-sm font-black font-display text-white">
              CHOR SIPAHI DUEL
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-mono text-cyan-400 font-bold">MATCH STATUS</div>
          <div className="text-xs font-bold text-amber-300 font-display">
            {phase === 'ROLE_REVEAL' && '📜 Chit Revelation'}
            {phase === 'DISCUSSION' && '💬 Suspect Inquiry'}
            {phase === 'SIPAHI_GUESS' && '🔍 Sipahi Interrogation'}
            {phase === 'ROUND_RESULT' && '⚖️ Round Verdict'}
            {phase === 'FINAL_PODIUM' && '🏆 Champion Ceremony'}
          </div>
        </div>
      </div>

      {/* Secret Chit Card for Current Player */}
      {myRole && (
        <div className={`p-5 rounded-3xl border-2 transition-all shadow-xl ${ROLE_INFO[myRole].border} ${ROLE_INFO[myRole].bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl animate-bounce">{ROLE_INFO[myRole].icon}</span>
              <div>
                <div className="text-[10px] font-mono font-bold text-gray-300 uppercase tracking-wider">
                  YOUR SECRET ROLE (KEEP HIDDEN)
                </div>
                <div className={`text-2xl font-black font-display tracking-wide ${ROLE_INFO[myRole].color}`}>
                  {ROLE_INFO[myRole].name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-gray-300">ROUND REWARD</div>
              <div className="text-lg font-black font-mono text-white">
                +{ROLE_INFO[myRole].points} PTS
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 text-xs font-sans text-gray-300">
            {myRole === 'raja' && '👑 You are the King! Your identity is known. Sipahi must protect the realm and find the thief.'}
            {myRole === 'sipahi' && '👮 You are the Police! Look at the 3 suspects and identify the hidden Chor.'}
            {myRole === 'mantri' && '🧠 You are the Minister! Stay quiet and don\'t let the Sipahi mistake you for the thief.'}
            {myRole === 'chor' && '🥷 You are the Thief! Pretend you are the Mantri so the Sipahi accuses someone else!'}
          </div>
        </div>
      )}

      {/* Raja Declaration Card */}
      {rajaPlayer && (
        <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg">
              👑
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-300 font-bold uppercase">THE KING OF THIS ROUND</div>
              <div className="text-sm font-bold text-white font-display">
                {rajaPlayer.username} {rajaPlayer.id === currentUserId && '(YOU)'}
              </div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-xs font-mono font-bold text-amber-300">
            1000 PTS GUARANTEED
          </div>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 bg-[#0c1017] space-y-6">
        {/* Phase 1: Discussion / Advance to Guessing */}
        {(phase === 'ROLE_REVEAL' || phase === 'DISCUSSION') && (
          <div className="text-center space-y-4 py-4">
            <div className="text-base font-bold text-white font-display">
              All 4 Chits have been dealt!
            </div>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              The Raja has taken the throne. When ready, the Sipahi will interrogate the 3 suspects to find the Chor.
            </p>
            <div>
              <button
                onClick={handleStartGuessing}
                disabled={submitting}
                className="px-6 py-3 rounded-xl cyber-button font-display font-black text-slate-950 text-xs shadow-lg shadow-cyan-500/30 flex items-center gap-2 mx-auto cursor-pointer"
              >
                <span>PROCEED TO ARREST PHASE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Sipahi Guessing */}
        {phase === 'SIPAHI_GUESS' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                {isSipahi ? 'YOUR MISSION: IDENTIFY THE CHOR' : `${sipahiPlayer?.username || 'Sipahi'} is choosing a suspect...`}
              </div>
              <h3 className="text-lg font-black text-white font-display mt-1">
                Select the suspect who is the CHOR 🥷
              </h3>
            </div>

            {/* Suspect Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {gameState.suspectPlayerIds.map((pid) => {
                const player = players.find((p) => p.id === pid);
                if (!player) return null;
                const isSelected = selectedSuspectId === pid;

                return (
                  <button
                    key={pid}
                    onClick={() => {
                      if (isSipahi) {
                        soundFx.playClick();
                        setSelectedSuspectId(pid);
                      }
                    }}
                    disabled={!isSipahi || submitting}
                    className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-400 shadow-lg shadow-rose-500/20 scale-102 ring-2 ring-rose-400'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    } ${!isSipahi ? 'cursor-default opacity-90' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{player.avatar || '👤'}</span>
                      <div>
                        <div className="text-xs font-bold text-white font-display">
                          {player.username}
                        </div>
                        <div className="text-[10px] font-mono text-gray-400">
                          {player.id === currentUserId ? '(You)' : 'Suspect'}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-2 border-t border-rose-500/30 flex items-center justify-between text-[10px] font-mono font-bold text-rose-300">
                        <span>ACCUSED AS CHOR</span>
                        <Skull className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submit Guess Button for Sipahi */}
            {isSipahi ? (
              <div className="text-center pt-2">
                <button
                  onClick={handleSubmitGuess}
                  disabled={!selectedSuspectId || submitting}
                  className={`w-full py-3.5 rounded-xl font-display font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all ${
                    selectedSuspectId && !submitting
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/30 cursor-pointer hover:scale-101'
                      : 'bg-slate-800 text-gray-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>CONFIRM ARREST & REVEAL CHITS</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-2 text-xs font-mono text-gray-400 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Waiting for Sipahi ({sipahiPlayer?.username}) to make their decision...</span>
              </div>
            )}
          </div>
        )}

        {/* Phase 3: Round Result */}
        {(phase === 'ROUND_RESULT' || phase === 'FINAL_PODIUM') && (
          <div className="space-y-6">
            {/* Outcome Banner */}
            <div
              className={`p-4 rounded-2xl border text-center space-y-2 ${
                gameState.guessIsCorrect
                  ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-400/50 text-rose-300'
              }`}
            >
              <div className="text-2xl">
                {gameState.guessIsCorrect ? '🎉 SIPAHI CAUGHT THE CHOR!' : '😱 WRONG ACCUSATION! CHOR ESCAPED!'}
              </div>
              <p className="text-xs font-sans text-gray-300 max-w-md mx-auto">
                {gameState.guessIsCorrect
                  ? 'The Sipahi accurately identified the thief! Sipahi earns 500 PTS and Chor gets 0.'
                  : 'The Sipahi falsely accused the innocent! The Chor steals the Sipahi\'s 500 PTS.'}
              </p>
            </div>

            {/* Role Reveal Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {players.map((p) => {
                const role = gameState.roleAssignments?.[p.id] as ChorSipahiRole | undefined;
                if (!role) return null;
                const earned = gameState.roundScores?.[p.id] || 0;

                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-2xl border ${ROLE_INFO[role].border} ${ROLE_INFO[role].bg} text-center space-y-1`}
                  >
                    <div className="text-2xl">{ROLE_INFO[role].icon}</div>
                    <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                      {ROLE_INFO[role].name}
                    </div>
                    <div className="text-xs font-bold text-white font-display truncate">
                      {p.username}
                    </div>
                    <div className="text-sm font-black font-mono text-cyan-300 pt-1 border-t border-white/10">
                      +{earned} PTS
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Round Button */}
            {phase === 'ROUND_RESULT' && (
              <div className="text-center pt-2">
                <button
                  onClick={handleNextRound}
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl cyber-button font-display font-black text-slate-950 text-xs shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>START NEXT ROUND ({gameState.currentRound + 1}/{gameState.maxRounds})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cumulative Leaderboard Scoreboard */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-[#0c1017]/80">
        <div className="text-xs font-mono font-bold text-gray-400 mb-3 uppercase tracking-wider flex items-center justify-between">
          <span>MATCH SCOREBOARD</span>
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map((p) => {
            const total = gameState.cumulativeScores?.[p.id] || 0;
            return (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{p.avatar || '👤'}</span>
                  <span className="text-xs font-bold text-white font-display truncate">
                    {p.username}
                  </span>
                </div>
                <span className="text-sm font-black font-mono text-amber-300">
                  {total}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
