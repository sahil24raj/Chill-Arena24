'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { ChillArenaLogo } from '@/components/ChillArenaLogo';
import {
  Gamepad2,
  Trophy,
  Swords,
  Target,
  User,
  Volume2,
  VolumeX,
  Gift,
  Search,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isMuted, toggleMute, openSpinModal } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { href: '/', label: 'HOME', icon: Gamepad2 },
    { href: '/multiplayer', label: 'MULTIPLAYER', icon: Swords },
    { href: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
    { href: '/categories', label: 'CATEGORIES', icon: Target },
    { href: '/profile', label: 'PROFILE', icon: User }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    soundFx.playClick();
    router.push(`/categories?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  };

  // XP progress computation
  const xpInLevel = user.xp % 500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / 500) * 100));

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-[#00F0FF]/20 px-4 lg:px-8 py-2.5 bg-[#080a0e]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand Logo with ChillArenaLogo */}
        <Link
          href="/"
          onClick={() => soundFx.playClick()}
          className="flex items-center"
        >
          <ChillArenaLogo size="md" showTagline={true} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#0e1218] p-1 rounded-xl border border-gray-850">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => soundFx.playClick()}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold font-display tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Search, Spin, Currency, Level & User Avatar Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search games..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  className="w-36 sm:w-48 bg-slate-950 border border-[#00F0FF] rounded-lg px-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none font-sans"
                />
              </form>
            ) : (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSearchOpen(true);
                }}
                className="p-2 rounded-lg bg-[#0e1218] border border-gray-800 text-gray-400 hover:text-white hover:border-[#00F0FF]/40 transition-colors"
                title="Search games"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Daily Spin Free Coins */}
          <button
            onClick={() => {
              soundFx.playClick();
              openSpinModal();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 rounded-lg text-xs font-black text-slate-950 hover:scale-105 transition-all shadow-md shadow-amber-500/20"
          >
            <Gift className="w-3.5 h-3.5" />
            <span className="font-display font-black">SPIN</span>
          </button>

          {/* Coins Display */}
          <div className="flex items-center gap-1.5 bg-[#0e1218] border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-mono font-bold">
            <span>🪙</span>
            <span>{user.coins}</span>
          </div>

          {/* XP & Level Progress Pill */}
          <div className="hidden md:flex items-center gap-2 bg-[#0e1218] border border-gray-800 rounded-lg px-3 py-1.5 text-xs font-mono">
            <span className="text-[#00F0FF] font-bold">LVL {user.level}</span>
            <div className="w-12 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-gray-800">
              <div
                className="h-full bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F]"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              toggleMute();
              if (isMuted) soundFx.playClick();
            }}
            className="p-2 rounded-lg bg-[#0e1218] border border-gray-800 text-gray-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Google Sign In / Auth Button if Guest */}
          {user.authType === 'guest' ? (
            <button
              onClick={() => {
                soundFx.playClick();
                useAppStore.getState().openAuthModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 via-amber-600 to-blue-600 hover:brightness-110 text-white font-display text-xs font-black shadow-md shadow-red-950/40 hover:scale-105 transition-all"
            >
              <span className="text-xs">🌐</span>
              <span className="hidden sm:inline">SIGN IN</span>
            </button>
          ) : null}

          {/* User Profile Avatar Pill */}
          <Link
            href="/profile"
            onClick={() => soundFx.playClick()}
            className="flex items-center gap-2 p-1 pr-2.5 rounded-lg bg-[#0e1218] border border-gray-800 hover:border-[#00F0FF]/40 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] text-slate-950 flex items-center justify-center text-sm font-bold relative">
              {user.avatar}
              {user.authType === 'google' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-1 ring-slate-950"></span>
              )}
            </div>
            <span className="text-xs font-bold text-gray-300 hidden xl:inline max-w-[80px] truncate font-display">
              {user.username}
            </span>
          </Link>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#0e1218] border border-gray-800 text-gray-400 lg:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-gray-800 space-y-2 animate-fadeIn font-display">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  soundFx.playClick();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold ${
                  isActive
                    ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
