'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { MultiplayerLobbyModal } from '@/components/MultiplayerLobbyModal';
import {
  Swords,
  Users,
  Sparkles,
  Zap,
  Bot,
  Play,
  Copy,
  Check,
  Shield,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MultiplayerPage() {
  const router = useRouter();
  const { user, activeRoom, createRoom, openMultiplayerModal } = useAppStore();
  const [selectedGame, setSelectedGame] = useState<string>('pen-flip');
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const handleCreateAndPlay = (mode: 'local' | 'online' | 'ai') => {
    soundFx.playClick();
    createRoom(selectedGame, mode);
    router.push(`/game/${selectedGame}`);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    soundFx.playClick();
    router.push(`/game/${selectedGame}?room=${roomCodeInput.replace('#', '')}`);
  };

  return (
    <div className="space-y-10 pb-16">
      <MultiplayerLobbyModal />

      {/* Header Banner */}
      <div className="p-8 lg:p-12 rounded-3xl border-2 border-[#00F0FF]/30 bg-gradient-to-r from-[#0c1424] via-[#090d17] to-[#060910] relative overflow-hidden shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-xs font-mono text-[#00F0FF]">
          <Swords className="w-3.5 h-3.5" />
          <span>INSTANT MULTIPLAYER MATCHMAKING HUB</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
          CHALLENGE YOUR SQUAD. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-purple-400 to-[#ADFF2F]">
            NO DOWNLOADS NEEDED.
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 font-sans max-w-2xl leading-relaxed">
          Create a private room code, share the link with your friend on Discord, WhatsApp, or Twitter, and launch instant 1v1 classroom & meme battles in 60 FPS.
        </p>
      </div>

      {/* Main 3 Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Pass & Play Local */}
        <div className="p-6 rounded-3xl glass-panel border border-[#00F0FF]/30 bg-[#0e1218]/90 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-2xl">
              👥
            </div>
            <h3 className="text-lg font-black text-white font-display">PASS & PLAY (LOCAL 1v1)</h3>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              Playing on the same phone, laptop, or desk? Take turns flipping pens, throwing erasers, and spinning cricket wheels with 2-player local scoreboards.
            </p>
          </div>

          <button
            onClick={() => handleCreateAndPlay('local')}
            className="w-full py-3.5 rounded-xl cyber-button font-display text-xs font-black text-slate-950 flex items-center justify-center gap-2 shadow-lg"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>START PASS & PLAY MATCH</span>
          </button>
        </div>

        {/* Card 2: Create Online Room */}
        <div className="p-6 rounded-3xl glass-panel border border-purple-500/30 bg-[#0e1218]/90 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl">
              🔑
            </div>
            <h3 className="text-lg font-black text-white font-display">CREATE ROOM CODE (#A82KD)</h3>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              Generate a unique 5-letter private room code. Copy the invite link to challenge friends anywhere in the world.
            </p>
          </div>

          <button
            onClick={() => openMultiplayerModal()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-display text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>GENERATE ROOM CODE</span>
          </button>
        </div>

        {/* Card 3: vs Smart AI */}
        <div className="p-6 rounded-3xl glass-panel border border-[#ADFF2F]/30 bg-[#0e1218]/90 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ADFF2F]/10 border border-[#ADFF2F]/30 flex items-center justify-center text-2xl">
              🤖
            </div>
            <h3 className="text-lg font-black text-white font-display">SOLO / VS SMART BOT</h3>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              No friend around? Train your pen flips, cricket spins, and rapid brain IQ against Bot_Chad with adaptive difficulty.
            </p>
          </div>

          <button
            onClick={() => handleCreateAndPlay('ai')}
            className="w-full py-3.5 rounded-xl bg-slate-900 border border-gray-800 hover:border-[#ADFF2F] text-white hover:text-[#ADFF2F] font-display text-xs font-black flex items-center justify-center gap-2 transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>PRACTICE VS BOT</span>
          </button>
        </div>
      </div>

      {/* Public Duel Rooms List / Active Room View */}
      <div className="p-6 lg:p-8 rounded-3xl glass-panel border border-gray-800 bg-[#0c1017]/90 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-base font-black text-white font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00F0FF]" /> ACTIVE MULTIPLAYER ROOMS
          </h3>
          <span className="text-[10px] font-mono text-[#00F0FF]">
            {activeRoom ? '1 ACTIVE ROOM' : '0 ACTIVE ROOMS'}
          </span>
        </div>

        {activeRoom ? (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-[#00F0FF]/40 flex items-center justify-between gap-3 font-mono">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[#ADFF2F] font-black text-sm">{activeRoom.code}</span>
                <span className="text-xs font-bold text-white font-display">{activeRoom.gameTitle}</span>
              </div>
              <span className="text-[10px] text-gray-400 block">
                Host: {activeRoom.hostName} • Status: {activeRoom.status}
              </span>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                router.push(`/game/${activeRoom.gameId}?room=${activeRoom.code.replace('#', '')}`);
              }}
              className="px-4 py-2 rounded-xl cyber-button text-slate-950 text-xs font-black font-display transition-transform hover:scale-105"
            >
              RESUME MATCH &rarr;
            </button>
          </div>
        ) : (
          <div className="text-center py-10 px-4 space-y-3">
            <p className="text-xs font-bold text-gray-300">No active multiplayer lobbies open right now.</p>
            <p className="text-[11px] text-gray-500 max-w-md mx-auto">
              Create a custom room code above to challenge a friend, or jump into Pass & Play mode on this device!
            </p>
            <button
              onClick={() => {
                soundFx.playClick();
                openMultiplayerModal();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-display text-xs font-bold shadow-lg"
            >
              CREATE CUSTOM ROOM
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
