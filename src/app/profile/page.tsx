'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  User,
  Trophy,
  Award,
  Zap,
  Flame,
  Shield,
  Star,
  CheckCircle2,
  Clock,
  LogOut,
  RefreshCw,
  Mail,
  Lock,
  Edit3,
  Save,
  Smile,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Loader2,
  HelpCircle,
  BarChart2,
  Target,
  Crown
} from 'lucide-react';

const AVATAR_SELECTION = ['🚀', '😎', '👑', '🔥', '🗿', '☕', '🕹️', '⚡', '🤖', '🐱', '🍕', '🎯', '🦇', '🏆', '💎', '🦊'];

export default function ProfilePage() {
  const router = useRouter();
  const { user, recentlyPlayedIds, logout, updateProfileData, syncCloudData } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || user.username);
  const [bio, setBio] = useState(user.bio || 'Ready to conquer the Chill Arena leaderboard! 🎮');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '🚀');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const totalScore = Object.values(user.stats.highScores || {}).reduce((a, b) => a + b, 0);
  const bestScore = Math.max(0, ...Object.values(user.stats.highScores || {}));
  const totalLosses = user.stats.totalLosses || Math.max(0, user.stats.gamesPlayed - user.stats.totalWins);
  const winRate = user.stats.gamesPlayed > 0 
    ? Math.round((user.stats.totalWins / user.stats.gamesPlayed) * 100) 
    : 0;
  
  const xpInLevel = user.xp % 500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / 500) * 100));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    soundFx.playClick();

    try {
      const res = await updateProfileData({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatar: selectedAvatar
      });

      if (res.success) {
        setSaveMessage('Profile changes successfully saved & synced!');
        setIsEditing(false);
        soundFx.playLevelUp();
      } else {
        setSaveError(res.error || 'Failed to save changes.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Error updating profile.');
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveMessage(null);
        setSaveError(null);
      }, 4000);
    }
  };

  const handleManualSync = async () => {
    soundFx.playClick();
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncCloudData();
      if (res) {
        soundFx.playLevelUp();
        setSyncStatus('All user stats verified & synced with Firestore!');
      } else {
        setSyncStatus('Offline mode: Local stats saved.');
      }
    } catch {
      setSyncStatus('Sync error. Please verify network.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const handleLogout = async () => {
    soundFx.playClick();
    await logout();
    router.push('/login');
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Top Notification Alerts */}
      {saveMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span className="font-semibold">{saveMessage}</span>
        </div>
      )}
      {saveError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span className="font-semibold">{saveError}</span>
        </div>
      )}

      {/* Main SaaS Profile Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#121624]/90 via-[#182035]/80 to-[#121624]/90 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00F0FF]/10 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#ADFF2F]/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar with Edit Indicator */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#00F0FF]/30 to-[#ADFF2F]/30 border-2 border-[#00F0FF] p-1 shadow-[0_0_30px_rgba(0,240,255,0.25)] flex items-center justify-center text-5xl sm:text-6xl">
                {isEditing ? selectedAvatar : user.avatar}
              </div>
              <div className="absolute -bottom-2 -right-1 px-2.5 py-0.5 rounded-full bg-[#00F0FF] text-black font-mono font-black text-xs shadow border border-black">
                LVL {user.level}
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {user.displayName || user.username}
                </h1>
                <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.authType === 'email' ? 'Verified SaaS Gamer' : user.authType === 'google' ? 'Google Cloud' : 'Guest Account'}
                </span>
              </div>

              <p className="text-xs text-slate-400 font-mono">
                @{user.username} {user.email && `• ${user.email}`}
              </p>

              <p className="text-sm text-slate-300 max-w-lg mt-1">
                {user.bio || 'Climbing the Chill Arena leaderboards and smashing high scores.'}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-2 font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Launch Season'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  {user.streak} Day Streak
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => {
                  setIsEditing(true);
                  soundFx.playClick();
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Edit3 className="w-4 h-4 text-[#00F0FF]" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex justify-between text-xs font-bold mb-2 text-slate-300">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#00F0FF]" /> Level {user.level} XP Progress
            </span>
            <span className="text-[#00F0FF]">{xpInLevel} / 500 XP ({xpPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#00F0FF] via-[#ADFF2F] to-[#00F0FF] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Edit Profile Form (Expanded when editing) */}
      {isEditing && (
        <div className="bg-[#121624]/90 border border-[#00F0FF]/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,240,255,0.15)] animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-6">
            <Edit3 className="w-5 h-5 text-[#00F0FF]" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Edit Gamer Profile
            </h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar Choice */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Choose Avatar
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_SELECTION.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av);
                      soundFx.playClick();
                    }}
                    className={`h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                      selectedAvatar === av
                        ? 'bg-gradient-to-tr from-[#00F0FF]/30 to-[#ADFF2F]/30 border-2 border-[#00F0FF] scale-105 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={30}
                  className="w-full px-4 py-3 bg-[#0a0d18] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Gamer Bio
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={150}
                  placeholder="Tell other gamers about your play style"
                  className="w-full px-4 py-3 bg-[#0a0d18] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00F0FF]"
                />
              </div>
            </div>

            {/* Read-Only Notice */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2.5">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>
                Game statistics (Total Score, XP, Rank, Wins) are securely calculated by the backend anti-cheat engine and cannot be manually modified.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Verified Game Statistics (Strictly Read-Only Server-Grounded Data) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#00F0FF]" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Verified Career Statistics
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Anti-Cheat Server Protected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#121624]/70 border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Score</span>
            <div className="text-xl sm:text-2xl font-black text-white">{totalScore.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Server verified</span>
          </div>

          <div className="bg-[#121624]/70 border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Best Score</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400">{bestScore.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Peak record</span>
          </div>

          <div className="bg-[#121624]/70 border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Current Rank</span>
            <div className="text-lg sm:text-xl font-black text-[#ADFF2F]">
              {user.stats.gamesPlayed === 0 ? 'Unranked' : user.level >= 10 ? 'Diamond II' : user.level >= 5 ? 'Gold I' : 'Silver III'}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Tier status</span>
          </div>

          <div className="bg-[#121624]/70 border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Matches Played</span>
            <div className="text-xl sm:text-2xl font-black text-white">{user.stats.gamesPlayed}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Total rounds</span>
          </div>

          <div className="bg-[#121624]/70 border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Wins</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">{user.stats.totalWins}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">{totalLosses} losses</span>
          </div>

          <div className="bg-[#121624]/70 border border-white/10 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Win Ratio</span>
            <div className="text-xl sm:text-2xl font-black text-cyan-400">{winRate}%</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Efficiency</span>
          </div>
        </div>
      </div>

      {/* Badges & Achievements Grid */}
      <div className="bg-[#121624]/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Earned Badges & Honors ({user.badges?.length || 0})
            </h2>
          </div>
        </div>

        {(user.badges && user.badges.length > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {user.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5 hover:border-amber-400/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {badge.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{badge.name}</h4>
                  <p className="text-xs text-slate-400 leading-tight mt-0.5">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 space-y-2">
            <p className="text-xs font-bold text-slate-300">No achievements unlocked yet</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Play mini-games, land difficult pen flips, and complete daily challenges to earn verified badges!
            </p>
          </div>
        )}
      </div>

      {/* Cloud Sync & Data Management */}
      <div className="p-6 rounded-3xl bg-[#121624]/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-[#00F0FF] ${isSyncing ? 'animate-spin' : ''}`} />
            Cloud Database Sync
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Force a manual state check to guarantee all high scores and rewards are backed up in Firestore.
          </p>
          {syncStatus && <p className="text-xs text-emerald-400 mt-1 font-semibold">{syncStatus}</p>}
        </div>

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          {isSyncing ? <Loader2 className="w-4 h-4 animate-spin text-[#00F0FF]" /> : <RefreshCw className="w-4 h-4 text-[#00F0FF]" />}
          <span>Sync Cloud Now</span>
        </button>
      </div>
    </div>
  );
}
