'use client';

import React, { useState } from 'react';
import {
  Bot,
  Users,
  Globe,
  Swords,
  Sparkles,
  Check,
  ArrowRight,
  Shield,
  Zap,
  X,
  Plus,
  Trash2,
  UserCheck,
  Cpu
} from 'lucide-react';
import {
  GameModeType,
  AIDifficulty,
  PlayerSetup,
  DEFAULT_AVATARS,
  BOT_NAME_PRESETS,
  GameModeSelection
} from '@/types/gameMode';
import { soundFx } from '@/lib/audio';
import { UserProfile } from '@/types';
import { useRouter } from 'next/navigation';
import { createRoomOnServer } from '@/lib/multiplayer/realtimeService';

export interface UniversalGameModeSelectorProps {
  gameTitle: string;
  gameId: string;
  user: UserProfile;
  isOpen: boolean;
  onClose?: () => void;
  onSelectMode: (selection: GameModeSelection) => void;
  supportsPassAndPlay?: boolean;
  supportsAI?: boolean;
  supportsOnline?: boolean;
  maxPassAndPlayPlayers?: number;
}

export const UniversalGameModeSelector: React.FC<UniversalGameModeSelectorProps> = ({
  gameTitle,
  gameId,
  user,
  isOpen,
  onClose,
  onSelectMode,
  supportsPassAndPlay = true,
  supportsAI = true,
  supportsOnline = true,
  maxPassAndPlayPlayers = 4,
}) => {
  const [selectedTab, setSelectedTab] = useState<GameModeType>('ai');

  // VS AI Setup
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [userName, setUserName] = useState(user.displayName || user.username || 'You');
  const [userAvatar, setUserAvatar] = useState(user.avatar || '🚀');

  // Pass & Play dynamic player slots (Humans + Bots)
  const [passPlayers, setPassPlayers] = useState<PlayerSetup[]>([
    {
      id: user.id || 'p1',
      name: user.displayName || user.username || 'Player 1',
      avatar: user.avatar || '🚀',
      isAI: false,
    },
    {
      id: 'p2',
      name: 'Player 2',
      avatar: '⚡',
      isAI: false,
    },
  ]);

  // Online Multiplayer Setup with Smart Bot Auto-Fill
  const router = useRouter();
  const [isCreatingOnline, setIsCreatingOnline] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [onlineCapacity, setOnlineCapacity] = useState<number>(2);
  const [botFillMode, setBotFillMode] = useState<'auto' | 'manual' | 'none'>('auto');
  const [onlineBotDifficulty, setOnlineBotDifficulty] = useState<AIDifficulty>('medium');

  if (!isOpen) return null;

  // Add a player slot in Pass & Play
  const handleAddPassPlayer = () => {
    if (passPlayers.length >= maxPassAndPlayPlayers) return;
    soundFx.playClick();
    const nextIdx = passPlayers.length + 1;
    const isBotByDefault = passPlayers.length >= 2;
    const botPreset = BOT_NAME_PRESETS[(nextIdx - 1) % BOT_NAME_PRESETS.length];

    setPassPlayers((prev) => [
      ...prev,
      {
        id: `p_${Date.now()}_${nextIdx}`,
        name: isBotByDefault ? botPreset.name : `Player ${nextIdx}`,
        avatar: isBotByDefault ? botPreset.avatar : DEFAULT_AVATARS[nextIdx % DEFAULT_AVATARS.length],
        isAI: isBotByDefault,
        aiDifficulty: isBotByDefault ? 'medium' : undefined,
      },
    ]);
  };

  // Remove player slot
  const handleRemovePassPlayer = (idx: number) => {
    if (passPlayers.length <= 2) return;
    soundFx.playClick();
    setPassPlayers((prev) => prev.filter((_, i) => i !== idx));
  };

  // Toggle Human vs Bot for slot
  const handleTogglePassPlayerType = (idx: number) => {
    soundFx.playClick();
    setPassPlayers((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;
        const newIsAI = !p.isAI;
        const botPreset = BOT_NAME_PRESETS[idx % BOT_NAME_PRESETS.length];
        return {
          ...p,
          isAI: newIsAI,
          name: newIsAI ? botPreset.name : `Player ${idx + 1}`,
          avatar: newIsAI ? botPreset.avatar : DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length],
          aiDifficulty: newIsAI ? 'medium' : undefined,
        };
      })
    );
  };

  // Update player property
  const handleUpdatePassPlayer = (idx: number, updates: Partial<PlayerSetup>) => {
    setPassPlayers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, ...updates } : p))
    );
  };

  // Start VS AI
  const handleStartAI = () => {
    soundFx.playClick();
    const players: PlayerSetup[] = [
      {
        id: user.id || 'p1',
        name: userName.trim() || 'You',
        avatar: userAvatar,
        isAI: false,
      },
      {
        id: 'ai-opponent',
        name: `AI Bot (${aiDifficulty.toUpperCase()})`,
        avatar: '🤖',
        isAI: true,
        aiDifficulty,
      },
    ];

    onSelectMode({
      mode: 'ai',
      difficulty: aiDifficulty,
      players,
    });
  };

  // Start Pass & Play
  const handleStartPassAndPlay = () => {
    soundFx.playClick();
    onSelectMode({
      mode: 'pass-and-play',
      difficulty: 'medium',
      players: passPlayers,
    });
  };

  // Start Online (Host) - Direct 1-Click Room Creation (NO SECOND POPUP)
  const handleStartOnlineCreate = async () => {
    soundFx.playClick();
    setIsCreatingOnline(true);
    try {
      const res = await createRoomOnServer(gameId, user, {
        maxPlayers: onlineCapacity,
        botFillMode,
        botDifficulty: onlineBotDifficulty,
      });

      if (res.success && res.data?.roomCode) {
        onClose?.();
        router.push(`/play/room/${res.data.roomCode}`);
        return;
      }
    } catch (err) {
      console.error('[UniversalGameModeSelector] Failed to create room on server:', err);
    } finally {
      setIsCreatingOnline(false);
    }

    // Fallback: Notify parent if direct creation fails
    const players: PlayerSetup[] = [
      {
        id: user.id || 'p1',
        name: user.displayName || user.username || 'Host',
        avatar: user.avatar || '🚀',
        isAI: false,
      },
    ];

    onSelectMode({
      mode: 'online',
      difficulty: onlineBotDifficulty,
      players,
      isOnlineHost: true,
      botFillMode,
    });
    onClose?.();
  };

  // Start Online (Join) - Direct 1-Click Join (NO SECOND POPUP)
  const handleStartOnlineJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    soundFx.playClick();

    // Extract clean code whether user pasted raw code or full share URL
    let cleanCode = roomCodeInput.trim().toUpperCase().replace('#', '');
    if (cleanCode.includes('/ROOM/')) {
      cleanCode = cleanCode.split('/ROOM/').pop()?.split('?')[0]?.trim() || cleanCode;
    } else if (cleanCode.includes('/PLAY/ROOM/')) {
      cleanCode = cleanCode.split('/PLAY/ROOM/').pop()?.split('?')[0]?.trim() || cleanCode;
    }

    onClose?.();
    router.push(`/play/room/${cleanCode}`);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e1422] to-[#070a12] border border-cyan-500/30 rounded-3xl p-5 sm:p-8 shadow-[0_0_60px_rgba(0,240,255,0.15)] my-auto max-h-[92vh] overflow-y-auto">
        {/* Glow corner decorations */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Universal Game Modes</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-wide">
              {gameTitle}
            </h2>
          </div>

          {onClose && (
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-gray-400 hover:text-white transition-colors"
              title="Close Mode Selector"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mode Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 my-5">
          {/* TAB 1: VS AI */}
          {supportsAI && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSelectedTab('ai');
              }}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                selectedTab === 'ai'
                  ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900/90 border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                  : 'bg-slate-900/60 border-slate-800/80 text-gray-400 hover:border-slate-700 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg ${
                    selectedTab === 'ai' ? 'bg-cyan-500/20 text-[#00F0FF]' : 'bg-slate-800 text-gray-400'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold font-display text-white">VS AI</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1 font-sans">
                Player vs Bot (You move first)
              </p>
            </button>
          )}

          {/* TAB 2: PASS & PLAY */}
          {supportsPassAndPlay && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSelectedTab('pass-and-play');
              }}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                selectedTab === 'pass-and-play'
                  ? 'bg-gradient-to-br from-purple-950/80 to-slate-900/90 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                  : 'bg-slate-900/60 border-slate-800/80 text-gray-400 hover:border-slate-700 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg ${
                    selectedTab === 'pass-and-play'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-slate-800 text-gray-400'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold font-display text-white">Pass & Play</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1 font-sans">
                Humans + Smart Bot Fill
              </p>
            </button>
          )}

          {/* TAB 3: ONLINE MULTIPLAYER */}
          {supportsOnline && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setSelectedTab('online');
              }}
              className={`p-3 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                selectedTab === 'online'
                  ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900/90 border-[#ADFF2F] shadow-[0_0_20px_rgba(173,255,47,0.25)]'
                  : 'bg-slate-900/60 border-slate-800/80 text-gray-400 hover:border-slate-700 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg ${
                    selectedTab === 'online' ? 'bg-lime-500/20 text-[#ADFF2F]' : 'bg-slate-800 text-gray-400'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold font-display text-white">Online PvP</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1 font-sans">
                Real-Time Room Sync + Auto-Bots
              </p>
            </button>
          )}
        </div>

        {/* TAB 1: VS AI */}
        {selectedTab === 'ai' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* User Profile Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Your Player Profile</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                  ⚡ Human moves first by default
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="text-3xl p-2 bg-slate-950 rounded-2xl border border-cyan-500/40 inline-block shadow-md">
                    {userAvatar}
                  </span>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    maxLength={16}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                  />
                </div>
              </div>

              {/* Quick Avatar selection */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {DEFAULT_AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setUserAvatar(av);
                    }}
                    className={`text-lg p-1.5 rounded-xl transition-all ${
                      userAvatar === av ? 'bg-cyan-500/30 border border-cyan-400 scale-110' : 'hover:bg-slate-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Difficulty Selector */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Select AI Opponent Difficulty</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Easy */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setAiDifficulty('easy');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    aiDifficulty === 'easy'
                      ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:text-gray-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-display text-emerald-400">EASY BOT</span>
                    {aiDifficulty === 'easy' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-gray-400 font-sans">
                    Casual decision making. Makes occasional mistakes for relaxed play.
                  </p>
                </button>

                {/* Medium */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setAiDifficulty('medium');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    aiDifficulty === 'medium'
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:text-gray-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-display text-cyan-400">MEDIUM BOT</span>
                    {aiDifficulty === 'medium' && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-gray-400 font-sans">
                    Balanced strategy. Blocks dangerous moves and seizes opportunities.
                  </p>
                </button>

                {/* Hard */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setAiDifficulty('hard');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    aiDifficulty === 'hard'
                      ? 'bg-rose-500/15 border-rose-400 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:text-gray-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-display text-rose-400">HARD BOT</span>
                    {aiDifficulty === 'hard' && <Check className="w-4 h-4 text-rose-400" />}
                  </div>
                  <p className="text-[11px] text-gray-400 font-sans">
                    Ruthless AI engine. Game-specific heuristics and deep calculations.
                  </p>
                </button>
              </div>
            </div>

            <button
              onClick={handleStartAI}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm font-display uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,240,255,0.4)] active:scale-98 transition-all cursor-pointer"
            >
              <span>START VS AI MATCH</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 2: PASS & PLAY (HUMANS + BOTS) */}
        {selectedTab === 'pass-and-play' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>Manage Players & Bot Slots</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 font-sans">
                    {passPlayers.filter((p) => !p.isAI).length} Human(s), {passPlayers.filter((p) => p.isAI).length} Bot(s) ({passPlayers.length} total)
                  </p>
                </div>

                {passPlayers.length < maxPassAndPlayPlayers && (
                  <button
                    type="button"
                    onClick={handleAddPassPlayer}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold font-display flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Seat</span>
                  </button>
                )}
              </div>

              {/* Player Slots List */}
              <div className="space-y-2.5 max-h-[44vh] overflow-y-auto pr-1">
                {passPlayers.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      player.isAI
                        ? 'bg-slate-950/80 border-cyan-500/30'
                        : 'bg-slate-950/80 border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-gray-400">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTogglePassPlayerType(idx)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border transition-all cursor-pointer ${
                            player.isAI
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          }`}
                          title="Click to toggle Human / AI Bot"
                        >
                          {player.isAI ? <Cpu className="w-3 h-3 text-cyan-400" /> : <UserCheck className="w-3 h-3 text-purple-400" />}
                          <span>{player.isAI ? 'AI BOT' : 'HUMAN'}</span>
                        </button>
                      </div>

                      {/* Difficulty Selector for Bot */}
                      {player.isAI && (
                        <div className="flex items-center gap-1 text-[10px] font-mono">
                          {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => handleUpdatePassPlayer(idx, { aiDifficulty: d })}
                              className={`px-1.5 py-0.5 rounded capitalize ${
                                player.aiDifficulty === d
                                  ? 'bg-cyan-500 text-slate-950 font-bold'
                                  : 'bg-slate-900 text-gray-400 hover:text-white'
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Remove Button (if > 2 players) */}
                      {passPlayers.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePassPlayer(idx)}
                          className="p-1 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                          title="Remove player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 bg-slate-900 rounded-xl border border-slate-800">
                        {player.avatar}
                      </span>
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => handleUpdatePassPlayer(idx, { name: e.target.value })}
                        maxLength={14}
                        placeholder={player.isAI ? 'Bot Name' : 'Player Name'}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400 font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pass & Play Notice */}
              <div className="text-[11px] font-mono text-purple-300/80 bg-purple-950/30 border border-purple-800/40 p-2.5 rounded-xl">
                📱 Players alternate turns locally on this device. Automated bots make moves on their turns automatically without blocking UI.
              </div>
            </div>

            <button
              onClick={handleStartPassAndPlay}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-sm font-display uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-98 transition-all cursor-pointer"
            >
              <span>START PASS & PLAY MATCH ({passPlayers.length} PLAYERS)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 3: ONLINE MULTIPLAYER (HUMANS + BOTS) */}
        {selectedTab === 'online' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
              <h3 className="text-xs font-mono font-bold text-lime-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-lime-400" />
                <span>Host or Join Multiplayer Room</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Host a Room */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-lime-500/30 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-white font-display flex items-center gap-1.5">
                      <Swords className="w-4 h-4 text-[#ADFF2F]" />
                      <span>Create Room</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 font-sans">
                      Get a unique 6-digit room code with automatic bot backfill options.
                    </p>
                  </div>

                  {/* Smart Bot Auto-Fill Settings */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-[11px]">Smart Bot Auto-Fill:</span>
                      <button
                        type="button"
                        onClick={() => setBotFillMode((prev) => (prev === 'auto' ? 'none' : 'auto'))}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          botFillMode === 'auto'
                            ? 'bg-lime-500/20 text-lime-300 border border-lime-500/40'
                            : 'bg-slate-800 text-gray-400'
                        }`}
                      >
                        {botFillMode === 'auto' ? 'AUTO-FILL ON' : 'HUMAN ONLY'}
                      </button>
                    </div>

                    {botFillMode === 'auto' && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">Bot Difficulty:</span>
                        <div className="flex gap-1">
                          {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setOnlineBotDifficulty(d)}
                              className={`px-1.5 py-0.5 rounded capitalize text-[10px] ${
                                onlineBotDifficulty === d
                                  ? 'bg-lime-400 text-slate-950 font-bold'
                                  : 'bg-slate-900 text-gray-400'
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleStartOnlineCreate}
                    disabled={isCreatingOnline}
                    className="w-full py-3 rounded-xl bg-[#ADFF2F] hover:bg-[#b8ff47] active:scale-95 disabled:opacity-50 text-slate-950 font-black text-xs font-display uppercase tracking-wider shadow-lg shadow-lime-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isCreatingOnline ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>CREATING ROOM...</span>
                      </>
                    ) : (
                      <span>CREATE ROOM (#CODE)</span>
                    )}
                  </button>
                </div>

                {/* Join a Room */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-white font-display flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span>Join with #Code</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 font-sans">
                      Enter the 6-character room code or invite link to join your squad.
                    </p>
                  </div>

                  <form onSubmit={handleStartOnlineJoin} className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. 8K2M9P"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      maxLength={8}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 uppercase tracking-widest text-center"
                    />
                    <button
                      type="submit"
                      disabled={!roomCodeInput.trim()}
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black text-xs font-display uppercase disabled:opacity-30 transition-all cursor-pointer"
                    >
                      JOIN ROOM
                    </button>
                  </form>
                </div>
              </div>

              {/* Online Architecture Info */}
              <div className="text-[11px] font-mono text-lime-300/80 bg-lime-950/30 border border-lime-800/40 p-2.5 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping shrink-0" />
                <span>Authoritative server sync. If friends leave, bots can auto-fill seamlessly.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
