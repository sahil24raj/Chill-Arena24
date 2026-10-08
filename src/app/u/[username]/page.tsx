'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { getPublicProfileByUsername } from '@/lib/firebaseService';
import { GamerAvatar } from '@/components/profile/GamerAvatar';
import { UserProfile } from '@/types';
import { soundFx } from '@/lib/audio';
import {
  Trophy,
  Award,
  Zap,
  Flame,
  ShieldCheck,
  Calendar,
  Lock,
  Share2,
  Check,
  Crown,
  Swords,
  Gamepad2,
  ExternalLink,
  Edit3,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const rawUsername = params?.username as string;
  const username = decodeURIComponent(rawUsername || '').replace(/^@/, '');

  const currentUser = useAppStore((state) => state.user);
  const openMultiplayerModal = useAppStore((state) => state.openMultiplayerModal);

  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!username) return;

    let isMounted = true;
    setIsLoading(true);
    setNotFound(false);

    // If viewing the current local user, use immediate store data
    if (
      currentUser.username.toLowerCase() === username.toLowerCase() ||
      (currentUser.displayName && currentUser.displayName.toLowerCase() === username.toLowerCase())
    ) {
      setProfile(currentUser);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch from public Firestore directory
    getPublicProfileByUsername(username)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setProfile(data);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.warn('Error fetching public profile:', err);
        if (isMounted) setNotFound(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [username, currentUser]);

  const handleCopyLink = () => {
    soundFx.playClick();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const isSelf =
    currentUser.username.toLowerCase() === username.toLowerCase() ||
    (currentUser.displayName && currentUser.displayName.toLowerCase() === username.toLowerCase());

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#00F0FF] mx-auto" />
        <p className="text-sm font-mono text-slate-400">Loading Vibe Arena Gamer Card...</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl mx-auto text-slate-500">
          👾
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">Gamer Not Found</h2>
          <p className="text-xs text-slate-400 font-mono">
            No player found with gamer tag &quot;@{username}&quot;. They may not have registered or may have changed their username.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/leaderboard"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all"
          >
            Arena Leaderboard
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-[#00F0FF] text-black text-xs font-bold uppercase tracking-wider transition-all"
          >
            Home Arena
          </Link>
        </div>
      </div>
    );
  }

  // Check Privacy: If user set profile to private and it's not the user themselves
  const isPrivate = profile.privacySettings?.isPublic === false && !isSelf;
  if (isPrivate) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl mx-auto text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">Private Gamer Profile</h2>
          <p className="text-xs text-slate-400">
            @{profile.username} has set their profile to private. Match details and career metrics are protected.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Arena
        </Link>
      </div>
    );
  }

  const highScoresMap = profile.stats?.highScores || {};
  const totalScore = Object.values(highScoresMap).reduce((a, b) => a + Number(b), 0);
  const bestScore = Math.max(0, ...Object.values(highScoresMap).map(Number));
  const gamesPlayed = profile.stats?.gamesPlayed || 0;
  const totalWins = profile.stats?.totalWins || 0;
  const winRate = gamesPlayed > 0 ? Math.round((totalWins / gamesPlayed) * 100) : 0;
  const rankDisplay = (profile.rank as string) || (gamesPlayed === 0 ? 'Unranked' : (profile.level || 1) >= 10 ? 'Diamond I' : (profile.level || 1) >= 5 ? 'Gold III' : 'Silver I');

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Back button */}
      <div>
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Leaderboard
        </Link>
      </div>

      {/* Main Public Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0C101F]/95 via-[#13192F]/90 to-[#0C101F]/95 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F0FF]/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-[#ADFF2F]/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <GamerAvatar
              avatar={profile.avatar}
              photoURL={profile.photoURL}
              avatarType={profile.avatarType}
              size="2xl"
              showOnline={true}
              isOnline={true}
              rank={rankDisplay}
              showLevel={true}
              level={profile.level || 1}
              glowEffect={true}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {profile.displayName || profile.username}
                </h1>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Player
                </span>
              </div>

              <div className="text-xs font-mono text-slate-400">
                <span>@{profile.username}</span>
              </div>

              <p className="text-sm text-slate-300 max-w-md italic font-sans">
                &ldquo;{profile.bio || 'Ready to compete in the Vibe Arena!'}&rdquo;
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-400 pt-2 flex-wrap">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  {rankDisplay}
                </span>
                <span className="text-orange-400 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {profile.streak || 0} Day Streak
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Launch Season'}
                </span>
              </div>
            </div>
          </div>

          {/* Action cluster */}
          <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            {isSelf ? (
              <Link
                href="/profile?tab=edit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:opacity-95"
              >
                <Edit3 className="w-4 h-4 text-black" />
                <span>Edit My Profile</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  openMultiplayerModal(GAMES_CATALOG[0]);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:opacity-95 cursor-pointer"
              >
                <Swords className="w-4 h-4 text-black" />
                <span>Challenge in Arena</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Career Metrics (if visible) */}
      {(profile.privacySettings?.showStats ?? true) && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Arena Performance Record
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Score
              </span>
              <div className="text-2xl font-black text-white font-mono">{totalScore.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Verified Points</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Peak Score
              </span>
              <div className="text-2xl font-black text-amber-400 font-mono">{bestScore.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">High Record</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Matches Played
              </span>
              <div className="text-2xl font-black text-white font-mono">{gamesPlayed}</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{totalWins} Victories</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Win Rate
              </span>
              <div className="text-2xl font-black text-cyan-400 font-mono">{winRate}%</div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Efficiency</span>
            </div>
          </div>
        </div>
      )}

      {/* Unlocked Badges (if visible) */}
      {(profile.privacySettings?.showAchievements ?? true) && profile.badges && profile.badges.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#0D101C]/80 border border-white/10 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Unlocked Honors & Badges ({profile.badges.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profile.badges.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3"
              >
                <div className="text-2xl w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                  {b.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{b.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{b.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
