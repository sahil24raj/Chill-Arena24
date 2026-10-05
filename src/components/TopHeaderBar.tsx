'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { VibeArenaLogo } from '@/components/VibeArenaLogo';
import {
  Gamepad2,
  LayoutGrid,
  Swords,
  Trophy,
  User,
  Search,
  X,
  Menu,
  Volume2,
  VolumeX,
  Plus,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { normalizeRoomCode } from '@/lib/multiplayer/roomCodeGenerator';

export const TopHeaderBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isMuted, toggleMute, openMultiplayerModal } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickJoinOpen, setQuickJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    soundFx.playClick();
    router.push(`/categories?q=${encodeURIComponent(searchQuery.trim())}`);
    setMobileMenuOpen(false);
  };

  const handleQuickJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeRoomCode(joinCode);
    if (!clean) return;
    soundFx.playClick();
    setQuickJoinOpen(false);
    setJoinCode('');
    router.push(`/play/room/${clean}`);
  };

  const navItems = [
    { href: '/categories', label: 'Games', icon: LayoutGrid },
    { href: '/multiplayer', label: 'Play with Friends', icon: Swords, badge: 'SQUAD' },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy }
  ];

  return (
    <header className="w-full bg-[#080A12]/95 backdrop-blur-xl border-b border-white/[0.07] sticky top-0 z-40 transition-colors">
      <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            onClick={() => soundFx.playClick()}
            className="flex items-center"
          >
            <VibeArenaLogo size="md" showTagline={false} />
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-[#10131D] px-2 py-1.5 rounded-full border border-white/[0.08]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => soundFx.playClick()}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-[#181C2A] text-white border border-[#D946EF]/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D946EF]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-full bg-[#D946EF]/20 text-[#F472B6] border border-[#D946EF]/40">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Actions + Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Quick Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden xl:flex items-center w-48 group"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 group-focus-within:text-[#06B6D4] transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search games... (/)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#10131D] border border-white/[0.08] group-focus-within:border-[#06B6D4]/50 rounded-full pl-8.5 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#06B6D4]/30 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Join Room Button */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playClick();
                setQuickJoinOpen(!quickJoinOpen);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full va-btn-secondary text-xs font-semibold cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Join Room</span>
            </button>

            {/* Quick Join Popover */}
            {quickJoinOpen && (
              <div className="absolute right-0 mt-2 w-72 p-4 rounded-2xl bg-[#10131D] border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-bold text-white mb-1 font-display">Join the Squad</div>
                <p className="text-[11px] text-slate-400 mb-3">Enter the 6-character room code from your squad.</p>
                <form onSubmit={handleQuickJoinSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="e.g. X7K92P"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#080A12] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#06B6D4] uppercase focus:outline-none focus:border-[#06B6D4]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!joinCode.trim()}
                      className="flex-1 py-2 rounded-xl va-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <span>Join Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickJoinOpen(false)}
                      className="px-3 py-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Primary CTA: Create Room */}
          <button
            onClick={() => {
              soundFx.playClick();
              openMultiplayerModal(GAMES_CATALOG[0]);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full va-btn-primary text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Room</span>
          </button>

          {/* Quick Profile Display Pill */}
          <Link
            href="/profile"
            onClick={() => soundFx.playClick()}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#10131D] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
            title="View Profile & Stats"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#D946EF] to-[#06B6D4] text-white flex items-center justify-center text-xs font-bold">
              {user.avatar || '🎮'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 pr-1">
              <span>🪙</span>
              <span>{user.coins}</span>
            </div>
          </Link>

          {/* Audio Mute/Unmute */}
          <button
            onClick={() => {
              soundFx.playClick();
              toggleMute();
            }}
            className="p-2 rounded-full bg-[#10131D] border border-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[#10131D] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0C16] border-b border-white/[0.08] px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          {/* Quick Search on Mobile */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search games, squad challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#10131D] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </form>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
                openMultiplayerModal(GAMES_CATALOG[0]);
              }}
              className="p-3 rounded-xl va-btn-primary text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Room</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
                setQuickJoinOpen(true);
              }}
              className="p-3 rounded-xl va-btn-secondary text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-[#06B6D4]" />
              <span>Join Room</span>
            </button>
          </div>

          <div className="space-y-1 pt-1 border-t border-white/[0.06]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    soundFx.playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#D946EF]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#D946EF]/20 text-[#F472B6]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <Link
              href="/profile"
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 p-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04]"
            >
              <User className="w-4 h-4 text-[#06B6D4]" />
              <span>My Profile & Stats</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
