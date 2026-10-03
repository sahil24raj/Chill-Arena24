'use client';

import React, { useState } from 'react';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { X, Users, Copy, Check, Play, Bot, Sparkles, Shield, ArrowRight, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createRoomOnServer } from '@/lib/multiplayer/realtimeService';
import { normalizeRoomCode } from '@/lib/multiplayer/roomCodeGenerator';

export const MultiplayerLobbyModal: React.FC = () => {
  const router = useRouter();
  const {
    activeMultiplayerModal,
    closeMultiplayerModal,
    selectedMultiplayerGame,
    user
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'quick'>('create');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>(
    selectedMultiplayerGame?.id || 'pen-flip'
  );
  const [gameMode, setGameMode] = useState<'local' | 'online' | 'ai'>('online');

  React.useEffect(() => {
    if (selectedMultiplayerGame?.id) {
      setSelectedGameId(selectedMultiplayerGame.id);
    }
  }, [selectedMultiplayerGame]);

  if (!activeMultiplayerModal) return null;

  const handleCreateRoom = async () => {
    soundFx.playClick();

    if (gameMode === 'local' || gameMode === 'ai') {
      soundFx.playLevelUp();
      closeMultiplayerModal();
      router.push(`/game/${selectedGameId}?mode=${gameMode}`);
      return;
    }

    setIsCreating(true);
    try {
      const res = await createRoomOnServer(selectedGameId, user);
      if (res.success && res.data) {
        setCreatedRoomCode(res.data.roomCode);
        soundFx.playLevelUp();
        closeMultiplayerModal();
        router.push(`/play/room/${res.data.roomCode}`);
      } else {
        alert(res.error || 'Failed to create room. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating multiplayer room.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = normalizeRoomCode(roomCodeInput);
    if (!cleanCode) return;
    soundFx.playClick();
    closeMultiplayerModal();
    router.push(`/play/room/${cleanCode}`);
  };

  const handleQuickMatch = async () => {
    soundFx.playClick();
    setIsCreating(true);
    try {
      const res = await createRoomOnServer(selectedGameId, user);
      if (res.success && res.data) {
        closeMultiplayerModal();
        router.push(`/play/room/${res.data.roomCode}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const chosenGame = GAMES_CATALOG.find((g) => g.id === selectedGameId) || GAMES_CATALOG[0];

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
              <p className="text-[11px] text-gray-400 font-sans">Challenge friends with Room Code or Shareable Link</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              closeMultiplayerModal();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-gray-800 text-gray-400 hover:text-white cursor-pointer"
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
              className={`flex-1 py-2 rounded-lg text-xs font-bold font-display transition-all cursor-pointer ${
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
                className="w-full bg-slate-950 border border-gray-800 rounded-xl p-3 text-xs text-white font-bold font-display focus:border-[#00F0FF] focus:outline-none cursor-pointer"
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
                  { id: 'online', label: '🌐 Online Room' },
                  { id: 'local', label: '👥 Pass & Play' },
                  { id: 'ai', label: '🤖 vs Smart AI' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      soundFx.playClick();
                      setGameMode(m.id as any);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold font-display border transition-all cursor-pointer ${
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

            {/* Create Button */}
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-4 rounded-xl cyber-button font-display text-sm font-black text-slate-950 flex items-center justify-center gap-2 shadow-xl shadow-[#00F0FF]/25 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>
                {isCreating
                  ? 'GENERATING ROOM...'
                  : gameMode === 'online'
                  ? 'CREATE & LAUNCH ROOM LOBBY 🚀'
                  : `START ${chosenGame.title.split(':')[0]}`}
              </span>
            </button>
          </div>
        )}

        {/* JOIN ROOM CONTENT */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-gray-400">ENTER 6-CHARACTER ROOM CODE (e.g. X7K92P)</label>
              <input
                type="text"
                placeholder="X7K92P"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-gray-800 rounded-xl p-4 text-center text-2xl font-mono font-black text-[#00F0FF] placeholder-gray-700 tracking-widest uppercase focus:border-[#00F0FF] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!roomCodeInput.trim()}
              className="w-full py-4 rounded-xl cyber-button font-display text-sm font-black text-slate-950 flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <span>ENTER ROOM & JOIN OPPONENT</span>
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
              <h3 className="text-base font-black text-white font-display">INSTANT ONLINE MATCHMAKING</h3>
              <p className="text-xs text-gray-400 mt-1">
                Creating room and opening lobby for {chosenGame.title.split(':')[0]}...
              </p>
            </div>
            <button
              onClick={handleQuickMatch}
              disabled={isCreating}
              className="cyber-button px-8 py-3 rounded-xl font-display text-xs font-black text-slate-950 shadow-lg cursor-pointer"
            >
              {isCreating ? 'CONNECTING...' : 'LAUNCH INSTANT ROOM'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
