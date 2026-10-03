'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Swords,
  Copy,
  Check,
  Share2,
  X,
  Play,
  Bot,
  Zap,
  ArrowRight,
  Shield,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '@/types';
import { soundFx } from '@/lib/audio';
import { createRoomOnServer } from '@/lib/multiplayer/realtimeService';
import { normalizeRoomCode } from '@/lib/multiplayer/roomCodeGenerator';
import { AIDifficulty } from '@/types/gameMode';

export interface SingleUnifiedMultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle: string;
  gameThumbnail?: string;
  user: UserProfile;
  defaultMaxPlayers?: number;
}

export const SingleUnifiedMultiplayerModal: React.FC<SingleUnifiedMultiplayerModalProps> = ({
  isOpen,
  onClose,
  gameId,
  gameTitle,
  gameThumbnail,
  user,
  defaultMaxPlayers = 2,
}) => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'quick'>('create');
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings for room
  const [botFillMode, setBotFillMode] = useState<'auto' | 'manual' | 'none'>('auto');
  const [botDifficulty, setBotDifficulty] = useState<AIDifficulty>('medium');

  if (!isOpen) return null;

  // 1-Click Instant Room Creation (Uses current game, host is Player 1, auto-bot fill on)
  const handleCreateRoom = async () => {
    soundFx.playClick();
    setIsCreating(true);
    setErrorMessage(null);

    try {
      const res = await createRoomOnServer(gameId, user, {
        maxPlayers: defaultMaxPlayers,
        botFillMode,
        botDifficulty,
      });

      if (res.success && res.data) {
        soundFx.playLevelUp();
        setCreatedRoomCode(res.data.roomCode);
        // Automatically route to live room lobby in 800ms or let user click Enter
        router.push(`/play/room/${res.data.roomCode}`);
      } else {
        setErrorMessage(res.error || 'Failed to create room. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating multiplayer room.');
    } finally {
      setIsCreating(false);
    }
  };

  // Join Room with Code
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeRoomCode(roomCodeInput);
    if (!clean) return;

    soundFx.playClick();
    onClose();
    router.push(`/play/room/${clean}`);
  };

  // Quick Match
  const handleQuickMatch = async () => {
    soundFx.playClick();
    setIsCreating(true);
    setErrorMessage(null);

    try {
      const res = await createRoomOnServer(gameId, user, {
        maxPlayers: defaultMaxPlayers,
        botFillMode: 'auto',
        botDifficulty: 'medium',
      });

      if (res.success && res.data) {
        soundFx.playLevelUp();
        onClose();
        router.push(`/play/room/${res.data.roomCode}`);
      } else {
        setErrorMessage(res.error || 'Quick match unavailable.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to match.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyCode = (code: string) => {
    soundFx.playCoin();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyLink = (code: string) => {
    soundFx.playCoin();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chill-arena24.vercel.app';
    const link = `${origin}/play/room/${code}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0e1422] to-[#070a12] border-2 border-[#ADFF2F]/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(173,255,47,0.18)] max-h-[90vh] overflow-y-auto">
        {/* Glow corners */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-lime-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ADFF2F] to-[#00F0FF] flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Globe className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-lime-400 font-bold uppercase tracking-wider">
                ONLINE MULTIPLAYER ARENA
              </div>
              <h2 className="text-base sm:text-lg font-black text-white font-display truncate">
                {gameTitle}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="grid grid-cols-3 gap-1.5 my-4 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('create');
            }}
            className={`py-2 rounded-lg text-xs font-bold font-display transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-[#ADFF2F] to-[#00F0FF] text-slate-950 shadow-md font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚔️ CREATE ROOM
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('join');
            }}
            className={`py-2 rounded-lg text-xs font-bold font-display transition-all cursor-pointer ${
              activeTab === 'join'
                ? 'bg-gradient-to-r from-[#ADFF2F] to-[#00F0FF] text-slate-950 shadow-md font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🔑 JOIN #CODE
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('quick');
            }}
            className={`py-2 rounded-lg text-xs font-bold font-display transition-all cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-gradient-to-r from-[#ADFF2F] to-[#00F0FF] text-slate-950 shadow-md font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚡ QUICK DUEL
          </button>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: 1-CLICK CREATE ROOM */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">HOST:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>{user.avatar || '👑'}</span>
                  <span>{user.displayName || user.username || 'You'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">MATCH CAPACITY:</span>
                <span className="text-[#ADFF2F] font-bold">{defaultMaxPlayers} PLAYERS</span>
              </div>

              {/* Bot Auto-Fill Settings */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-gray-300 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Auto-Fill Bots:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setBotFillMode((prev) => (prev === 'auto' ? 'none' : 'auto'))}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    botFillMode === 'auto'
                      ? 'bg-lime-500/20 text-lime-300 border border-lime-500/40'
                      : 'bg-slate-800 text-gray-400'
                  }`}
                >
                  {botFillMode === 'auto' ? 'ON (RECOMMENDED)' : 'HUMANS ONLY'}
                </button>
              </div>

              {botFillMode === 'auto' && (
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-400">Bot Difficulty:</span>
                  <div className="flex gap-1">
                    {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setBotDifficulty(d)}
                        className={`px-2 py-0.5 rounded capitalize text-[10px] font-bold ${
                          botDifficulty === d
                            ? 'bg-lime-400 text-slate-950'
                            : 'bg-slate-950 text-gray-400 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Created Room Preview if ready */}
            {createdRoomCode ? (
              <div className="p-4 rounded-2xl bg-lime-950/30 border border-lime-500/40 space-y-3 text-center">
                <div className="text-[10px] font-mono text-lime-400">ROOM CREATED SUCCESSFULLY!</div>
                <div className="text-3xl font-black font-mono tracking-widest text-[#ADFF2F]">
                  #{createdRoomCode}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyCode(createdRoomCode)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'COPIED' : 'COPY CODE'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyLink(createdRoomCode)}
                    className="px-3 py-1.5 rounded-lg bg-lime-500/20 border border-lime-500/40 text-xs text-lime-300 font-mono flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'LINK COPIED' : 'COPY LINK'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(`/play/room/${createdRoomCode}`);
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#ADFF2F] hover:bg-[#b8ff47] text-slate-950 font-black text-xs font-display uppercase tracking-wider shadow-xl"
                >
                  ENTER LIVE LOBBY NOW 🚀
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ADFF2F] via-emerald-400 to-[#00F0FF] hover:from-lime-400 hover:to-cyan-300 text-slate-950 font-black text-sm font-display uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(173,255,47,0.3)] active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{isCreating ? 'CREATING ROOM...' : 'CREATE ROOM & LAUNCH LOBBY 🚀'}</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 2: JOIN WITH CODE */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <label className="text-[11px] font-mono text-gray-400">
                ENTER 6-CHARACTER ROOM CODE (e.g. 8K2M9P)
              </label>
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="8K2M9P"
                maxLength={8}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-center text-2xl font-mono font-black text-[#00F0FF] placeholder-gray-700 uppercase tracking-widest focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!roomCodeInput.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-sm font-display uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,240,255,0.3)] active:scale-98 transition-all cursor-pointer disabled:opacity-40"
            >
              <span>CONNECT & JOIN SQUAD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: QUICK MATCH */}
        {activeTab === 'quick' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl animate-bounce">
              ⚡
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-display">INSTANT 1-CLICK MATCHMAKING</h3>
              <p className="text-[11px] text-gray-400 font-sans mt-1">
                Creates an immediate squad room for {gameTitle} with Smart Bot auto-fill enabled.
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickMatch}
              disabled={isCreating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-lime-400 text-slate-950 font-black text-xs font-display uppercase tracking-wider shadow-lg active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isCreating ? 'SEARCHING / CREATING...' : 'LAUNCH INSTANT ARENA ⚡'}
            </button>
          </div>
        )}

        {/* Notice */}
        <div className="mt-4 text-[10px] font-mono text-gray-500 text-center">
          🔒 Real-time server sync. Empty seats auto-filled by Smart Bots according to game rules.
        </div>
      </div>
    </div>
  );
};
