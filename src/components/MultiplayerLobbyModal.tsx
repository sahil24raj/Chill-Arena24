'use client';

import React, { useState } from 'react';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { X, Users, Copy, Check, Play, Bot, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const MultiplayerLobbyModal: React.FC = () => {
  const router = useRouter();
  const {
    activeMultiplayerModal,
    closeMultiplayerModal,
    selectedMultiplayerGame,
    user,
    createRoom,
    joinRoom,
    activeRoom
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'quick'>('create');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>(
    selectedMultiplayerGame?.id || 'pen-flip'
  );
  const [gameMode, setGameMode] = useState<'local' | 'online' | 'ai'>('local');

  if (!activeMultiplayerModal) return null;

  const handleCreateRoom = () => {
    soundFx.playClick();
    const room = createRoom(selectedGameId, gameMode);
  };

  const handleCopyLink = () => {
    soundFx.playCoin();
    const code = activeRoom ? activeRoom.code : '#A82KD';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/game/${selectedGameId}?room=${code.replace('#', '')}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartMatch = () => {
    soundFx.playLevelUp();
    closeMultiplayerModal();
    router.push(`/game/${selectedGameId}`);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    soundFx.playClick();
    joinRoom(roomCodeInput);
    handleStartMatch();
  };

  const chosenGame = GAMES_CATALOG.find((g) => g.id === selectedGameId) || GAMES_CATALOG[6];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl overflow-hidden glass-panel border-2 border-[#00F0FF]/40 bg-[#0c1017] p-6 lg:p-8 space-y-6 shadow-2xl">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] flex items-center justify-center text-slate-950 font-black text-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-display">MULTIPLAYER ARENA LOBBY</h2>
              <p className="text-[11px] text-gray-400 font-sans">Challenge friends with Room Code or Pass & Play</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              closeMultiplayerModal();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-gray-800 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 rounded-xl bg-slate-950 border border-gray-800">
          {[
            { id: 'create', label: '⚔️ CREATE ROOM' },
            { id: 'join', label: '🔑 JOIN WITH CODE' },
            { id: 'quick', label: '⚡ QUICK MATCH' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(t.id as any);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold font-display transition-all ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F] text-slate-950 shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* CREATE ROOM CONTENT */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            {/* Game Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400">SELECT GAME TO DUEL</label>
              <select
                value={selectedGameId}
                onChange={(e) => {
                  soundFx.playClick();
                  setSelectedGameId(e.target.value);
                }}
                className="w-full bg-slate-950 border border-gray-800 rounded-xl p-3 text-xs text-white font-bold font-display focus:border-[#00F0FF] focus:outline-none"
              >
                {GAMES_CATALOG.filter((g) => g.multiplayer).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.thumbnail} {g.title} ({g.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400">PLAY MODE</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'local', label: '👥 Pass & Play' },
                  { id: 'online', label: '🌐 Online Room' },
                  { id: 'ai', label: '🤖 vs Smart AI' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      soundFx.playClick();
                      setGameMode(m.id as any);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold font-display border transition-all ${
                      gameMode === m.id
                        ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                        : 'bg-slate-950 border-gray-800 text-gray-400'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Room Slot HUD */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-gray-400">ROOM CODE:</span>
                <span className="text-lg font-black text-[#ADFF2F] font-mono">
                  {activeRoom ? activeRoom.code : '#A82KD'}
                </span>
              </div>

              {/* Player 1 & Player 2 Slot Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-[#00F0FF]/30 flex items-center gap-2">
                  <span className="text-xl">{user.avatar}</span>
                  <div>
                    <span className="text-xs font-bold text-white block truncate">{user.username}</span>
                    <span className="text-[9px] text-[#ADFF2F] font-mono font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F]" /> HOST (READY)
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-dashed border-gray-800 flex items-center gap-2">
                  <span className="text-xl">{gameMode === 'ai' ? '🤖' : gameMode === 'local' ? '🕹️' : '⚪'}</span>
                  <div>
                    <span className="text-xs font-bold text-gray-300 block truncate">
                      {gameMode === 'ai' ? 'Bot_Chad' : gameMode === 'local' ? 'Player 2 (Local)' : 'Waiting...'}
                    </span>
                    <span className="text-[9px] text-pink-400 font-mono font-bold">
                      {gameMode === 'online' ? 'Invite friend link' : 'READY TO PLAY'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Copy Invite Link */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-gray-800 hover:border-[#00F0FF] text-xs font-bold text-gray-300 hover:text-white flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-[#ADFF2F]" /> : <Copy className="w-4 h-4 text-[#00F0FF]" />}
                  <span>{copied ? 'LINK COPIED!' : 'COPY INVITE LINK'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleStartMatch}
              className="w-full py-4 rounded-xl cyber-button font-display text-sm font-black text-slate-950 flex items-center justify-center gap-2 shadow-xl shadow-[#00F0FF]/25"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>START MATCH: {chosenGame.title.split(':')[0]}</span>
            </button>
          </div>
        )}

        {/* JOIN ROOM CONTENT */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-gray-400">ENTER 5-DIGIT ROOM CODE</label>
              <input
                type="text"
                placeholder="#A82KD"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-gray-800 rounded-xl p-4 text-center text-2xl font-mono font-black text-[#00F0FF] placeholder-gray-700 tracking-widest uppercase focus:border-[#00F0FF] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!roomCodeInput.trim()}
              className="w-full py-4 rounded-xl cyber-button font-display text-sm font-black text-slate-950 flex items-center justify-center gap-2 shadow-xl"
            >
              <span>ENTER ROOM & START PLAYING</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* QUICK MATCH CONTENT */}
        {activeTab === 'quick' && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-gray-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 mx-auto flex items-center justify-center text-2xl animate-spin">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-black text-white font-display">INSTANT RANDOM MATCHMAKING</h3>
              <p className="text-xs text-gray-400 mt-1">
                Finding an online player for {chosenGame.title.split(':')[0]}...
              </p>
            </div>
            <button
              onClick={handleStartMatch}
              className="cyber-button px-8 py-3 rounded-xl font-display text-xs font-black text-slate-950 shadow-lg"
            >
              LAUNCH INSTANT MATCH
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
