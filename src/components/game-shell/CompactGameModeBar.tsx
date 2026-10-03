'use client';

import React, { useState } from 'react';
import { Bot, Users, Globe, ChevronDown, Check, Settings2, Sparkles } from 'lucide-react';
import { GameModeType, AIDifficulty, PlayerSetup } from '@/types/gameMode';
import { soundFx } from '@/lib/audio';

export interface CompactGameModeBarProps {
  currentMode: GameModeType;
  onChangeMode?: (mode: GameModeType) => void;
  onSelectMode?: (mode: GameModeType) => void;
  aiDifficulty?: AIDifficulty;
  onChangeDifficulty?: (diff: AIDifficulty) => void;
  onSelectDifficulty?: (diff: AIDifficulty) => void;
  players?: PlayerSetup[];
  onOpenPassPlayConfig?: () => void;
  isPlaying?: boolean;
  hasUnsavedProgress?: boolean;
  className?: string;
  supportsPassAndPlay?: boolean;
  supportsAI?: boolean;
  supportsOnline?: boolean;
}

export const CompactGameModeBar: React.FC<CompactGameModeBarProps> = ({
  currentMode,
  onChangeMode: propOnChangeMode,
  onSelectMode,
  aiDifficulty = 'medium',
  onChangeDifficulty: propOnChangeDifficulty,
  onSelectDifficulty,
  players = [],
  onOpenPassPlayConfig,
  isPlaying = false,
  hasUnsavedProgress = false,
  className = '',
  supportsPassAndPlay = true,
  supportsAI = true,
  supportsOnline = true,
}) => {
  const onChangeMode = propOnChangeMode || onSelectMode || (() => {});
  const onChangeDifficulty = propOnChangeDifficulty || onSelectDifficulty;
  const [showDiffDropdown, setShowDiffDropdown] = useState(false);

  const handleModeClick = (targetMode: GameModeType) => {
    if (targetMode === currentMode) {
      if (targetMode === 'ai' && onChangeDifficulty) {
        soundFx.playClick();
        setShowDiffDropdown((prev) => !prev);
      } else if (targetMode === 'pass-and-play' && onOpenPassPlayConfig) {
        soundFx.playClick();
        onOpenPassPlayConfig();
      }
      return;
    }

    if (isPlaying && hasUnsavedProgress) {
      const confirmChange = window.confirm(
        'Switching modes will restart your current match. Do you want to continue?'
      );
      if (!confirmChange) return;
    }

    soundFx.playClick();
    setShowDiffDropdown(false);
    onChangeMode(targetMode);
  };

  const handleSelectDifficulty = (diff: AIDifficulty) => {
    soundFx.playClick();
    if (onChangeDifficulty) {
      onChangeDifficulty(diff);
    }
    setShowDiffDropdown(false);
  };

  return (
    <div
      className={`relative inline-flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-lg backdrop-blur-md font-mono select-none ${className}`}
    >
      {/* 1. VS AI PILL (DEFAULT) */}
      {supportsAI && (
        <div className="relative">
          <button
            type="button"
            onClick={() => handleModeClick('ai')}
            title="Play against Smart AI Bot (You go first)"
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold font-display flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === 'ai'
                ? 'bg-cyan-500/20 text-[#00F0FF] border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Bot className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
            <span>VS AI</span>

            {/* Difficulty Badge (clickable) */}
            {currentMode === 'ai' && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  setShowDiffDropdown((prev) => !prev);
                }}
                className="ml-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 uppercase hover:bg-cyan-900/80 flex items-center gap-0.5"
                title="Change AI Difficulty"
              >
                <span>{aiDifficulty.slice(0, 3)}</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-70" />
              </span>
            )}
          </button>

          {/* Difficulty Dropdown */}
          {showDiffDropdown && (
            <div className="absolute top-full left-0 mt-1.5 z-50 p-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-2xl flex flex-col gap-1 min-w-[100px] animate-fade-in">
              {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSelectDifficulty(d)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono capitalize text-left flex items-center justify-between transition-colors ${
                    aiDifficulty === d
                      ? 'bg-cyan-500/20 text-[#00F0FF] font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{d}</span>
                  {aiDifficulty === d && <Check className="w-3 h-3 text-[#00F0FF]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. PASS & PLAY PILL */}
      {supportsPassAndPlay && (
        <button
          type="button"
          onClick={() => handleModeClick('pass-and-play')}
          title="Play locally with friends on this device (Pass & Play)"
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold font-display flex items-center gap-1.5 transition-all cursor-pointer ${
            currentMode === 'pass-and-play'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0 text-purple-400" />
          <span>Pass & Play</span>

          {currentMode === 'pass-and-play' && players.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenPassPlayConfig) onOpenPassPlayConfig();
              }}
              className="ml-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-950/80 border border-purple-500/40 text-purple-200 uppercase hover:bg-purple-900/80 flex items-center gap-0.5"
              title="Configure Seats"
            >
              <span>{players.length}P</span>
              <Settings2 className="w-2.5 h-2.5 opacity-70" />
            </span>
          )}
        </button>
      )}

      {/* 3. ONLINE MULTIPLAYER PILL */}
      {supportsOnline && (
        <button
          type="button"
          onClick={() => handleModeClick('online')}
          title="Play online against friends or squad with Room Code"
          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold font-display flex items-center gap-1.5 transition-all cursor-pointer ${
            currentMode === 'online'
              ? 'bg-emerald-500/20 text-[#ADFF2F] border border-lime-400/60 shadow-[0_0_12px_rgba(173,255,47,0.35)]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Globe className="w-3.5 h-3.5 shrink-0 text-[#ADFF2F]" />
          <span>Online PvP</span>
        </button>
      )}
    </div>
  );
};
