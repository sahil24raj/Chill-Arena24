'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Gamepad2,
  Trophy,
  Swords,
  Target,
  Flame,
  Volume2,
  VolumeX,
  User,
  Gift,
  Search,
  Zap,
  Play,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isMuted, toggleMute, openAuthModal, openSpinModal, openMultiplayerModal } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { href: '/', label: 'HOME', icon: Gamepad2 },
    { href: '/games', label: 'GAMES', icon: Flame },
    { href: '/multiplayer', label: 'MULTIPLAYER', icon: Swords },
    { href: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
    { href: '/categories', label: 'CATEGORIES', icon: Target }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    soundFx.playClick();
    router.push(`/games?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  };

  // XP progress computation
  const xpInLevel = user.xp % 500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / 500) * 100));

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-[#00F0FF]/20 px-4 lg:px-8 py-2.5 bg-[#080a0e]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Logo & Brand Mark */}
        <Link
          href="/"
          onClick={() => soundFx.playClick()}
          className="flex items-center gap-2.5 group cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F0FF] via-purple-500 to-[#ADFF2F] p-[1.5px] shadow-lg shadow-[#00F0FF]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#080a0e] rounded-[10px] flex items-center justify-center font-display font-black text-[#00F0FF] text-xl">
              🎮
            </div>
          </div>
          <div className="flex flex-col font-display">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-[#00F0FF] transition-colors">
                MEMEVERSE
              </span>
              <span className="text-[9px] font-black bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 px-1.5 py-0.5 rounded leading-none">
                ARENA
              </span>
            </div>
            <span className="text-[9px] font-mono text-gray-400 tracking-wider uppercase -mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse" />
              Multiplayer Browser Esports
            </span>
          </div>
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

        {/* Right Section: Currency, Level, Spin & Profile */}
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

          {/* PLAY NOW Quick Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              openMultiplayerModal();
            }}
            className="hidden sm:flex cyber-button px-4 py-1.5 rounded-lg text-xs font-black text-slate-950 items-center gap-1.5 font-display shadow-md shadow-[#00F0FF]/20"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>PLAY NOW</span>
          </button>

          {/* User Profile Avatar */}
          <Link
            href="/profile"
            onClick={() => soundFx.playClick()}
            className="flex items-center gap-2 p-1 pr-2.5 rounded-lg bg-[#0e1218] border border-gray-800 hover:border-[#00F0FF]/40 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] text-slate-950 flex items-center justify-center text-sm font-bold">
              {user.avatar}
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

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
                openMultiplayerModal();
              }}
              className="flex-1 py-2.5 rounded-xl cyber-button text-xs font-black text-slate-950 flex items-center justify-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-slate-950" /> PLAY NOW
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
