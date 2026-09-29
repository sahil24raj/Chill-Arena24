'use client';

import React, { useState } from 'react';
import { Player } from './chorSipahiTypes';
import {
  Crown,
  Users,
  Bot,
  Copy,
  Check,
  Play,
  UserPlus,
  ShieldAlert,
  Sparkles,
  Swords,
  Scroll
} from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface GameLobbyProps {
  roomCode: string;
  players: Player[];
  currentPlayer: Player;
  onAddBot: () => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  roomCode,
  players,
  currentPlayer,
  onAddBot,
  onToggleReady,
  onStartGame,
  onLeaveRoom
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    soundFx.playClick();
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/games/chor-sipahi?room=${roomCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHost = currentPlayer.isHost;
  const totalPlayers = players.length;
  const isFull = totalPlayers === 4;
  const allReady = players.every((p) => p.isReady || p.isBot);
  const canStart = isHost && isFull && allReady;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Lobby Hero Header */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0c1424] via-[#090e1a] to-[#150a1d] border-2 border-[#00F0FF]/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-8xl">
          👑
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-xs font-mono text-[#00F0FF]">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>4-PLAYER SOCIAL DEDUCTION ARENA</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight uppercase">
              CHOR SIPAHI <span className="text-[#00F0FF]">(RAJA MANTRI)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg font-sans leading-relaxed">
              4 chits are folded and thrown. Raja is crowned, Mantri hides, Sipahi investigates, and Chor bluffs!
            </p>
          </div>

          {/* Room Code Box */}
          <div className="bg-[#10162a]/90 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-xl shrink-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
              Game Room Code
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-mono tracking-widest text-[#00F0FF] bg-[#080c16] px-3.5 py-1 rounded-xl border border-[#00F0FF]/40">
                #{roomCode}
              </span>
              <button
                onClick={handleCopyLink}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-[#00F0FF]/20 border border-white/10 hover:border-[#00F0FF]/40 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Copy Room Link"
              >
                {copied ? <Check className="w-4 h-4 text-[#ADFF2F]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[9px] font-mono text-slate-500">
              {copied ? 'Link Copied to Clipboard!' : 'Share with squad to join instant match'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Players Slots Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00F0FF]" />
            <h2 className="text-sm font-black font-display text-white uppercase tracking-wider">
              Court Players ({totalPlayers}/4)
            </h2>
          </div>
          {isHost && totalPlayers < 4 && (
            <button
              onClick={() => {
                soundFx.playClick();
                onAddBot();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold font-display flex items-center gap-1.5 hover:scale-105 transition-all cursor-pointer shadow-md"
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>+ Add AI Court Member</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((index) => {
            const player = players[index];
            const isCurrent = player?.id === currentPlayer.id;

            if (player) {
              return (
                <div
                  key={player.id}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-48 relative overflow-hidden ${
                    isCurrent
                      ? 'bg-gradient-to-b from-[#0c1a2f] to-[#080d1a] border-[#00F0FF]/50 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                      : 'bg-[#0d1222]/80 border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] text-slate-950 flex items-center justify-center text-2xl font-black shadow-md">
                      {player.avatar}
                    </div>
                    {player.isHost && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono text-amber-300 font-bold">
                        <Crown className="w-2.5 h-2.5" /> HOST
                      </span>
                    )}
                    {player.isBot && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-[9px] font-mono text-purple-300 font-bold">
                        <Bot className="w-2.5 h-2.5" /> AI BOT
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display font-black text-sm text-white truncate">
                      {player.name} {isCurrent && '(You)'}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">
                      Score: {player.totalScore} pts
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">Status</span>
                    {player.isReady || player.isBot ? (
                      <span className="text-[10px] font-mono font-bold text-[#ADFF2F] flex items-center gap-1">
                        <Check className="w-3 h-3" /> READY
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-400 animate-pulse">
                        NOT READY
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Empty Slot
            return (
              <div
                key={`empty-${index}`}
                className="p-5 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center h-48 space-y-2.5 group hover:border-[#00F0FF]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 text-lg">
                  <UserPlus className="w-5 h-5 text-slate-500 group-hover:text-[#00F0FF] transition-colors" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold font-display text-slate-400">
                    Slot {index + 1} Empty
                  </span>
                  <p className="text-[10px] text-slate-600 font-sans">
                    Waiting for player or AI bot
                  </p>
                </div>
                {isHost && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onAddBot();
                    }}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 transition-colors"
                  >
                    + Fill Bot
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules & Points Quick Table */}
      <div className="p-5 rounded-2xl bg-[#090d1a]/80 border border-white/10">
        <h3 className="text-xs font-black font-display text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Scroll className="w-4 h-4 text-amber-400" /> Traditional Role Scoring
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <span className="text-amber-300 font-bold">👑 Raja</span>
            <span className="text-white font-black">1000 pts</span>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
            <span className="text-cyan-300 font-bold">🧠 Mantri</span>
            <span className="text-white font-black">800 pts</span>
          </div>
          <div className="p-2.5 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-between">
            <span className="text-lime-300 font-bold">👮 Sipahi</span>
            <span className="text-white font-black">500 pts</span>
          </div>
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
            <span className="text-red-300 font-bold">🥷 Chor</span>
            <span className="text-white font-black">0 pts</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d1222] border border-white/10">
        <button
          onClick={() => {
            soundFx.playClick();
            onLeaveRoom();
          }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-bold font-display transition-all cursor-pointer"
        >
          Leave Room
        </button>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleReady();
            }}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black font-display tracking-wider transition-all cursor-pointer ${
              currentPlayer.isReady
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
            }`}
          >
            {currentPlayer.isReady ? '✓ READY (Click to cancel)' : 'SET READY'}
          </button>

          {isHost ? (
            <button
              disabled={!canStart}
              onClick={() => {
                soundFx.playVictory();
                onStartGame();
              }}
              className={`flex-1 sm:flex-initial px-8 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                canStart
                  ? 'bg-gradient-to-r from-[#ADFF2F] to-[#00F0FF] text-slate-950 hover:scale-105 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START GAME</span>
            </button>
          ) : (
            <span className="text-xs font-mono text-slate-400 px-3">
              Waiting for Host to start...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
