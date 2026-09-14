'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { X, Sparkles, LogIn, UserCheck } from 'lucide-react';

export const AuthModal = () => {
  const { activeAuthModal, closeAuthModal, setUser } = useAppStore();
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');

  if (!activeAuthModal) return null;

  const avatars = ['🚀', '🗿', '🔥', '☕', '🏏', '🚪', '🕶️', '👑', '😎', '🤖'];

  const handleLogin = (provider: 'google' | 'discord' | 'guest') => {
    soundFx.playLevelUp();
    const finalUsername = usernameInput.trim() || (provider === 'guest' ? `Guest_${Math.floor(1000 + Math.random() * 9000)}` : `${provider.toUpperCase()}_MemeKing`);
    setUser({
      username: finalUsername,
      avatar: selectedAvatar,
      authType: provider
    });
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel p-6 rounded-2xl border-purple-500/40 shadow-2xl shadow-purple-900/50">
        <button
          onClick={() => {
            soundFx.playClick();
            closeAuthModal();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-slate-900/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 p-0.5 mb-3 shadow-lg shadow-purple-500/40">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
              🚀
            </div>
          </div>
          <h3 className="text-xl font-black text-white tracking-wide">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-300">MemeVerse</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Unlock global leaderboards, save high scores, collect coins, & earn Gigachad badges!
          </p>
        </div>

        {/* Avatar Selection */}
        <div className="mb-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block mb-2">
            Select Your Gaming Avatar
          </label>
          <div className="flex flex-wrap gap-2 justify-center bg-slate-950/60 p-2.5 rounded-xl border border-purple-900/40">
            {avatars.map((av) => (
              <button
                key={av}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedAvatar(av);
                }}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                  selectedAvatar === av
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-cyan-400 scale-110 shadow-md shadow-pink-500/40'
                    : 'bg-slate-900/80 text-gray-400 hover:scale-105'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Username input */}
        <div className="mb-5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
            Choose Gamer Handle
          </label>
          <input
            type="text"
            placeholder="e.g. Sigma_Gamer69"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="w-full bg-slate-950 border border-purple-800/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Provider buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => handleLogin('google')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <span>🌐</span> Continue with Google
          </button>
          <button
            onClick={() => handleLogin('discord')}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <span>💬</span> Continue with Discord
          </button>
          <button
            onClick={() => handleLogin('guest')}
            className="cyber-button w-full py-2.5 px-4 rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 shadow-lg"
          >
            <UserCheck className="w-4 h-4" /> Instant Guest Play
          </button>
        </div>
      </div>
    </div>
  );
};
