'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { ChillArenaLogo } from '@/components/ChillArenaLogo';
import {
  Home,
  Flame,
  Backpack,
  Brain,
  Swords,
  Trophy,
  User,
  Sparkles,
  Gift,
  ChevronRight,
  ChevronDown,
  Layers,
  Coffee,
  Zap,
  Users
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
  const pathname = usePathname();
  const { user, openSpinModal } = useAppStore();
  const [vibesOpen, setVibesOpen] = useState(true);

  const isLoggedIn = user.authType === 'email' || user.authType === 'google';

  // Real countdown to next UTC midnight
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date();
    const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const diff = Math.max(0, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));
    return {
      hours: Math.floor(diff / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const diff = Math.max(0, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));
      setTimeLeft({
        hours: Math.floor(diff / 3600),
        minutes: Math.floor((diff % 3600) / 60),
        seconds: diff % 60
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mainNav = [
    { href: '/', label: 'Home Page', icon: Home },
    ...(isLoggedIn
      ? [{ href: '/dashboard', label: 'Gamer Dashboard', icon: Sparkles }]
      : []),
    { href: '/games', label: 'All Games', icon: Layers },
    { href: '/multiplayer', label: '1v1 Multiplayer', icon: Swords },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/profile', label: 'Gamer Profile', icon: User }
  ];

  // Dynamic game counts computed from registered games catalog
  const schoolCount = GAMES_CATALOG.filter((g) => g.categoryKey === 'school').length;
  const mindCount = GAMES_CATALOG.filter((g) => g.categoryKey === 'mind').length;
  const memeCount = GAMES_CATALOG.filter((g) => g.categoryKey === 'meme').length;
  const multiplayerCount = GAMES_CATALOG.filter((g) => g.multiplayer).length;
  const rapidCount = GAMES_CATALOG.filter((g) => g.duration.includes('30s') || g.duration.includes('60s') || g.duration.includes('1m')).length;

  const trendingVibes = [
    { href: '/categories?cat=school', label: 'School Nostalgia', icon: Backpack, color: 'text-amber-400', count: `${schoolCount} Games` },
    { href: '/categories?cat=mind', label: 'Mind Battles & IQ', icon: Brain, color: 'text-purple-400', count: `${mindCount} Games` },
    { href: '/categories?cat=meme', label: 'Desi Meme Vibes', icon: Coffee, color: 'text-pink-400', count: `${memeCount} Games` },
    { href: '/categories?cat=multiplayer', label: '1v1 Squad Duels', icon: Users, color: 'text-[#00F0FF]', count: `${multiplayerCount} Games` },
    { href: '/categories?cat=rapid', label: 'Rapid 60s Battles', icon: Zap, color: 'text-[#ADFF2F]', count: `${rapidCount} Games` }
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between shrink-0 bg-[#080B14] border-r border-[#1A2238] h-screen sticky top-0 z-30 transition-all duration-300 p-3 overflow-y-auto ${
        isActualCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="space-y-5">
        {/* Top Logo */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link href="/" onClick={() => soundFx.playClick()} className="flex items-center">
            <ChillArenaLogo size={isActualCollapsed ? 'sm' : 'md'} showTagline={!isActualCollapsed} />
          </Link>
        </div>

        {/* Daily Mystery Drop Card Widget */}
        {!isActualCollapsed && (
          <div
            onClick={() => {
              soundFx.playClick();
              openSpinModal();
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-b from-[#181C30] via-[#101424] to-[#0B0D17] border border-[#00F0FF]/30 hover:border-[#00F0FF] transition-all cursor-pointer group shadow-xl shadow-[#00F0FF]/5 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform shrink-0">
                🎁
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block font-bold">
                  DAILY SQUAD DROP
                </span>
                <span className="text-xs font-black text-white font-mono block">
                  {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
                <span className="text-[9px] text-[#00F0FF] font-mono font-bold flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> CLAIM FREE REWARD
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="space-y-1">
          {!isActualCollapsed && (
            <span className="text-[10px] font-mono font-bold text-gray-500 px-3 uppercase tracking-wider">
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
                    : 'text-gray-400 hover:text-white hover:bg-[#121829] border border-transparent'
                }`}
                title={isActualCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isActualCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* TRENDING VIBES (Expandable & Fully Working) */}
        <div className="space-y-1 pt-2 border-t border-[#1A2238]">
          {!isActualCollapsed ? (
            <button
              onClick={() => setVibesOpen(!vibesOpen)}
              className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-gray-400 px-3 uppercase tracking-wider hover:text-white group"
            >
              <div className="flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-[#FF0055]" />
                <span className="group-hover:text-[#00F0FF] transition-colors">TRENDING VIBES</span>
              </div>
              {vibesOpen ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
            </button>
          ) : (
            <span className="block text-center text-[9px] font-mono text-gray-500">•••</span>
          )}

          {(!isActualCollapsed ? vibesOpen : true) && (
            <div className="space-y-1 pt-1">
              {trendingVibes.map((vibe) => {
                const Icon = vibe.icon;
                return (
                  <Link
                    key={vibe.href}
                    href={vibe.href}
                    onClick={() => soundFx.playClick()}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold font-display text-gray-400 hover:text-white hover:bg-[#121829] hover:border-[#00F0FF]/30 border border-transparent transition-all"
                    title={isActualCollapsed ? vibe.label : undefined}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${vibe.color}`} />
                      {!isActualCollapsed && <span>{vibe.label}</span>}
                    </div>
                    {!isActualCollapsed && (
                      <span className="text-[9px] font-mono text-gray-500">
                        {vibe.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Info in Sidebar */}
      {!isActualCollapsed && (
        <div className="p-3 rounded-xl bg-[#101524] border border-[#1A2238] text-[10px] font-mono text-gray-400 space-y-1">
          <div className="flex items-center justify-between text-white font-bold">
            <span>Chill Arena</span>
            <span className="text-[#ADFF2F]">● ONLINE</span>
          </div>
          <p className="text-gray-500 text-[9px]">0 downloads • Instant 60 FPS</p>
        </div>
      )}
    </aside>
  );
};
