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

export const LeftSidebar: React.FC<any> = () => {
  return null;
};

