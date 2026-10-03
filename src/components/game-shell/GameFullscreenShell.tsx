'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Pause,
  RotateCcw,
  Zap,
  Trophy,
  X,
  Compass,
  Smartphone,
} from 'lucide-react';
import {
  GameViewportContext,
  useTrackGameViewport,
  GameViewportMetrics,
} from '@/lib/game-engine/useGameViewport';
import {
  getGameFullscreenConfig,
  GameFullscreenConfig,
} from '@/lib/game-engine/gameConfigRegistry';
import { soundFx } from '@/lib/audio';

export interface GameFullscreenShellProps {
  gameId: string;
  gameTitle: string;
  category?: string;
  score?: number;
  highScore?: number;
  combo?: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onPause?: () => void;
  onRestart?: () => void;
  preferredAspectRatio?: '16/9' | '1/1' | '4/3' | '9/16' | 'auto';
  preferredOrientation?: 'landscape' | 'portrait' | 'any';
  scalingMode?: 'contain' | 'responsive' | 'fill';
  showHUD?: boolean;
  extraControls?: React.ReactNode;
  modeBadge?: React.ReactNode;
  activePlayerInfo?: React.ReactNode;
  onChangeMode?: () => void;
  onExitGame?: () => void;
  children: React.ReactNode | ((metrics: GameViewportMetrics) => React.ReactNode);
}

export const GameFullscreenShell: React.FC<GameFullscreenShellProps> = ({
  gameId,
  gameTitle,
  category = 'Arcade Duel',
  score = 0,
  highScore = 0,
  combo = 0,
  isMuted: propIsMuted,
  onToggleMute,
  onPause,
  onRestart,
  preferredAspectRatio,
  preferredOrientation,
  scalingMode,
  showHUD = true,
  extraControls,
  modeBadge,
  activePlayerInfo,
  onChangeMode,
  onExitGame,
  children,
}) => {
  const parentViewport = React.useContext(GameViewportContext);
  if (parentViewport) {
    return <>{typeof children === 'function' ? children(parentViewport) : children}</>;
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const config: GameFullscreenConfig = getGameFullscreenConfig(gameId);

  const finalAspectRatio = preferredAspectRatio || config.preferredAspectRatio || 'auto';
  const finalOrientation = preferredOrientation || config.preferredOrientation || 'any';
  const finalScaling = scalingMode || config.scalingMode || 'responsive';

  const [localMuted, setLocalMuted] = useState(soundFx.settings.muted);
  const isMuted = propIsMuted !== undefined ? propIsMuted : localMuted;

  const [dismissRotatePrompt, setDismissRotatePrompt] = useState(false);

  // Viewport tracking hook
  const { metrics, isFullscreen, toggleFullscreen, exitFullscreen } = useTrackGameViewport({
    containerRef,
    baseWidth: 1024,
    baseHeight: 576,
  });

  // Handle Mute Toggle
  const handleToggleMute = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      const next = soundFx.toggleMute();
      setLocalMuted(next);
    }
  };

  // Keyboard shortcut listener (Escape to exit fullscreen, F to toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, exitFullscreen]);

  // Show rotate device prompt when game prefers landscape but mobile device is in portrait
  const showRotateNotice =
    isFullscreen &&
    metrics.isMobile &&
    metrics.orientation === 'portrait' &&
    finalOrientation === 'landscape' &&
    !dismissRotatePrompt;

  return (
    <GameViewportContext.Provider value={metrics}>
      <div
        ref={containerRef}
        id={`game-fullscreen-shell-${gameId}`}
        tabIndex={-1}
        className={`game-fullscreen-root relative select-none flex flex-col justify-between transition-all duration-200 outline-none ${
          isFullscreen
            ? 'fixed inset-0 z-[99999] w-screen h-[100dvh] min-h-[100dvh] max-w-none max-h-none m-0 p-0 rounded-none border-0 bg-[#04060c] text-gray-100 overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]'
            : 'relative w-full max-w-5xl mx-auto rounded-3xl border border-slate-800/80 bg-slate-950/95 shadow-2xl overflow-hidden'
        }`}
      >
        {/* ========================================================= */}
        {/* TOP GAME HUD BAR */}
        {/* ========================================================= */}
        {showHUD && (
          <header
            className={`w-full flex items-center justify-between z-40 transition-all duration-200 font-mono ${
              isFullscreen
                ? 'px-3 sm:px-6 py-2 bg-slate-950/95 backdrop-blur-md border-b border-cyan-500/30 text-xs shadow-lg'
                : 'px-3 sm:px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-gray-300'
            }`}
          >
            {/* Left: Category, Title & Mode Badge */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-[#00F0FF] font-black text-[10px] sm:text-[11px] border border-indigo-500/30 uppercase tracking-wider shrink-0 hidden xs:inline">
                {category}
              </span>
              <span className="font-black text-white truncate text-xs sm:text-sm font-display tracking-wide drop-shadow-sm">
                {gameTitle}
              </span>

              {/* Mode Badge if provided */}
              {modeBadge && (
                <div className="shrink-0">{modeBadge}</div>
              )}

              {/* Active Player Info if provided */}
              {activePlayerInfo && (
                <div className="hidden md:inline-flex shrink-0">{activePlayerInfo}</div>
              )}

              {isFullscreen && (
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md font-bold">
                  ⛶ FULLSCREEN
                </span>
              )}
            </div>

            {/* Right: Scores, Controls, Mode Switch, Fullscreen toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Score Display */}
              <div className="flex items-center gap-1 bg-slate-800/90 px-2 sm:px-2.5 py-1 rounded-xl border border-slate-700/80 shadow-inner">
                <span className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">SCORE:</span>
                <span className="text-[#00F0FF] font-black text-xs sm:text-sm">{score}</span>
              </div>

              {/* High Score (Desktop / Tablet) */}
              {highScore > 0 && (
                <div className="hidden sm:flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-xl border border-slate-700/50 text-yellow-400 font-bold text-xs">
                  <Trophy className="w-3.5 h-3.5 fill-yellow-400/20" />
                  <span>{highScore}</span>
                </div>
              )}

              {/* Combo Badge */}
              {combo > 1 && (
                <div className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black px-2 py-0.5 rounded-full text-xs animate-bounce shadow-md">
                  <Zap className="w-3 h-3 fill-current" />
                  {combo}x
                </div>
              )}

              {/* Change Mode button if handler passed */}
              {onChangeMode && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onChangeMode();
                  }}
                  title="Change Game Mode (VS AI, Pass & Play, Online)"
                  aria-label="Change Game Mode"
                  className="px-2 sm:px-2.5 py-1 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 hover:text-white text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="hidden xs:inline">MODES</span>
                  <span>🎯</span>
                </button>
              )}

              {/* Extra game-specific controls if passed */}
              {extraControls}

              {/* Pause button */}
              {onPause && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onPause();
                  }}
                  title="Pause Game (Esc)"
                  aria-label="Pause Game"
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-all transform active:scale-95 cursor-pointer border border-slate-700/60"
                >
                  <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              {/* Restart button */}
              {onRestart && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onRestart();
                  }}
                  title="Restart Game"
                  aria-label="Restart Game"
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-all transform active:scale-95 cursor-pointer border border-slate-700/60 hidden xs:inline-flex"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              {/* Mute/Unmute button */}
              <button
                onClick={handleToggleMute}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-all transform active:scale-95 cursor-pointer border border-slate-700/60"
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00F0FF]" />
                )}
              </button>

              {/* Universal Clearly Visible Fullscreen Toggle Button */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen (⛶)'}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer shadow-md ${
                  isFullscreen
                    ? 'bg-rose-500/25 hover:bg-rose-500/40 text-rose-300 border border-rose-500/50 shadow-rose-500/20'
                    : 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-teal-500/20 hover:from-cyan-500/35 hover:to-teal-500/35 text-[#00F0FF] border border-cyan-400/50 shadow-cyan-500/20'
                }`}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline text-[11px] font-black tracking-wider">EXIT (✕)</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline text-[11px] font-black tracking-wider">⛶ FULLSCREEN</span>
                  </>
                )}
              </button>

              {/* Exit Game / Back button if in fullscreen */}
              {isFullscreen && (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    if (onExitGame) {
                      onExitGame();
                    } else {
                      exitFullscreen();
                    }
                  }}
                  title="Exit Fullscreen (Esc)"
                  aria-label="Exit Fullscreen"
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-red-950/70 border border-slate-700 hover:border-red-500/60 text-gray-400 hover:text-red-300 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </header>
        )}

        {/* ========================================================= */}
        {/* ROTATE DEVICE BANNER (FOR MOBILE PORTRAIT ON LANDSCAPE) */}
        {/* ========================================================= */}
        {showRotateNotice && (
          <div className="absolute top-14 inset-x-4 z-40 bg-indigo-950/90 border border-indigo-500/40 rounded-2xl p-3 flex items-center justify-between text-xs text-indigo-200 backdrop-blur-md shadow-2xl animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 flex items-center justify-center text-cyan-300">
                <Smartphone className="w-4 h-4 rotate-90 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-white">Rotate your device for best view</p>
                <p className="text-[10px] text-indigo-300">This game is optimized for landscape play.</p>
              </div>
            </div>
            <button
              onClick={() => setDismissRotatePrompt(true)}
              className="p-1 rounded-lg hover:bg-indigo-900/60 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN GAME VIEWPORT PLAYING AREA */}
        {/* ========================================================= */}
        <main
          className={`game-playing-viewport relative w-full flex-1 min-w-0 min-h-0 flex items-center justify-center overflow-hidden ${
            isFullscreen
              ? 'h-full w-full p-2 sm:p-4'
              : 'min-h-[480px] h-[520px] sm:h-[560px] p-2 sm:p-4'
          }`}
        >
          {/* Inner Aspect Ratio & Scaling Containment Box */}
          <div
            className={`game-aspect-container relative w-full h-full min-w-0 min-h-0 flex items-center justify-center ${
              finalAspectRatio === '16/9'
                ? 'aspect-video max-w-full max-h-full'
                : finalAspectRatio === '1/1'
                ? 'aspect-square max-w-full max-h-full'
                : finalAspectRatio === '4/3'
                ? 'aspect-[4/3] max-w-full max-h-full'
                : 'w-full h-full'
            }`}
          >
            {typeof children === 'function' ? children(metrics) : children}
          </div>
        </main>
      </div>
    </GameViewportContext.Provider>
  );
};
