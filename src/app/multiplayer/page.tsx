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
  ArrowRight,
  PlusCircle,
  KeyRound
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createRoomOnServer } from '@/lib/multiplayer/realtimeService';
import { normalizeRoomCode } from '@/lib/multiplayer/roomCodeGenerator';

export default function MultiplayerPage() {
  const router = useRouter();
  const { user, openMultiplayerModal } = useAppStore();
  const [selectedGame, setSelectedGame] = useState<string>('chor-sipahi');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAndPlay = (mode: 'local' | 'online' | 'ai') => {
    soundFx.playClick();
    if (mode === 'online') {
      openMultiplayerModal(GAMES_CATALOG.find((g) => g.id === selectedGame));
    } else {
      router.push(`/game/${selectedGame}?mode=${mode}`);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeRoomCode(roomCodeInput);
    if (!clean) return;
    soundFx.playClick();
    router.push(`/play/room/${clean}`);
  };

  const handleQuickCreateOnline = async () => {
    soundFx.playClick();
    setIsCreating(true);
    try {
      const res = await createRoomOnServer(selectedGame, user);
      if (res.success && res.data) {
        soundFx.playLevelUp();
        router.push(`/play/room/${res.data.roomCode}`);
      } else {
        alert(res.error || 'Failed to create room.');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating room.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      <MultiplayerLobbyModal />

      {/* Header Banner */}
      <div className="p-8 lg:p-12 rounded-3xl border-2 border-[#00F0FF]/30 bg-gradient-to-r from-[#0c1424] via-[#090d17] to-[#060910] relative overflow-hidden shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-xs font-mono text-[#00F0FF]">
          <Swords className="w-3.5 h-3.5" />
          <span>REAL-TIME MULTIPLAYER MATCHMAKING HUB</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
          CHALLENGE YOUR SQUAD. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-purple-400 to-[#ADFF2F]">
            INSTANT ROOM CODES & LINKS.
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 font-sans max-w-2xl leading-relaxed">
          Generate a unique 6-character room code or shareable invitation link. Play real-time 1v1 and 4-player social deduction duels synchronized across devices with zero lag.
        </p>

        {/* Quick Join Bar */}
        <form onSubmit={handleJoinSubmit} className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-lg">
          <div className="relative w-full">
            <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="ENTER ROOM CODE (e.g. X7K92P)"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              className="w-full bg-slate-950/90 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-xs font-mono font-bold text-[#00F0FF] placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]"
            />
          </div>
          <button
            type="submit"
            disabled={!roomCodeInput.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl cyber-button font-display text-xs font-black text-slate-950 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <span>JOIN ROOM</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Main 3 Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Online Multiplayer Room */}
        <div className="p-6 rounded-3xl glass-panel border border-[#00F0FF]/30 bg-[#0e1218]/90 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-2xl">
              🌐
            </div>
            <h3 className="text-lg font-black text-white font-display">CREATE ONLINE ROOM</h3>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              Generate a unique room code or share an invite URL to challenge friends across different devices with authoritative real-time sync.
            </p>

            <div className="pt-1">
              <label className="text-[10px] font-mono text-gray-500 block mb-1">SELECT GAME:</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full bg-slate-950 border border-gray-800 rounded-lg p-2 text-xs text-white font-bold"
              >
                {GAMES_CATALOG.filter((g) => g.multiplayer).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.thumbnail} {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleQuickCreateOnline}
            disabled={isCreating}
            className="w-full py-3.5 rounded-xl cyber-button font-display text-xs font-black text-slate-950 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{isCreating ? 'CREATING ROOM...' : 'LAUNCH ONLINE ROOM 🚀'}</span>
          </button>
        </div>

        {/* Card 2: Pass & Play Local */}
        <div className="p-6 rounded-3xl glass-panel border border-purple-500/30 bg-[#0e1218]/90 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl">
              👥
            </div>
            <h3 className="text-lg font-black text-white font-display">PASS & PLAY (LOCAL 1v1)</h3>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              Playing together on the same phone, laptop, or desk? Take turns flipping pens, guessing chits, and dueling with 2-player local scoreboards.
            </p>
          </div>

          <button
            onClick={() => handleCreateAndPlay('local')}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-display text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>START PASS & PLAY</span>
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
              No friend around right now? Train your pen flips, cricket spins, and rapid brain IQ against Bot_Chad with adaptive difficulty.
            </p>
          </div>

          <button
            onClick={() => handleCreateAndPlay('ai')}
            className="w-full py-3.5 rounded-xl bg-slate-900 border border-gray-800 hover:border-[#ADFF2F] text-white hover:text-[#ADFF2F] font-display text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>PRACTICE VS BOT</span>
          </button>
        </div>
      </div>

      {/* Multiplayer Catalog Quick Links */}
      <div className="p-6 lg:p-8 rounded-3xl glass-panel border border-gray-800 bg-[#0c1017]/90 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-base font-black text-white font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00F0FF]" /> MULTIPLAYER FEATURED GAMES
          </h3>
          <span className="text-[10px] font-mono text-[#00F0FF]">
            {GAMES_CATALOG.filter((g) => g.multiplayer).length} MULTIPLAYER GAMES READY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAMES_CATALOG.filter((g) => g.multiplayer).map((g) => (
            <div
              key={g.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-gray-800 hover:border-[#00F0FF]/40 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{g.thumbnail}</span>
                <div>
                  <h4 className="text-xs font-bold text-white font-display">{g.title}</h4>
                  <span className="text-[10px] font-mono text-cyan-300">{g.category}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    soundFx.playClick();
                    const res = await createRoomOnServer(g.id, user);
                    if (res.success && res.data) {
                      router.push(`/play/room/${res.data.roomCode}`);
                    }
                  }}
                  className="flex-1 py-2 rounded-lg cyber-button text-slate-950 text-[11px] font-black font-display text-center cursor-pointer"
                >
                  CREATE ROOM
                </button>
                <Link
                  href={`/game/${g.id}`}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-gray-800 text-gray-400 hover:text-white text-[11px] font-mono text-center"
                >
                  SOLO
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
