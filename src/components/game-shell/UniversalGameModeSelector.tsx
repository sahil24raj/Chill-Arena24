'use client';

import React, { useState } from 'react';
import { Bot, Users, Globe, Swords, Sparkles, Check, ArrowRight, Shield, Zap, X } from 'lucide-react';
import { GameModeType, AIDifficulty, PlayerSetup, DEFAULT_AVATARS, GameModeSelection } from '@/types/gameMode';
import { soundFx } from '@/lib/audio';
import { UserProfile } from '@/types';

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
  maxPassAndPlayPlayers = 2,
}) => {
  const [selectedTab, setSelectedTab] = useState<GameModeType>('ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');

  // Pass & Play player state
  const [p1Name, setP1Name] = useState(user.displayName || user.username || 'Player 1');
  const [p1Avatar, setP1Avatar] = useState(user.avatar || '🚀');
  const [p2Name, setP2Name] = useState('Player 2');
  const [p2Avatar, setP2Avatar] = useState('⚡');
  const [p3Name, setP3Name] = useState('Player 3');
  const [p3Avatar, setP3Avatar] = useState('👑');
  const [p4Name, setP4Name] = useState('Player 4');
  const [p4Avatar, setP4Avatar] = useState('🥷');

  // Online code state
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  if (!isOpen) return null;

  const handleStartAI = () => {
    soundFx.playClick();
    const players: PlayerSetup[] = [
      {
        id: user.id || 'p1',
        name: user.displayName || user.username || 'You',
        avatar: user.avatar || '🚀',
        isAI: false,
      },
      {
        id: 'ai-opponent',
        name: `AI Bot (${difficulty.toUpperCase()})`,
        avatar: '🤖',
        isAI: true,
      },
    ];

    onSelectMode({
      mode: 'ai',
      difficulty,
      players,
    });
  };

  const handleStartPassAndPlay = () => {
    soundFx.playClick();
    const players: PlayerSetup[] = [
      {
        id: 'p1',
        name: p1Name.trim() || 'Player 1',
        avatar: p1Avatar,
        isAI: false,
      },
      {
        id: 'p2',
        name: p2Name.trim() || 'Player 2',
        avatar: p2Avatar,
        isAI: false,
      },
    ];

    if (maxPassAndPlayPlayers >= 4) {
      players.push(
        { id: 'p3', name: p3Name.trim() || 'Player 3', avatar: p3Avatar, isAI: false },
        { id: 'p4', name: p4Name.trim() || 'Player 4', avatar: p4Avatar, isAI: false }
      );
    }

    onSelectMode({
      mode: 'pass-and-play',
      difficulty: 'medium',
      players,
    });
  };

  const handleStartOnlineCreate = () => {
    soundFx.playClick();
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
      difficulty: 'medium',
      players,
      isOnlineHost: true,
    });
  };

  const handleStartOnlineJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    soundFx.playClick();
    const cleanCode = roomCodeInput.trim().toUpperCase().replace('#', '');
    const players: PlayerSetup[] = [
      {
        id: user.id || 'p2',
        name: user.displayName || user.username || 'Player',
        avatar: user.avatar || '🚀',
        isAI: false,
      },
    ];

    onSelectMode({
      mode: 'online',
      difficulty: 'medium',
      players,
      onlineRoomCode: cleanCode,
      isOnlineHost: false,
    });
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e1422] to-[#070a12] border border-cyan-500/30 rounded-3xl p-5 sm:p-8 shadow-[0_0_60px_rgba(0,240,255,0.15)] my-auto">
        {/* Glow corner decorations */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Select Game Mode</span>
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
        <div className="grid grid-cols-3 gap-2 sm:gap-3 my-6">
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
                Challenge Smart Computer Bot
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
                Local 2+ Players on 1 Screen
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
                Real-Time Room Sync (#Code)
              </p>
            </button>
          )}
        </div>

        {/* TAB 1 CONTENT: VS AI */}
        {selectedTab === 'ai' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Select AI Opponent Difficulty</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Easy */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setDifficulty('easy');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    difficulty === 'easy'
                      ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:text-gray-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-display text-emerald-400">EASY BOT</span>
                    {difficulty === 'easy' && <Check className="w-4 h-4 text-emerald-400" />}
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
                    setDifficulty('medium');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    difficulty === 'medium'
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:text-gray-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-display text-cyan-400">MEDIUM BOT</span>
                    {difficulty === 'medium' && <Check className="w-4 h-4 text-cyan-400" />}
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
                    setDifficulty('hard');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    difficulty === 'hard'
                      ? 'bg-rose-500/15 border-rose-400 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:text-gray-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-display text-rose-400">HARD BOT</span>
                    {difficulty === 'hard' && <Check className="w-4 h-4 text-rose-400" />}
                  </div>
                  <p className="text-[11px] text-gray-400 font-sans">
                    Ruthless AI engine. Deeper calculation, razor-sharp tactical counters.
                  </p>
                </button>
              </div>

              {/* Bot Info Banner */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-gray-300">
                <span className="text-2xl">🤖</span>
                <div>
                  <div className="font-bold text-white font-display">Neural Arena Bot v2.4</div>
                  <div className="text-[11px] text-gray-400">
                    Calculates legal moves in real-time with humanized delay. Zero cheating or hidden data leaks.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartAI}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm font-display uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,240,255,0.4)] active:scale-98 transition-all cursor-pointer"
            >
              <span>START VS AI MATCH</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 2 CONTENT: PASS & PLAY */}
        {selectedTab === 'pass-and-play' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Customize Local Players</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Player 1 Card */}
                <div className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 font-mono">PLAYER 1</span>
                    <span className="text-2xl p-1 bg-purple-900/30 rounded-lg border border-purple-700/50">
                      {p1Avatar}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Name</label>
                    <input
                      type="text"
                      value={p1Name}
                      onChange={(e) => setP1Name(e.target.value)}
                      maxLength={14}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  {/* Quick Avatar Choices */}
                  <div className="flex items-center gap-1 overflow-x-auto py-1">
                    {DEFAULT_AVATARS.slice(0, 6).map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setP1Avatar(av)}
                        className={`text-base p-1 rounded-md transition-all ${
                          p1Avatar === av ? 'bg-purple-600/40 border border-purple-400 scale-110' : 'hover:bg-slate-800'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player 2 Card */}
                <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 font-mono">PLAYER 2</span>
                    <span className="text-2xl p-1 bg-cyan-900/30 rounded-lg border border-cyan-700/50">
                      {p2Avatar}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-mono uppercase block mb-1">Name</label>
                    <input
                      type="text"
                      value={p2Name}
                      onChange={(e) => setP2Name(e.target.value)}
                      maxLength={14}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  {/* Quick Avatar Choices */}
                  <div className="flex items-center gap-1 overflow-x-auto py-1">
                    {DEFAULT_AVATARS.slice(6, 12).map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setP2Avatar(av)}
                        className={`text-base p-1 rounded-md transition-all ${
                          p2Avatar === av ? 'bg-cyan-600/40 border border-cyan-400 scale-110' : 'hover:bg-slate-800'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notice for Pass & Play */}
              <div className="text-[11px] font-mono text-purple-300/80 bg-purple-950/30 border border-purple-800/40 p-2.5 rounded-xl">
                📱 Players alternate turns on this same screen. Turn changes and score trackers update automatically.
              </div>
            </div>

            <button
              onClick={handleStartPassAndPlay}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-sm font-display uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-98 transition-all cursor-pointer"
            >
              <span>START PASS & PLAY MATCH</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 3 CONTENT: ONLINE MULTIPLAYER */}
        {selectedTab === 'online' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-lime-300 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-lime-400" />
                <span>Host or Join Multiplayer Room</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Host a Room */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-lime-500/30 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-white font-display flex items-center gap-1.5">
                      <Swords className="w-4 h-4 text-[#ADFF2F]" />
                      <span>Host New Room</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 font-sans">
                      Generate a private 6-letter room code and duel invitation link to invite friends.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartOnlineCreate}
                    className="w-full py-2.5 rounded-xl bg-[#ADFF2F] hover:bg-[#b8ff47] active:scale-95 text-slate-950 font-black text-xs font-display uppercase tracking-wider shadow-lg shadow-lime-500/20 transition-all cursor-pointer"
                  >
                    CREATE ROOM NOW
                  </button>
                </div>

                {/* Join a Room */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-white font-display flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span>Join with #Code</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 font-sans">
                      Enter the 6-character room code shared by your friend to jump into the lobby.
                    </p>
                  </div>

                  <form onSubmit={handleStartOnlineJoin} className="flex gap-2">
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
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black text-xs font-display disabled:opacity-30 transition-all cursor-pointer shrink-0"
                    >
                      JOIN
                    </button>
                  </form>
                </div>
              </div>

              {/* Online Architecture Info */}
              <div className="text-[11px] font-mono text-lime-300/80 bg-lime-950/30 border border-lime-800/40 p-2.5 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping shrink-0" />
                <span>Authoritative server synchronization with automatic reconnection and atomic state validation.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
