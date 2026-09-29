'use client';

import React, { useEffect } from 'react';
import { Player, ROLE_DEFINITIONS, RoundResult } from './chorSipahiTypes';
import { Crown, Sparkles, Trophy, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { soundFx } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface ResultRevealProps {
  players: Player[];
  lastResult: RoundResult;
  currentPlayer: Player;
  onNextRound: () => void;
  onLeaveRoom: () => void;
}

export const ResultReveal: React.FC<ResultRevealProps> = ({
  players,
  lastResult,
  currentPlayer,
  onNextRound,
  onLeaveRoom
}) => {
  const isCorrect = lastResult.isCorrectGuess;
  const isHost = currentPlayer.isHost;

  const guessedPlayer = players.find((p) => p.id === lastResult.guessedPlayerId);
  const sipahiPlayer = players.find((p) => p.id === lastResult.sipahiId);
  const chorPlayer = players.find((p) => p.id === lastResult.chorId);

  useEffect(() => {
    if (isCorrect) {
      soundFx.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      soundFx.playWrong();
    }
  }, [isCorrect]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Banner Outcome */}
      <div
        className={`p-6 sm:p-10 rounded-3xl border-2 text-center relative overflow-hidden shadow-2xl ${
          isCorrect
            ? 'bg-gradient-to-r from-[#0c261e] via-[#091a14] to-[#123824] border-lime-500/50 shadow-[0_0_40px_rgba(173,255,47,0.25)]'
            : 'bg-gradient-to-r from-[#290c12] via-[#1a080c] to-[#3a0d18] border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.25)]'
        }`}
      >
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-mono text-slate-300">
            <span>ROUND {lastResult.roundNumber} CONCLUDED</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl sm:text-5xl">{isCorrect ? '🚨' : '💨'}</span>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight uppercase">
              {isCorrect ? 'SIPAHI CAUGHT THE CHOR!' : 'THE CHOR ESCAPED!'}
            </h1>
            <span className="text-4xl sm:text-5xl">{isCorrect ? '🎉' : '🥷'}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-sans leading-relaxed">
            {isCorrect ? (
              <>
                Sipahi <b>{sipahiPlayer?.name}</b> successfully interrogated and arrested Chor <b>{chorPlayer?.name}</b>!
              </>
            ) : (
              <>
                Sipahi <b>{sipahiPlayer?.name}</b> falsely arrested <b>{guessedPlayer?.name}</b>, allowing Chor <b>{chorPlayer?.name}</b> to escape into the night!
              </>
            )}
          </p>
        </div>
      </div>

      {/* 4 Cards Grand Reveal Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-black font-display text-white uppercase tracking-wider">
            All Court Identities & Round Points
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {players.map((player) => {
            const roleKey = player.role || 'chor';
            const roleConfig = ROLE_DEFINITIONS[roleKey];
            const isMe = player.id === currentPlayer.id;
            const wasGuessed = player.id === lastResult.guessedPlayerId;

            return (
              <div
                key={player.id}
                className={`p-5 rounded-3xl border-2 transition-all duration-500 flex flex-col justify-between h-72 relative overflow-hidden bg-gradient-to-b ${roleConfig.bgGradient} shadow-xl`}
                style={{ borderColor: roleConfig.color }}
              >
                {/* Background Watermark */}
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 pointer-events-none select-none">
                  {roleConfig.icon}
                </div>

                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/40 border border-white/10 text-white">
                    {roleConfig.name.toUpperCase()}
                  </span>
                  {wasGuessed && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-red-500 text-white font-bold animate-pulse">
                      ACCUSED
                    </span>
                  )}
                </div>

                {/* Avatar & True Role Title */}
                <div className="text-center space-y-2 my-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl shadow-lg">
                    {roleConfig.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm text-white truncate">
                      {player.name} {isMe && '(You)'}
                    </h3>
                    <p className="text-xs font-black font-display uppercase" style={{ color: roleConfig.color }}>
                      {roleConfig.hindiName}
                    </p>
                  </div>
                </div>

                {/* Points Card Footer */}
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Earned:</span>
                  <span className="font-black text-white" style={{ color: roleConfig.color }}>
                    +{roleConfig.points} PTS
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Leaderboard Summary */}
      <div className="p-6 rounded-3xl bg-[#0b101f] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
              Session Cumulative Standings
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Total Rounds: {lastResult.roundNumber}
          </span>
        </div>

        <div className="divide-y divide-white/5 font-mono text-xs">
          {[...players]
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((p, idx) => {
              const medals = ['🥇', '🥈', '🥉', '4️⃣'];
              const isMe = p.id === currentPlayer.id;

              return (
                <div
                  key={p.id}
                  className={`py-3 flex items-center justify-between ${
                    isMe ? 'text-[#00F0FF] font-bold' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{medals[idx]}</span>
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-sm">
                      {p.avatar}
                    </div>
                    <span className="font-sans font-bold">
                      {p.name} {isMe && '(You)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      {p.stats.correctGuesses} Caught • {p.stats.escapesAsChor} Escaped
                    </span>
                    <span className="text-sm font-black text-white bg-white/5 px-3 py-1 rounded-xl border border-white/5">
                      {p.totalScore} pts
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d1222] border border-white/10">
        <button
          onClick={() => {
            soundFx.playClick();
            onLeaveRoom();
          }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-bold font-display transition-all cursor-pointer"
        >
          Exit Room
        </button>

        {isHost ? (
          <button
            onClick={() => {
              soundFx.playClick();
              onNextRound();
            }}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#ADFF2F] to-[#00F0FF] text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY NEXT ROUND</span>
          </button>
        ) : (
          <span className="text-xs font-mono text-slate-400">
            Waiting for Host to start Round {lastResult.roundNumber + 1}...
          </span>
        )}
      </div>
    </div>
  );
};
