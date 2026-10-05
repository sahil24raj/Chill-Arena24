'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { MultiplayerLobbyModal } from '@/components/MultiplayerLobbyModal';
import {
  Swords,
  Users,
  Sparkles,
  Zap,
  Play,
  Share2,
  KeyRound,
  ArrowRight,
  Shield,
  Bot
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

  const selectedGameObj = GAMES_CATALOG.find((g) => g.id === selectedGame) || GAMES_CATALOG[0];

  return (
    <div className="space-y-12 pb-16">
      <MultiplayerLobbyModal />

      {/* Header Banner: Call Your Squad */}
      <div className="p-8 sm:p-12 rounded-3xl border border-white/10 bg-gradient-to-r from-[#181C2A] via-[#10131D] to-[#080A12] relative overflow-hidden shadow-2xl space-y-5">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-[#D946EF]/10 via-[#06B6D4]/5 to-transparent pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10131D] border border-white/10 text-xs font-mono text-[#F472B6]">
          <Swords className="w-3.5 h-3.5" />
          <span>CALL YOUR SQUAD • REAL-TIME MULTIPLAYER</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
          CREATE YOUR VIBE. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] via-[#A855F7] to-[#06B6D4]">
            JOIN THE SQUAD.
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-2xl leading-relaxed">
          Generate an instant 6-character room code or shareable invite URL. Play real-time party matches and 1v1 duels synchronized across devices with zero lag.
        </p>

        {/* Quick Join Bar: Join the Squad */}
        <form onSubmit={handleJoinSubmit} className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-lg">
          <div className="relative w-full">
            <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="ENTER 6-DIGIT ROOM CODE (e.g. X7K92P)"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              className="w-full bg-[#080A12] border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs font-mono font-bold text-[#38BDF8] placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] uppercase tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={!roomCodeInput.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl va-btn-primary text-xs font-bold flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <span>JOIN ROOM</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Main 3 Action Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Online Multiplayer Room */}
        <div className="p-6 rounded-3xl bg-[#10131D] border border-white/10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D946EF]/10 border border-[#D946EF]/30 flex items-center justify-center text-2xl">
              🌐
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#D946EF] uppercase">CREATE ROOM</div>
              <h3 className="text-xl font-bold text-white font-display">Create Your Vibe</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Generate a unique room code or share an invite URL to challenge friends across different devices with real-time state synchronization.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-mono text-slate-400 block">SELECT GAME FOR LOBBY:</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full bg-[#080A12] border border-white/15 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-[#D946EF]"
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
            className="w-full py-3.5 rounded-xl va-btn-primary text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isCreating ? 'CREATING ROOM...' : 'LAUNCH ONLINE ROOM 🚀'}</span>
          </button>
        </div>

        {/* Card 2: Local Pass & Play */}
        <div className="p-6 rounded-3xl bg-[#10131D] border border-white/10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-2xl">
              📱
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#06B6D4] uppercase">SAME DEVICE</div>
              <h3 className="text-xl font-bold text-white font-display">Local Pass & Play</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Sitting together at the canteen table or in a hostel room? Hand the phone back-and-forth for instant turn-based battles.
            </p>

            <div className="p-3 rounded-xl bg-[#080A12] border border-white/[0.06] text-xs text-slate-300 font-sans">
              <div className="font-semibold text-white mb-1">Recommended Local Games:</div>
              <div className="text-[11px] text-slate-400">Chor Sipahi (4-Player Chits), Pen Flip, Tic-Tac-Toe, Spin Cricket.</div>
            </div>
          </div>

          <Link
            href={`/game/${selectedGame}?mode=local`}
            onClick={() => soundFx.playClick()}
            className="w-full py-3.5 rounded-xl va-btn-secondary text-xs font-bold flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4 text-[#06B6D4]" />
            <span>START PASS & PLAY DUEL</span>
          </Link>
        </div>

        {/* Card 3: AI Bot Duel Arena */}
        <div className="p-6 rounded-3xl bg-[#10131D] border border-white/10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <div className="text-[10px] font-mono text-purple-400 uppercase">SOLO PRACTICE</div>
              <h3 className="text-xl font-bold text-white font-display">Challenge Smart AI</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Squad offline? Warm up against calibrated AI bots across Easy, Medium, and Unbeatable levels with simulated human delays.
            </p>

            <div className="p-3 rounded-xl bg-[#080A12] border border-white/[0.06] text-xs text-slate-300 font-sans">
              <div className="font-semibold text-white mb-1">Instant Practice:</div>
              <div className="text-[11px] text-slate-400">Zero wait time. Sharpen your word-building reflexes & spin strategies.</div>
            </div>
          </div>

          <Link
            href={`/game/${selectedGame}?mode=ai`}
            onClick={() => soundFx.playClick()}
            className="w-full py-3.5 rounded-xl bg-[#181C2A] hover:bg-[#202638] border border-purple-500/30 text-xs font-bold text-purple-200 hover:text-white flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>PLAY VS SMART AI</span>
          </Link>
        </div>

      </div>

      {/* Featured Multiplayer Games Row */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <h2 className="text-xl font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
            <span className="text-[#D946EF]">●</span>
            <span>MULTIPLAYER-READY GAMES</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Instant synchronized play</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES_CATALOG.filter((g) => g.multiplayer).map((game) => (
            <div
              key={game.id}
              className="va-card rounded-2xl overflow-hidden flex flex-col justify-between group"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#080A12]">
                <Image
                  src={game.bannerImage}
                  alt={game.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10131D] via-transparent to-transparent opacity-80" />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#080A12]/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#F472B6]">
                  {game.category}
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white font-display group-hover:text-[#F472B6] transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-1 line-clamp-2">
                    {game.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      openMultiplayerModal(game);
                    }}
                    className="flex-1 py-2.5 rounded-xl va-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create Room</span>
                  </button>

                  <Link
                    href={`/game/${game.id}`}
                    onClick={() => soundFx.playClick()}
                    className="px-3.5 py-2.5 rounded-xl va-btn-secondary text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
