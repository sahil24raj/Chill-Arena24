'use client';

import React, { use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMultiplayerRoom } from '@/lib/multiplayer/useMultiplayerRoom';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Users,
  Copy,
  Check,
  Share2,
  Swords,
  Play,
  ArrowLeft,
  Sparkles,
  Shield,
  Trophy,
  RefreshCw,
  AlertCircle,
  MessageCircle,
  Bot,
  UserPlus,
  Trash2,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Game Canvases for in-room live play
import { TicTacToeCanvas } from '@/components/games/TicTacToeCanvas';
import { MultiplayerTicTacToe } from '@/components/multiplayer/MultiplayerTicTacToe';
import { MultiplayerWordBuilder } from '@/components/multiplayer/MultiplayerWordBuilder';
import { MultiplayerChorSipahi } from '@/components/multiplayer/MultiplayerChorSipahi';
import { ChorSipahiGame } from '@/components/games/chor-sipahi/ChorSipahiGame';
import { SpinCricketCanvas } from '@/components/games/SpinCricketCanvas';
import { PenFlipCanvas } from '@/components/games/PenFlipCanvas';
import { WordBuilderCanvas } from '@/components/games/WordBuilderCanvas';
import { BrainPotCanvas } from '@/components/games/BrainPotCanvas';
import { ModiRunCanvas } from '@/components/games/ModiRunCanvas';
import { FakeBombCanvas } from '@/components/games/fake-bomb/FakeBombCanvas';
import { CIDEscapeCanvas } from '@/components/games/CIDEscapeCanvas';
import { EmojiDodgeCanvas } from '@/components/games/EmojiDodgeCanvas';
import { EraserThrowCanvas } from '@/components/games/EraserThrowCanvas';
import { GullyCricketCanvas } from '@/components/games/GullyCricketCanvas';
import { ChaiTapriCanvas } from '@/components/games/ChaiTapriCanvas';
import { MemeClickerCanvas } from '@/components/games/MemeClickerCanvas';
import { GameFullscreenShell } from '@/components/game-shell/GameFullscreenShell';

export default function PlayRoomPage({
  params
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = use(params);
  const router = useRouter();
  const { user } = useAppStore();

  const {
    room,
    loading,
    error,
    connectionStatus,
    currentPlayer,
    isHost,
    isMyTurn,
    startGame,
    addBot,
    removePlayerOrBot,
    submitAction,
    leaveRoom,
    copyRoomCode,
    copyInviteLink,
    shareNative,
    shareWhatsApp,
    copiedCode,
    copiedLink
  } = useMultiplayerRoom({
    roomCode,
    autoJoin: true,
    onGameFinish: (winnerId) => {
      confetti({ particleCount: 80, spread: 70 });
    }
  });

  const game = room ? GAMES_CATALOG.find((g) => g.id === room.gameId) || GAMES_CATALOG[0] : null;

  // Render game canvas if PLAYING
  const renderPlayingGame = () => {
    if (!room || !game) return null;

    switch (room.gameId) {
      case 'fake-bomb':
        return <FakeBombCanvas roomCode={roomCode} isMultiplayerSession={true} />;
      case 'chor-sipahi':
        return (
          <MultiplayerChorSipahi
            room={room as any}
            currentUserId={currentPlayer?.id || user.id}
            isMyTurn={isMyTurn}
            isHost={isHost}
            submitAction={submitAction}
          />
        );
      case 'tic-tac-toe':
        return (
          <MultiplayerTicTacToe
            room={room as any}
            currentUserId={currentPlayer?.id || user.id}
            isMyTurn={isMyTurn}
            submitAction={submitAction}
          />
        );
      case 'word-builder':
        return (
          <MultiplayerWordBuilder
            room={room as any}
            currentUserId={currentPlayer?.id || user.id}
            isHost={isHost}
            submitAction={submitAction}
          />
        );
      case 'spin-cricket':
        return <SpinCricketCanvas />;
      case 'pen-flip':
        return <PenFlipCanvas />;
      case 'brain-pot':
        return <BrainPotCanvas />;
      case 'modi-run':
        return <ModiRunCanvas />;
      case 'cid-escape':
        return <CIDEscapeCanvas />;
      case 'emoji-dodge':
        return <EmojiDodgeCanvas />;
      case 'eraser-throw':
        return <EraserThrowCanvas />;
      case 'gully-cricket':
        return <GullyCricketCanvas />;
      case 'chai-tapri':
        return <ChaiTapriCanvas />;
      case 'meme-clicker':
        return <MemeClickerCanvas />;
      default:
        return (
          <MultiplayerTicTacToe
            room={room as any}
            currentUserId={currentPlayer?.id || user.id}
            isMyTurn={isMyTurn}
            submitAction={submitAction}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#00F0FF]/30 border-t-[#00F0FF] animate-spin" />
        <div className="text-sm font-mono text-cyan-300">Connecting to Room #{roomCode}...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl glass-panel border border-red-500/30 bg-[#0c1017] text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white font-display">ROOM UNAVAILABLE</h2>
          <p className="text-xs text-gray-400 font-sans">{error || 'This room does not exist or has expired.'}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/multiplayer"
            className="w-full py-3 rounded-xl cyber-button font-display text-xs font-black text-slate-950 flex items-center justify-center gap-2"
          >
            <Swords className="w-4 h-4" />
            <span>CREATE NEW ROOM</span>
          </Link>
          <Link
            href="/games"
            className="w-full py-3 rounded-xl bg-slate-900 border border-gray-800 text-gray-400 hover:text-white text-xs font-mono text-center"
          >
            BROWSE GAMES CATALOG
          </Link>
        </div>
      </div>
    );
  }

  // --- PLAYING STATE ---
  if (room.status === 'PLAYING') {
    return (
      <div className="space-y-6 pb-16">
        {/* Top Match HUD Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl va-card bg-[#10131D]/95 border-white/[0.08]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{game?.thumbnail}</span>
            <div>
              <div className="text-xs font-mono text-[#06B6D4] uppercase tracking-wider font-bold">{game?.title}</div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="text-[#F472B6] font-bold">ROOM #{room.roomCode}</span>
                <span>•</span>
                <span className={connectionStatus === 'CONNECTED' ? 'text-emerald-400 font-semibold' : 'text-amber-400 animate-pulse font-semibold'}>
                  ● {connectionStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                leaveRoom();
                router.push('/multiplayer');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-red-600/15 border border-red-500/30 text-red-300 hover:bg-red-600/30 text-xs font-mono transition-colors"
            >
              LEAVE ARENA
            </button>
          </div>
        </div>

        {/* Embedded Game Canvas with Fullscreen Experience */}
        <GameFullscreenShell
          gameId={room.gameId}
          gameTitle={room.gameTitle}
          category={game?.category || 'Multiplayer Duel'}
        >
          {renderPlayingGame()}
        </GameFullscreenShell>
      </div>
    );
  }

  // --- FINISHED STATE ---
  if (room.status === 'FINISHED') {
    const isWinner = room.winnerPlayerId === (currentPlayer?.id || user.id);
    return (
      <div className="max-w-lg mx-auto my-8 p-8 rounded-3xl va-card bg-[#10131D]/95 border-white/[0.08] text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#D946EF] to-[#06B6D4] flex items-center justify-center text-white shadow-xl shadow-[#D946EF]/20">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#D946EF]/15 border border-[#D946EF]/40 text-[#F472B6]">
            {isWinner ? '👑 VIBE KING' : '💀 BRO... SKILL ISSUE'}
          </div>
          <h2 className="text-2xl font-black text-white font-display uppercase tracking-tight">MATCH CONCLUDED</h2>
          <p className="text-xs font-mono text-slate-300">
            {room.winnerUsername ? `Winner: ${room.winnerUsername} 🏆` : '🤝 Tied Match! Equal Vibes!'}
          </p>
        </div>

        {/* Players Summary */}
        <div className="space-y-2">
          {room.players.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border ${
                p.id === room.winnerPlayerId
                  ? 'bg-[#D946EF]/15 border-[#D946EF]/40 text-white'
                  : 'bg-[#080A12]/80 border-white/[0.06] text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{p.avatar}</span>
                <span className="text-xs font-bold font-display">{p.username}</span>
                {p.isHost && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">HOST</span>}
              </div>
              <div className="text-xs font-mono font-bold">
                {p.id === room.winnerPlayerId ? '👑 CHAMPION' : 'PARTICIPANT'}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isHost ? (
            <button
              onClick={startGame}
              className="flex-1 py-3.5 rounded-xl va-btn-primary font-display text-xs font-black text-white flex items-center justify-center gap-2 shadow-lg"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>LET THE CHAOS BEGIN</span>
            </button>
          ) : (
            <div className="flex-1 py-3 text-xs font-mono text-slate-400">Waiting for host to replay...</div>
          )}

          <Link
            href="/multiplayer"
            className="flex-1 py-3.5 rounded-xl bg-slate-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-display font-bold flex items-center justify-center"
          >
            EXIT TO LOBBY
          </Link>
        </div>
      </div>
    );
  }

  // --- WAITING / READY LOBBY STATE ---
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Back to Multiplayer Hub */}
      <div className="flex items-center justify-between">
        <Link
          href="/multiplayer"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-[#06B6D4] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO ARENA</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SQUAD LOBBY ACTIVE</span>
        </div>
      </div>

      {/* Main Lobby Card */}
      <div className="rounded-3xl va-card bg-[#10131D]/95 border-white/[0.08] p-6 sm:p-8 space-y-8 shadow-2xl">
        {/* Game Title Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D946EF]/20 to-[#06B6D4]/20 border border-white/10 flex items-center justify-center text-3xl">
              {game?.thumbnail || '🎮'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#06B6D4]">
                <Sparkles className="w-3 h-3" />
                <span>{game?.category || 'Arena'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-display">{room.gameTitle}</h1>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400">CAPACITY</div>
            <div className="text-sm font-black text-white font-display">
              {room.players.length} / {room.maxPlayers} SQUAD
            </div>
          </div>
        </div>

        {/* Room Code & Invitation Link Box */}
        <div className="p-5 rounded-2xl bg-[#080A12]/90 border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">ROOM PASSCODE</div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] to-[#06B6D4] font-mono tracking-widest">
                {room.roomCode}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyRoomCode}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'COPIED' : 'COPY CODE'}</span>
              </button>

              <button
                onClick={copyInviteLink}
                className="px-3.5 py-2 rounded-xl va-btn-secondary text-xs font-bold text-[#06B6D4] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'LINK COPIED' : 'CALL YOUR SQUAD'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
            <button
              onClick={shareWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/15 border border-emerald-500/30 text-emerald-300 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={shareNative}
              className="px-3 py-1.5 rounded-lg bg-purple-600/15 border border-purple-500/30 text-purple-300 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Invite Friends</span>
            </button>
          </div>
        </div>

        {/* Connected Players List */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span className="font-semibold text-slate-300">
              {room.players.length >= room.minPlayers ? 'SQUAD ASSEMBLED' : 'Squad Loading... 👀'} ({room.players.length}/{room.maxPlayers})
            </span>
            <span className={room.players.length >= room.minPlayers ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {room.players.length >= room.minPlayers ? '✅ MATCH READY' : '⏳ WAITING FOR SQUAD'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {room.players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  player.isBot
                    ? 'bg-purple-950/20 border-purple-500/30'
                    : 'bg-[#080A12]/90 border-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="text-2xl">{player.avatar}</span>
                    {player.isBot && (
                      <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-purple-600 text-[10px] text-white">
                        <Bot className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-display flex items-center gap-1.5">
                      <span>{player.username}</span>
                      {player.isHost && (
                        <span className="px-1.5 py-0.5 rounded bg-[#D946EF]/20 text-[#F472B6] text-[9px] font-mono font-bold">
                          HOST
                        </span>
                      )}
                      {player.isBot && (
                        <span className="px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 text-[9px] font-mono uppercase">
                          AI • {player.botDifficulty || 'MED'}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400">
                      {player.isBot ? '🤖 Smart Bot Ready' : '● Ready in Squad'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-[11px] font-mono px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    READY
                  </div>

                  {isHost && (player.isBot || player.id !== (currentPlayer?.id || user.id)) && (
                    <button
                      onClick={() => removePlayerOrBot(player.id)}
                      title={player.isBot ? 'Remove Bot' : 'Kick Player'}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, room.maxPlayers - room.players.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border-2 border-dashed border-white/[0.08] bg-[#080A12]/40 gap-3"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span className="animate-pulse">⏳</span>
                  <span>Empty Seat #{room.players.length + i + 1}</span>
                </div>

                {isHost ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => addBot('easy')}
                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-purple-900/40 border border-gray-700 hover:border-purple-500 text-[10px] font-mono text-purple-300 transition-all flex items-center gap-1"
                    >
                      <Bot className="w-3 h-3" />
                      <span>+ Bot (Easy)</span>
                    </button>
                    <button
                      onClick={() => addBot('medium')}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-[10px] font-mono text-purple-200 font-bold transition-all flex items-center gap-1"
                    >
                      <Bot className="w-3 h-3" />
                      <span>+ Bot (Med)</span>
                    </button>
                    <button
                      onClick={() => addBot('hard')}
                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-red-900/40 border border-gray-700 hover:border-red-500 text-[10px] font-mono text-rose-300 transition-all flex items-center gap-1"
                    >
                      <Cpu className="w-3 h-3" />
                      <span>+ Bot (Hard)</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] font-mono text-slate-500">Waiting for friend to join...</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Action */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
          {isHost ? (
            <div className="space-y-2">
              <button
                onClick={startGame}
                className="w-full py-4 rounded-2xl font-display text-sm font-black flex items-center justify-center gap-2 shadow-2xl transition-all va-btn-primary text-white cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>
                  {room.players.length >= room.minPlayers
                    ? 'LET THE CHAOS BEGIN 🚀'
                    : `LET THE CHAOS BEGIN (AUTO-FILL ${room.minPlayers - room.players.length} BOTS) 🤖`}
                </span>
              </button>
              {room.players.length < room.minPlayers && (
                <p className="text-[11px] font-mono text-center text-slate-400">
                  💡 Empty seats will automatically be filled by Smart Bots!
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#D946EF]/10 border border-[#D946EF]/30 text-center space-y-1">
              <div className="text-xs font-bold text-[#F472B6] font-display">YOU ARE IN THE SQUAD!</div>
              <div className="text-[11px] font-mono text-slate-400">
                Waiting for host ({room.hostUsername}) to launch the match...
              </div>
            </div>
          )}

          <button
            onClick={() => {
              leaveRoom();
              router.push('/multiplayer');
            }}
            className="w-full py-2.5 rounded-xl text-xs font-mono text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            Leave Game Room
          </button>
        </div>
      </div>
    </div>
  );
}
