'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Gamepad2,
  Trophy,
  ShoppingBag,
  Flame,
  Volume2,
  VolumeX,
  User,
  Gift,
  Search,
  ShieldAlert,
  Cpu
} from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const { user, isMuted, toggleMute, openAuthModal, openSpinModal } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { href: '/', label: 'DASHBOARD', icon: Gamepad2 },
    { href: '/categories', label: 'COLLECTIONS', icon: Flame },
    { href: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
    { href: '/shop', label: 'MEME STORE', icon: ShoppingBag },
    { href: '/admin', label: 'ADMIN', icon: ShieldAlert }
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-[#00F0FF]/15 px-4 lg:px-8 py-3 bg-[#0A0C10]/90">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* SaaS Professional Logo */}
        <Link
          href="/"
          onClick={() => soundFx.playClick()}
          className="flex items-center gap-2.5 group cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] p-[1px] shadow-md shadow-[#00F0FF]/10 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0A0C10] rounded-[7px] flex items-center justify-center font-display font-black text-[#00F0FF] text-lg">
              MV
            </div>
          </div>
          <div className="flex flex-col font-display">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white group-hover:text-[#00F0FF] transition-colors">
                MEMEVERSE
              </span>
              <span className="text-[9px] font-black bg-cyan-950/60 text-[#00F0FF] border border-[#00F0FF]/30 px-1 py-0.5 rounded leading-none">
                SYS_v1.2
              </span>
            </div>
            <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase -mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse" />
              Meme Processing Node
            </span>
          </div>
        </Link>

        {/* Professional Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#111318] p-1 rounded-lg border border-gray-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => soundFx.playClick()}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold font-display tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Pipeline / System Status */}
        <div className="hidden xl:flex items-center gap-4 text-[10px] text-gray-500 font-mono">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Meme Engine: <strong className="text-[#ADFF2F]">60_FPS</strong></span>
          </div>
          <span className="text-gray-800">|</span>
          <div>
            <span>Pipeline: <strong className="text-[#00F0FF]">STABLE</strong></span>
          </div>
        </div>

        {/* Right Status / Action Controls */}
        <div className="flex items-center gap-3">
          {/* Daily Reward Spin */}
          <button
            onClick={() => {
              soundFx.playClick();
              openSpinModal();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#ADFF2F] to-[#00f0ff] hover:brightness-110 rounded text-xs font-black text-[#0A0C10] hover:scale-105 transition-transform"
          >
            <Gift className="w-4 h-4 animate-bounce" />
            <span className="font-display tracking-wider">CLAIM REWARDS</span>
          </button>

          {/* User Currency Badge */}
          <div className="flex items-center gap-2 bg-[#111318] border border-gray-850 rounded px-3 py-1.5 text-xs text-gray-300 font-mono">
            <span className="text-amber-400 font-bold">🪙 {user.coins}</span>
            <span className="w-px h-3 bg-gray-800" />
            <span className="text-[#00F0FF] font-bold">LVL {user.level}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              toggleMute();
              if (isMuted) soundFx.playClick();
            }}
            className="p-2 rounded bg-[#111318] border border-gray-800 text-gray-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/30 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <Link
              href="/profile"
              onClick={() => soundFx.playClick()}
              className="flex items-center gap-2 p-1 pr-3 rounded bg-[#111318] border border-gray-800 hover:border-[#00F0FF]/30 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] text-slate-950 flex items-center justify-center text-sm font-bold">
                {user.avatar}
              </div>
              <span className="text-xs font-bold text-gray-300 hidden sm:inline max-w-[90px] truncate font-display">
                {user.username}
              </span>
            </Link>
          ) : (
            <button
              onClick={() => {
                soundFx.playClick();
                openAuthModal();
              }}
              className="cyber-button px-4 py-1.5 rounded text-xs font-black text-white flex items-center gap-1.5 shadow-lg"
            >
              <User className="w-4 h-4" />
              <span className="font-display tracking-wider">LOGIN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
