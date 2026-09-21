'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  X,
  Sparkles,
  LogIn,
  UserCheck,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Zap,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export const AuthModal = () => {
  const {
    activeAuthModal,
    closeAuthModal,
    setUser,
    loginWithGoogle,
    loginAnonymously,
    loginWithDemo
  } = useAppStore();

  const [usernameInput, setUsernameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'google' | 'anon' | null>(null);
  const [authError, setAuthError] = useState<{ message: string; code?: string } | null>(null);

  if (!activeAuthModal) return null;

  const avatars = ['🚀', '🗿', '🔥', '☕', '🏏', '🚪', '🕶️', '👑', '😎', '🤖'];

  const handleGoogleLogin = async () => {
    soundFx.playClick();
    setIsLoading(true);
    setLoadingType('google');
    setAuthError(null);

    try {
      const res = await loginWithGoogle({
        username: usernameInput.trim() || undefined,
        avatar: selectedAvatar
      });

      if (!res.success) {
        setAuthError({
          message: res.error || 'Failed to authenticate with Google',
          code: res.code
        });
      }
    } catch (err: any) {
      setAuthError({
        message: err?.message || 'Authentication error occurred',
        code: err?.code
      });
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleAnonymousLogin = async () => {
    soundFx.playClick();
    setIsLoading(true);
    setLoadingType('anon');
    setAuthError(null);

    try {
      const res = await loginAnonymously({
        username: usernameInput.trim() || `CloudGuest_${Math.floor(1000 + Math.random() * 9000)}`,
        avatar: selectedAvatar
      });

      if (!res.success) {
        setAuthError({
          message: res.error || 'Failed to connect anonymously',
          code: res.code
        });
      }
    } catch (err: any) {
      setAuthError({
        message: err?.message || 'Anonymous connection error',
        code: err?.code
      });
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleInstantDemoLogin = () => {
    soundFx.playLevelUp();
    loginWithDemo({
      username: usernameInput.trim() || undefined,
      avatar: selectedAvatar
    }, 'google');
    closeAuthModal();
  };

  const handleOtherLogin = (provider: 'discord' | 'guest') => {
    soundFx.playLevelUp();
    const finalUsername = usernameInput.trim() || (provider === 'guest' ? `Guest_${Math.floor(1000 + Math.random() * 9000)}` : `${provider.toUpperCase()}_MemeKing`);
    setUser({
      username: finalUsername,
      avatar: selectedAvatar,
      authType: provider,
      isCloudSynced: provider !== 'guest'
    });
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-[#00F0FF]/40 shadow-2xl shadow-cyan-950/60 bg-[#0c1017]">
        <button
          onClick={() => {
            soundFx.playClick();
            closeAuthModal();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-xl bg-slate-900/80 border border-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00F0FF] via-purple-500 to-[#ADFF2F] p-0.5 mb-3 shadow-lg shadow-[#00F0FF]/30">
            <div className="w-full h-full bg-[#080b10] rounded-[14px] flex items-center justify-center text-3xl">
              {selectedAvatar}
            </div>
          </div>
          <h3 className="text-xl font-black text-white tracking-wide font-display">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F]">MemeVerse</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1 font-sans">
            Sync high scores, unlock global leaderboards, earn Meme Coins & Gigachad badges!
          </p>

          <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono">
            <ShieldCheck className="w-3 h-3" />
            <span>Firebase Cloud Sync Ready</span>
          </div>
        </div>

        {/* Error notification with actionable instructions & 1-click fallback */}
        {authError && (
          <div className="mb-4 p-3 rounded-2xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-red-300">Authentication Notice:</span>
                <p className="text-[11px] text-red-200/90 leading-relaxed">{authError.message}</p>
              </div>
            </div>

            {/* Instant Fallback Button if configuration issue */}
            <button
              onClick={handleInstantDemoLogin}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Continue with Instant Verified Cloud Session</span>
            </button>
          </div>
        )}

        {/* Avatar Selection */}
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2 font-mono">
            Select Your Gaming Avatar
          </label>
          <div className="flex flex-wrap gap-2 justify-center bg-slate-950/80 p-2.5 rounded-2xl border border-gray-800">
            {avatars.map((av) => (
              <button
                key={av}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedAvatar(av);
                }}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                  selectedAvatar === av
                    ? 'bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F] text-slate-950 font-bold scale-110 shadow-lg shadow-[#00F0FF]/30 border-2 border-white'
                    : 'bg-slate-900 text-gray-400 hover:scale-105 border border-gray-800'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Username input */}
        <div className="mb-5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1 font-mono">
            Custom Gamer Handle (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Sigma_Gamer69"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="w-full bg-slate-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF] transition-colors font-sans"
          />
        </div>

        {/* Provider buttons */}
        <div className="space-y-2.5">
          {/* Google Sign-in Button */}
          <button
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-blue-600 hover:brightness-110 border border-white/20 text-xs font-black text-white flex items-center justify-center gap-2.5 shadow-lg shadow-red-950/40 transition-transform hover:scale-[1.02] disabled:opacity-50 font-display"
          >
            {isLoading && loadingType === 'google' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>CONNECTING GOOGLE ACCOUNT...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>SIGN IN WITH GOOGLE</span>
              </>
            )}
          </button>

          {/* Quick Anonymous Cloud Play Button */}
          <button
            disabled={isLoading}
            onClick={handleAnonymousLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-xs font-bold text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] disabled:opacity-50 font-display shadow-md shadow-emerald-950/40"
          >
            {isLoading && loadingType === 'anon' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>CONNECTING CLOUD SESSION...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#ADFF2F]" />
                <span>QUICK CLOUD PLAY (1-CLICK)</span>
              </>
            )}
          </button>

          {/* Guest Button */}
          <button
            disabled={isLoading}
            onClick={() => handleOtherLogin('guest')}
            className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-gray-800 text-xs font-bold text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-colors font-display"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#00F0FF]" /> Play Locally as Guest
          </button>
        </div>

        {!isFirebaseConfigured() && (
          <p className="text-[10px] text-gray-500 text-center mt-3 font-mono">
            💡 Tip: Add your Firebase API keys in <code className="text-[#00F0FF]">.env.local</code> for live cloud database.
          </p>
        )}
      </div>
    </div>
  );
};

