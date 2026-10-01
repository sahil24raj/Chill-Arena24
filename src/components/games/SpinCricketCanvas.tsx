'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import { useGameViewport } from '@/lib/game-engine/useGameViewport';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  Flame,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Zap,
  Target,
  ChevronRight
} from 'lucide-react';

export interface CricketDiscSlice {
  id: string;
  label: string;
  displayLabel: string;
  sublabel: string;
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
  color: string;
  darkColor: string;
  textColor: string;
}

// 10 Radial sectors around the circular cricket disc (36° each)
export const CRICKET_DISC_SLICES: CricketDiscSlice[] = [
  {
    id: 'six',
    label: 'SIX',
    displayLabel: 'SIX',
    sublabel: '+6 RUNS',
    runs: 6,
    isWicket: false,
    isExtra: false,
    color: '#10b981', // Emerald Green
    darkColor: '#059669',
    textColor: '#ffffff'
  },
  {
    id: 'four-1',
    label: 'FOUR',
    displayLabel: 'FOUR',
    sublabel: '+4 RUNS',
    runs: 4,
    isWicket: false,
    isExtra: false,
    color: '#0284c7', // Electric Blue
    darkColor: '#0369a1',
    textColor: '#ffffff'
  },
  {
    id: 'single-1',
    label: 'SINGLE',
    displayLabel: 'SINGLE',
    sublabel: '+1 RUN',
    runs: 1,
    isWicket: false,
    isExtra: false,
    color: '#f97316', // Coral Orange
    darkColor: '#ea580c',
    textColor: '#ffffff'
  },
  {
    id: 'wide',
    label: 'WIDE',
    displayLabel: 'WIDE',
    sublabel: '+1 EXTRA',
    runs: 1,
    isWicket: false,
    isExtra: true,
    color: '#06b6d4', // Cyan
    darkColor: '#0891b2',
    textColor: '#ffffff'
  },
  {
    id: 'norun',
    label: 'NO RUN',
    displayLabel: 'NO RUN',
    sublabel: '0 DOT',
    runs: 0,
    isWicket: false,
    isExtra: false,
    color: '#334155', // Slate Dark
    darkColor: '#1e293b',
    textColor: '#e2e8f0'
  },
  {
    id: 'three',
    label: 'THREE',
    displayLabel: 'THREE',
    sublabel: '+3 RUNS',
    runs: 3,
    isWicket: false,
    isExtra: false,
    color: '#8b5cf6', // Violet Purple
    darkColor: '#7c3aed',
    textColor: '#ffffff'
  },
  {
    id: 'noball',
    label: 'NO BALL',
    displayLabel: 'NO BALL',
    sublabel: '+1 EXTRA',
    runs: 1,
    isWicket: false,
    isExtra: true,
    color: '#eab308', // Amber Gold
    darkColor: '#ca8a04',
    textColor: '#0f172a'
  },
  {
    id: 'double',
    label: 'DOUBLE',
    displayLabel: 'DOUBLE',
    sublabel: '+2 RUNS',
    runs: 2,
    isWicket: false,
    isExtra: false,
    color: '#d946ef', // Magenta
    darkColor: '#c026d3',
    textColor: '#ffffff'
  },
  {
    id: 'out',
    label: 'OUT',
    displayLabel: 'OUT',
    sublabel: 'WICKET!',
    runs: 0,
    isWicket: true,
    isExtra: false,
    color: '#ef4444', // Crimson Red
    darkColor: '#dc2626',
    textColor: '#ffffff'
  },
  {
    id: 'four-2',
    label: 'FOUR',
    displayLabel: 'FOUR',
    sublabel: '+4 RUNS',
    runs: 4,
    isWicket: false,
    isExtra: false,
    color: '#0ea5e9', // Sky Blue
    darkColor: '#0284c7',
    textColor: '#ffffff'
  }
];

interface SpinCricketPlayAreaProps {
  score: number;
  wickets: number;
  completedOvers: number;
  remainingBallsInOver: number;
  oversFormatted: string;
  ballsBowled: number;
  MAX_BALLS: number;
  TARGET_SCORE: number;
  MAX_WICKETS: number;
  wheelRotation: number;
  isSpinning: boolean;
  spinWheel: () => void;
  status: GameStatus;
  lastShot: {
    label: string;
    sublabel: string;
    runs: number;
    isWicket: boolean;
    isExtra: boolean;
  } | null;
  commentary: string;
  thisOverHistory: Array<{
    label: string;
    runs: number;
    isWicket: boolean;
    isExtra: boolean;
  }>;
}

const SpinCricketPlayArea: React.FC<SpinCricketPlayAreaProps> = ({
  score,
  wickets,
  completedOvers,
  remainingBallsInOver,
  oversFormatted,
  ballsBowled,
  MAX_BALLS,
  TARGET_SCORE,
  MAX_WICKETS,
  wheelRotation,
  isSpinning,
  spinWheel,
  status,
  lastShot,
  commentary,
  thisOverHistory,
}) => {
  const { isFullscreen, availableWidth, availableHeight, orientation } = useGameViewport();

  // Wide/compact landscape detection (e.g. mobile landscape or short height)
  const isCompactHeight = availableHeight < 620;
  const isWideLandscape = orientation === 'landscape' && availableWidth >= 720 && isCompactHeight;

  // Compute responsive wheel size that maximizes screen usage while guaranteeing NO clipping
  const reservedHeight = isCompactHeight ? 130 : isFullscreen ? 230 : 190;
  const maxWheelByHeight = Math.max(200, availableHeight - reservedHeight);
  const maxWheelByWidth = Math.max(200, isWideLandscape ? availableWidth * 0.45 : availableWidth - 36);

  const wheelSize = isFullscreen
    ? Math.min(560, maxWheelByHeight, maxWheelByWidth)
    : Math.min(400, maxWheelByHeight, maxWheelByWidth);

  const centerButtonSize = Math.round(wheelSize * 0.28);

  return (
    <div
      className={`w-full h-full flex flex-col justify-between p-2 sm:p-4 select-none relative overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'max-w-5xl' : 'max-w-2xl'
      } mx-auto`}
    >
      {/* 1. CRICKET STADIUM SCOREBOARD HUD */}
      <div className="w-full shrink-0">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md text-center font-mono">
          {/* Runs & Wickets */}
          <div className="flex flex-col items-center justify-center border-r border-slate-800/80 pr-1">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">SCORE</span>
            <span className="text-base sm:text-2xl font-black text-[#00F0FF] tracking-tight">
              {score} <span className="text-xs text-red-400">/{wickets}</span>
            </span>
          </div>

          {/* Overs */}
          <div className="flex flex-col items-center justify-center border-r border-slate-800/80 px-1">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">OVERS</span>
            <span className="text-sm sm:text-xl font-black text-amber-300">
              {oversFormatted} <span className="text-[9px] sm:text-[10px] text-slate-500">/2.0</span>
            </span>
          </div>

          {/* Balls Bowled */}
          <div className="flex flex-col items-center justify-center border-r border-slate-800/80 px-1">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">BALLS</span>
            <span className="text-sm sm:text-xl font-black text-yellow-400">
              {ballsBowled} <span className="text-[9px] sm:text-[10px] text-slate-500">/{MAX_BALLS}</span>
            </span>
          </div>

          {/* Target */}
          <div className="flex flex-col items-center justify-center pl-1">
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">TARGET</span>
            <span className="text-sm sm:text-xl font-black text-emerald-400">
              {TARGET_SCORE} <span className="text-[9px] sm:text-[10px] text-slate-500 font-normal">RUNS</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN PLAYING AREA (WHEEL + CONTROLS) */}
      <div
        className={`flex-1 min-h-0 w-full flex ${
          isWideLandscape ? 'flex-row items-center justify-around gap-4' : 'flex-col items-center justify-center my-auto py-1'
        }`}
      >
        {/* PRO CRICKET SPIN DISC CONTAINER */}
        <div className="relative flex flex-col items-center justify-center shrink-0">
          {/* Stadium Light Glow Background */}
          <div
            style={{ width: `${wheelSize}px`, height: `${wheelSize}px` }}
            className="absolute inset-0 m-auto rounded-full bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.15)_0%,rgba(16,185,129,0.08)_50%,transparent_75%)] pointer-events-none blur-2xl animate-pulse"
          />

          {/* Current Ball Indicator */}
          {!isCompactHeight && (
            <div className="mb-1.5 sm:mb-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] sm:text-[11px] font-mono text-cyan-300 shadow-md shrink-0">
              <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
              <span>BALL {Math.min(MAX_BALLS, ballsBowled + 1)} OF {MAX_BALLS}</span>
            </div>
          )}

          {/* Sized Wheel Container */}
          <div
            style={{ width: `${wheelSize}px`, height: `${wheelSize}px` }}
            className="relative flex items-center justify-center transition-all duration-300"
          >
            {/* FIXED TOP POINTER */}
            <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none drop-shadow-[0_4px_12px_rgba(239,68,68,0.7)]">
              <div className="w-0 h-0 border-x-[11px] sm:border-x-[15px] border-x-transparent border-t-[22px] sm:border-t-[30px] border-t-rose-500 filter drop-shadow(0 2px 4px rgba(0,0,0,0.5))" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-300 -mt-6 sm:-mt-8 shadow-inner" />
            </div>

            {/* ROTATING RADIAL CRICKET DISC */}
            <div
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: isSpinning ? 'transform 3.2s cubic-bezier(0.12, 0.95, 0.18, 1)' : 'none',
              }}
              className="w-full h-full rounded-full relative shadow-[0_0_50px_rgba(0,0,0,0.85)] flex items-center justify-center"
            >
              {/* SVG Radial Wheel Render */}
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full rounded-full overflow-hidden select-none filter drop-shadow-2xl"
              >
                <defs>
                  {CRICKET_DISC_SLICES.map((slice, idx) => (
                    <linearGradient
                      key={`grad-${idx}`}
                      id={`slice-grad-${idx}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={slice.color} />
                      <stop offset="100%" stopColor={slice.darkColor} />
                    </linearGradient>
                  ))}
                  <radialGradient id="rim-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="90%" stopColor="#0f172a" />
                    <stop offset="96%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </radialGradient>
                </defs>

                {CRICKET_DISC_SLICES.map((slice, i) => {
                  const sliceCount = CRICKET_DISC_SLICES.length;
                  const sliceDeg = 360 / sliceCount;
                  const startAngle = i * sliceDeg;
                  const endAngle = (i + 1) * sliceDeg;
                  const midAngle = startAngle + sliceDeg / 2;

                  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
                  const r = 196;
                  const cx = 200;
                  const cy = 200;

                  const x1 = cx + r * Math.cos(toRad(startAngle));
                  const y1 = cy + r * Math.sin(toRad(startAngle));
                  const x2 = cx + r * Math.cos(toRad(endAngle));
                  const y2 = cy + r * Math.sin(toRad(endAngle));

                  const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

                  const textR = 138;
                  const tx = cx + textR * Math.cos(toRad(midAngle));
                  const ty = cy + textR * Math.sin(toRad(midAngle));

                  return (
                    <g key={slice.id + i}>
                      <path
                        d={pathData}
                        fill={`url(#slice-grad-${i})`}
                        stroke="#090d16"
                        strokeWidth="2.5"
                        className="transition-opacity duration-300"
                      />
                      <line
                        x1={cx}
                        y1={cy}
                        x2={x1}
                        y2={y1}
                        stroke="rgba(255,255,255,0.25)"
                        strokeWidth="1"
                      />
                      <g transform={`rotate(${midAngle}, ${tx}, ${ty})`}>
                        <text
                          x={tx}
                          y={ty}
                          fill={slice.textColor}
                          fontSize={slice.label.length > 5 ? '13' : '15'}
                          fontWeight="900"
                          fontFamily="monospace, sans-serif"
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            letterSpacing: '0.08em',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                          }}
                        >
                          {slice.displayLabel}
                        </text>
                      </g>
                    </g>
                  );
                })}

                <circle
                  cx="200"
                  cy="200"
                  r="196"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="6"
                  className="opacity-60"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="198"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="4"
                />
              </svg>

              {/* CENTER CIRCULAR PLAY / SPIN BUTTON */}
              <button
                onClick={spinWheel}
                disabled={isSpinning || status !== 'PLAYING' || wickets >= MAX_WICKETS || ballsBowled >= MAX_BALLS}
                style={{
                  width: `${centerButtonSize}px`,
                  height: `${centerButtonSize}px`,
                }}
                className={`absolute inset-0 m-auto rounded-full z-20 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.9)] border-4 border-cyan-400 bg-gradient-to-b from-slate-900 via-slate-950 to-black select-none ${
                  isSpinning
                    ? 'scale-95 opacity-80 border-slate-700'
                    : 'hover:scale-105 active:scale-95 hover:border-[#00F0FF] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]'
                }`}
                title="Click to Spin Cricket Disc"
              >
                <span className="text-xl sm:text-2xl leading-none filter drop-shadow">🏏</span>
                <span className="text-[10px] sm:text-xs font-black font-mono tracking-widest text-[#00F0FF] mt-0.5">
                  {isSpinning ? 'SPIN' : 'PLAY'}
                </span>
                <span className="text-[8px] font-mono text-cyan-300/70 font-bold uppercase tracking-tighter hidden sm:inline">
                  {isSpinning ? '...' : 'CLICK'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. BALL RESULT DISPLAY & COMMENTARY / CONTROLS */}
        <div
          className={`w-full shrink-0 flex flex-col justify-end space-y-1.5 sm:space-y-2 ${
            isWideLandscape ? 'max-w-xs' : 'max-w-md'
          }`}
        >
          {/* Revealed Shot Outcome Banner */}
          {lastShot && (
            <div
              className={`w-full py-2 px-3 sm:px-4 rounded-xl sm:rounded-2xl border flex items-center justify-between shadow-xl backdrop-blur-md animate-in zoom-in-95 duration-200 ${
                lastShot.isWicket
                  ? 'bg-rose-950/80 border-rose-500/80 text-rose-300'
                  : lastShot.runs === 6
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : lastShot.runs === 4
                  ? 'bg-sky-950/80 border-sky-500/80 text-sky-300'
                  : 'bg-slate-900/90 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl">
                  {lastShot.isWicket ? '🔴' : lastShot.runs >= 4 ? '🔥' : '🏏'}
                </span>
                <div>
                  <div className="text-xs font-black tracking-wider uppercase font-mono">
                    {lastShot.isWicket ? 'WICKET OUT!' : `${lastShot.label}!`}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {lastShot.sublabel}
                  </div>
                </div>
              </div>

              <div
                className={`text-sm sm:text-base font-black font-mono px-2.5 py-0.5 rounded-lg border ${
                  lastShot.isWicket
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                }`}
              >
                {lastShot.isWicket ? 'OUT' : `+${lastShot.runs}`}
              </div>
            </div>
          )}

          {/* Live Match Commentary */}
          <div className="w-full bg-slate-900/90 border border-slate-800/90 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono text-cyan-300 text-center shadow-md truncate">
            📢 {commentary}
          </div>

          {/* THIS OVER BALL HISTORY CHIPS */}
          {!isCompactHeight && (
            <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2 flex items-center justify-between shadow-inner">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider pl-1">
                THIS OVER:
              </span>

              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
                {thisOverHistory.length === 0 ? (
                  <span className="text-[10px] font-mono text-slate-600 italic">No balls bowled yet</span>
                ) : (
                  thisOverHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center font-mono font-black text-[10px] sm:text-xs border transition-all ${
                        item.isWicket
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                          : item.runs === 6
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                          : item.runs === 4
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                          : item.isExtra
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : item.runs === 0
                          ? 'bg-slate-900 border-slate-800 text-slate-500'
                          : 'bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      {item.label}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ACTION BUTTON */}
          {status === 'PLAYING' && (
            <button
              onClick={spinWheel}
              disabled={isSpinning || wickets >= MAX_WICKETS || ballsBowled >= MAX_BALLS}
              className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] border border-cyan-300 cursor-pointer disabled:opacity-40 transition-all font-display"
            >
              <span>{isSpinning ? 'BOWLER RUNNING IN...' : 'SPIN NEXT BALL 🏏'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const SpinCricketCanvas: React.FC = () => {
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [ballsBowled, setBallsBowled] = useState(0);
  const [thisOverHistory, setThisOverHistory] = useState<
    { label: string; runs: number; isWicket: boolean; isExtra: boolean }[]
  >([]);

  // Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedSlice, setSelectedSlice] = useState<CricketDiscSlice | null>(null);
  const [lastShot, setLastShot] = useState<CricketDiscSlice | null>(null);
  const [commentary, setCommentary] = useState('Step up to the crease & click SPIN to face the delivery!');
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  const MAX_BALLS = 12; // 2 Overs Match
  const MAX_WICKETS = 3;
  const TARGET_SCORE = 24;

  // Load high score
  useEffect(() => {
    const stored = user.stats.highScores?.['spin-cricket'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  // Start Game
  const handleStartGame = async () => {
    await GameSessionManager.startSession('spin-cricket', user);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
    setWickets(0);
    setBallsBowled(0);
    setThisOverHistory([]);
    setWheelRotation(0);
    setSelectedSlice(null);
    setLastShot(null);
    setCommentary('Over 1.1: New bowler running in. Click SPIN to play your shot!');
    setResultData(null);
  };

  const handlePause = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
    }
  };

  const handleResume = () => {
    if (status === 'PAUSED') {
      setStatus('PLAYING');
    }
  };

  const handleRestart = () => {
    handleStartGame();
  };

  // Spin Wheel Physics & Accurate Pointer Alignment
  const spinWheel = useCallback(() => {
    if (isSpinning || status !== 'PLAYING' || wickets >= MAX_WICKETS || ballsBowled >= MAX_BALLS) return;

    setIsSpinning(true);
    soundFx.playSpin();
    GameSessionManager.recordAction();

    // 1. Pick a slice using fair weighted random
    const sliceCount = CRICKET_DISC_SLICES.length;
    const sliceDeg = 360 / sliceCount; // 36 degrees
    const chosenIndex = Math.floor(Math.random() * sliceCount);
    const outcome = CRICKET_DISC_SLICES[chosenIndex];

    // 2. Center of slice i in local wheel coords (0° is top, slice 0 is 0°..36°, center is 18°)
    const sliceCenterAngle = chosenIndex * sliceDeg + sliceDeg / 2;

    // 3. To bring sliceCenterAngle to the TOP (0°), the wheel must be at rotation R where (R + sliceCenterAngle) % 360 == 0
    // => targetMod = (360 - sliceCenterAngle) % 360
    const targetMod = (360 - (sliceCenterAngle % 360)) % 360;

    // Current angle normalized
    const currentMod = wheelRotation % 360;
    const delta = (targetMod - currentMod + 360) % 360;

    // Add 5 to 6 full rotations (1800 deg) for dramatic realistic spin deceleration
    const fullSpins = 360 * 5;
    const nextRotation = wheelRotation + fullSpins + delta;

    setWheelRotation(nextRotation);

    // 4. Reveal outcome after deceleration duration (3.2s)
    setTimeout(async () => {
      setIsSpinning(false);
      setSelectedSlice(outcome);
      setLastShot(outcome);

      let newRuns = 0;
      let newWickets = wickets;
      let newCombo = combo;
      let isLegalBall = !outcome.isExtra;

      if (outcome.isWicket) {
        newWickets += 1;
        newCombo = 0;
        soundFx.playWrong();
        setCommentary('🔴 WICKET! Clean bowled by a fiery yorker!');
      } else if (outcome.runs === 6) {
        newRuns = 6;
        newCombo += 1;
        soundFx.playCorrect();
        soundFx.playVictory();
        setCommentary('🚀 MASSIVE SIX! Dispatched over the grandstand into orbit!');
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } else if (outcome.runs === 4) {
        newRuns = 4;
        newCombo += 1;
        soundFx.playCorrect();
        soundFx.playCoin();
        setCommentary('⚡ BOUNDARY FOUR! Pierced the gap with pure timing!');
      } else if (outcome.runs === 3) {
        newRuns = 3;
        soundFx.playCoin();
        setCommentary('🏃 Triple runs! Outstanding running between the wickets!');
      } else if (outcome.runs === 2) {
        newRuns = 2;
        soundFx.playCoin();
        setCommentary('Pushed into deep midwicket for an easy double.');
      } else if (outcome.runs === 1) {
        newRuns = 1;
        soundFx.playClick();
        if (outcome.isExtra) {
          setCommentary('⚠️ Extra run awarded! Delivery strayed wide of the crease.');
        } else {
          setCommentary('Quick single taken to keep the scoreboard ticking.');
        }
      } else {
        // Dot ball
        newCombo = 0;
        soundFx.playHit();
        setCommentary('Dot ball! Solid forward defense straight back to the bowler.');
      }

      setCombo(newCombo);
      setWickets(newWickets);
      const currentScore = score + newRuns;
      setScore(currentScore);

      const nextBalls = isLegalBall ? ballsBowled + 1 : ballsBowled;
      setBallsBowled(nextBalls);

      // Append to over history
      setThisOverHistory((prev) => [
        ...prev,
        {
          label: outcome.isWicket ? 'W' : outcome.isExtra ? (outcome.label === 'WIDE' ? 'WD' : 'NB') : `${outcome.runs}`,
          runs: outcome.runs,
          isWicket: outcome.isWicket,
          isExtra: outcome.isExtra
        }
      ]);

      // Check Match Finish
      if (newWickets >= MAX_WICKETS || nextBalls >= MAX_BALLS) {
        soundFx.playGameOver();
        const isWin = currentScore >= TARGET_SCORE;
        setStatus(isWin ? 'VICTORY' : 'GAMEOVER');

        const res = await GameSessionManager.finishSession(currentScore, isWin, user, highScore);
        setResultData(res);
        await submitGameScore('spin-cricket', currentScore, isWin);

        if (currentScore > highScore) {
          setHighScore(currentScore);
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
        }
      }
    }, 3200);
  }, [isSpinning, status, wickets, ballsBowled, wheelRotation, score, combo, highScore, user, submitGameScore]);

  // Keyboard shortcut (Space / Enter to spin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'PLAYING') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        spinWheel();
      } else if (e.key === 'Escape') {
        handlePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, spinWheel]);

  // Current Over format: e.g. 0.4
  const completedOvers = Math.floor(ballsBowled / 6);
  const remainingBallsInOver = ballsBowled % 6;
  const oversFormatted = `${completedOvers}.${remainingBallsInOver}`;

  return (
    <GameLifecycleWrapper
      gameTitle="Spin Cricket Premier League 🏏"
      gameId="spin-cricket"
      category="Arcade Cricket Strategy"
      instructions={[
        'Face a 2-over (12 balls) chase target with 3 wickets in hand.',
        'Click the central SPIN DISC button or press Spacebar to deliver each ball.',
        'Score 24+ runs to clinch the championship trophy!'
      ]}
      controls={[
        { key: 'SPACE / CLICK DISC', action: 'Spin Cricket Disc' },
        { key: 'ESC', action: 'Pause Match' }
      ]}
      status={status}
      score={score}
      highScore={highScore}
      combo={combo}
      resultData={resultData}
      onStart={handleStartGame}
      onPause={handlePause}
      onResume={handleResume}
      onRestart={handleRestart}
      preferredAspectRatio="auto"
      preferredOrientation="any"
      scalingMode="responsive"
    >
      <SpinCricketPlayArea
        score={score}
        wickets={wickets}
        completedOvers={completedOvers}
        remainingBallsInOver={remainingBallsInOver}
        oversFormatted={oversFormatted}
        ballsBowled={ballsBowled}
        MAX_BALLS={MAX_BALLS}
        TARGET_SCORE={TARGET_SCORE}
        MAX_WICKETS={MAX_WICKETS}
        wheelRotation={wheelRotation}
        isSpinning={isSpinning}
        spinWheel={spinWheel}
        status={status}
        lastShot={lastShot}
        commentary={commentary}
        thisOverHistory={thisOverHistory}
      />
    </GameLifecycleWrapper>
  );
};

