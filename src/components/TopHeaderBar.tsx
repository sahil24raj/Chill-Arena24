'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Search,
  Gift,
  Volume2,
  VolumeX,
  Menu,
  X,
  Crown,
  Swords,
  Flame,
  Zap,
  User,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  Gamepad2,
  Trophy,
  ChevronDown
} from 'lucide-react';

interface TopHeaderBarProps {
  onToggleLeftSidebar?: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  onToggleLeftSidebar
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isMuted, toggleMute, openSpinModal, openMultiplayerModal, logout } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isLoggedIn = user.authType === 'email' || user.authType === 'google';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    soundFx.playClick();
    router.push(`/categories?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    soundFx.playClick();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  const xpInLevel = user.xp % 500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / 500) * 100));

  return (
    <>
      <header className="w-full bg-[#080B14]/95 backdrop-blur-xl border-b border-[#1A2238] px-3 sm:px-6 lg:px-8 py-2.5 sticky top-0 z-30 flex items-center justify-between gap-3 lg:gap-6">
        {/* Left: Mobile Menu Toggle + Quick Nav Links */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#121829] border border-gray-800 text-gray-400 hover:text-white"
            title="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#00F0FF]" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Core Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#101524] p-1 rounded-xl border border-white/5">
            <Link
              href="/"
              onClick={() => soundFx.playClick()}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                pathname === '/' ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              href="/games"
              onClick={() => soundFx.playClick()}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                pathname === '/games' || pathname.startsWith('/games/') ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Games
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => soundFx.playClick()}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                pathname === '/leaderboard' ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Leaderboard
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => soundFx.playClick()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    pathname === '/dashboard' ? 'bg-[#ADFF2F]/15 text-[#ADFF2F] border border-[#ADFF2F]/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => soundFx.playClick()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    pathname === '/profile' ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => soundFx.playClick()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    pathname === '/login' ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => soundFx.playClick()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    pathname === '/signup' ? 'bg-[#ADFF2F]/15 text-[#ADFF2F] border border-[#ADFF2F]/30' : 'text-[#ADFF2F] hover:opacity-90'
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* 1v1 Duel Quick Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              openMultiplayerModal();
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-mono font-bold transition-all hover:scale-105 shrink-0 cursor-pointer"
          >
            <Swords className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>1v1 DUEL</span>
          </button>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm relative min-w-0">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search games, Modi, Pen Flip..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#101524] border border-[#1E2842] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/30 transition-all font-sans"
          />
        </form>

        {/* Right User Controls & SaaS Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Daily Spin Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              openSpinModal();
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:brightness-110 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md hover:scale-105 transition-all shrink-0 cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SPIN</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              toggleMute();
              if (isMuted) soundFx.playClick();
            }}
            className="p-2 rounded-xl bg-[#101524] border border-gray-800 text-gray-400 hover:text-[#00F0FF] transition-colors shrink-0 cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Logged Out: Auth Buttons */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => soundFx.playClick()}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                <LogIn className="w-3.5 h-3.5" /> Login
              </Link>
              <Link
                href="/signup"
                onClick={() => soundFx.playClick()}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ADFF2F] to-[#00F0FF] text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(173,255,47,0.3)] hover:opacity-95 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" /> Sign Up
              </Link>
            </div>
          ) : (
            /* Logged In User Pill with Dropdown */
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-xl bg-[#101524] border border-white/10 hover:border-[#00F0FF]/50 transition-all cursor-pointer group shrink-0"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00F0FF] via-purple-500 to-[#ADFF2F] text-slate-950 flex items-center justify-center text-xs font-bold shadow">
                  {user.avatar}
                </div>
                <span className="hidden md:inline text-xs font-bold text-white max-w-[80px] truncate">
                  {user.displayName || user.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#121624] border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.7)] p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user.displayName || user.username}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{user.email || `@${user.username}`}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-[#00F0FF] font-bold">
                      <span>LVL {user.level}</span>
                      <span>•</span>
                      <span>{user.xp} XP</span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => {
                      soundFx.playClick();
                      setUserDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#ADFF2F]" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => {
                      soundFx.playClick();
                      setUserDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/leaderboard"
                    onClick={() => {
                      soundFx.playClick();
                      setUserDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Leaderboard</span>
                  </Link>

                  <div className="my-1 border-t border-white/5" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Responsive Fullscreen/Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[53px] bg-[#080B14]/98 backdrop-blur-2xl border-b border-white/10 p-4 z-40 space-y-3 animate-in slide-in-from-top-3 duration-200">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-white/5 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4 text-[#00F0FF]" /> Home
            </Link>
            <Link
              href="/games"
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-white/5 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4 text-[#ADFF2F]" /> Games
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-xl bg-white/5 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" /> Leaderboard
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => {
                    soundFx.playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-white/5 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#ADFF2F]" /> Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => {
                    soundFx.playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-white/5 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-[#00F0FF]" /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => {
                    soundFx.playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-white/5 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-[#00F0FF]" /> Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => {
                    soundFx.playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-xl bg-gradient-to-r from-[#ADFF2F] to-[#00F0FF] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
