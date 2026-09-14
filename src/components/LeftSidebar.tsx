'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { ChillArenaLogo } from '@/components/ChillArenaLogo';
import {
  Home,
  Flame,
  Backpack,
  Brain,
  Swords,
  Trophy,
  Target,
  User,
  ShoppingBag,
  Sparkles,
  Gift,
  Star,
  ChevronRight,
  ChevronDown,
  Shield,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
  onToggleCollapse?: () => void;
}

export const LeftSidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  isCollapsed,
  onToggle,
  onToggleCollapse
}) => {
  const isActualCollapsed = isCollapsed !== undefined ? isCollapsed : collapsed;
  const handleToggle = onToggleCollapse || onToggle || (() => {});
  const pathname = usePathname();
  const { openSpinModal } = useAppStore();
  const [originalsOpen, setOriginalsOpen] = useState(true);


  // Loot Box Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 42, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mainNav = [
    { href: '/', label: 'Home Page', icon: Home },
    { href: '/multiplayer', label: 'Multiplayer 1v1', icon: Swords },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/categories', label: 'All Collections', icon: Layers },
    { href: '/profile', label: 'Gamer Profile', icon: User },
    { href: '/shop', label: 'Meme Store', icon: ShoppingBag }
  ];

  const gameCategories = [
    { href: '/categories?cat=meme', label: 'Trending Memes', icon: Flame, color: 'text-pink-400' },
    { href: '/categories?cat=school', label: 'School Vibes', icon: Backpack, color: 'text-amber-400' },
    { href: '/categories?cat=mind', label: 'Mind Games', icon: Brain, color: 'text-purple-400' }
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between shrink-0 bg-[#0d0f18] border-r border-[#1e2235] h-screen fixed left-0 top-0 z-40 transition-all duration-300 p-3 overflow-y-auto ${
        isActualCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="space-y-4">
        {/* Top Logo */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link href="/" onClick={() => soundFx.playClick()} className="flex items-center">
            <ChillArenaLogo size={isActualCollapsed ? 'sm' : 'md'} showTagline={!isActualCollapsed} />
          </Link>
        </div>

        {/* Next Loot Box Card Widget (Jackpotter Style) */}
        {!isActualCollapsed && (
          <div
            onClick={() => {
              soundFx.playClick();
              openSpinModal();
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-b from-[#241a38] via-[#171324] to-[#100d1a] border border-[#7928CA]/40 hover:border-[#00F0FF]/50 transition-all cursor-pointer group shadow-xl shadow-[#7928CA]/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                🎁
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block font-bold">
                  NEXT LOOT BOX IN
                </span>
                <span className="text-sm font-black text-white font-mono block">
                  {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
                <span className="text-[9px] text-[#ADFF2F] font-mono font-bold flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> FREE COINS & XP
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="space-y-1">
          {!isActualCollapsed && (
            <span className="text-[10px] font-mono font-bold text-gray-400 px-3 uppercase tracking-wider">
              MAIN MENU
            </span>
          )}

          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => soundFx.playClick()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold font-display transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00F0FF]/20 to-[#7928CA]/20 text-[#00F0FF] border border-[#00F0FF]/40 shadow-md shadow-[#00F0FF]/10'
                    : 'text-gray-400 hover:text-white hover:bg-[#161926] border border-transparent'
                }`}
                title={isActualCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isActualCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Expandable Arcade Originals */}
        <div className="space-y-1 pt-2 border-t border-[#1e2235]">
          {!isActualCollapsed ? (
            <button
              onClick={() => setOriginalsOpen(!originalsOpen)}
              className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-gray-400 px-3 uppercase tracking-wider hover:text-white"
            >
              <span>CHILL ORIGINALS</span>
              {originalsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : (
            <span className="block text-center text-[9px] font-mono text-gray-400">•••</span>
          )}

          {(!isActualCollapsed ? originalsOpen : true) && (
            <div className="space-y-1">
              {gameCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={() => soundFx.playClick()}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold font-display text-gray-400 hover:text-white hover:bg-[#161926] transition-colors"
                    title={isActualCollapsed ? cat.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${cat.color}`} />
                    {!isActualCollapsed && <span>{cat.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Info in Sidebar */}
      {!isActualCollapsed && (
        <div className="p-3 rounded-xl bg-[#121522] border border-[#1e2235] text-[10px] font-mono text-gray-400 space-y-1">
          <div className="flex items-center justify-between text-white font-bold">
            <span>Chill Arena Club</span>
            <span className="text-[#ADFF2F]">● VIP ACTIVE</span>
          </div>
          <p className="text-gray-400 text-[9px]">0 downloads • Instant 60 FPS multiplayer</p>
        </div>
      )}
    </aside>
  );
};

