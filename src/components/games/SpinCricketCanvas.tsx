'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus } from '@/lib/game-engine/types';
import { useGameViewport } from '@/lib/game-engine/useGameViewport';
import { UniversalGameModeSelector } from '@/components/game-shell/UniversalGameModeSelector';
import { UniversalMatchEndModal, MatchStatItem } from '@/components/game-shell/UniversalMatchEndModal';
import { GameModeSelection, GameModeType, AIDifficulty, PlayerSetup } from '@/types/gameMode';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  Flame,
  RotateCcw,
  Target,
  ChevronRight,
  Bot,
  Users,
  Globe,
  Award,
  ShieldAlert,
  ArrowRight,
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
    textColor: '#ffffff',
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
    textColor: '#ffffff',
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
    textColor: '#ffffff',
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
    textColor: '#ffffff',
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
    textColor: '#e2e8f0',
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
    textColor: '#ffffff',
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
    textColor: '#0f172a',
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
    textColor: '#ffffff',
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
    textColor: '#ffffff',
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
    textColor: '#ffffff',
  },
];

interface BallRecord {
  label: string;
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
}

export const SpinCricketCanvas: React.FC = () => {
  const { user, submitGameScore, openMultiplayerModal } = useAppStore();

  // Mode Selection State
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [currentMode, setCurrentMode] = useState<GameModeType>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { id: user.id || 'p1', name: user.displayName || user.username || 'You', avatar: user.avatar || '🚀', isAI: false },
    { id: 'ai-opponent', name: 'AI Bot (MED)', avatar: '🤖', isAI: true },
  ]);

  // Game Lifecycle State
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [highScore, setHighScore] = useState(0);

  // Match State (2 Innings System)
  const [currentInnings, setCurrentInnings] = useState<1 | 2>(1);
  const [showInningsBreak, setShowInningsBreak] = useState(false);

  // Innings 1 data
  const [inn1Runs, setInn1Runs] = useState(0);
  const [inn1Wickets, setInn1Wickets] = useState(0);
  const [inn1BallsBowled, setInn1BallsBowled] = useState(0);
  const [inn1History, setInn1History] = useState<BallRecord[]>([]);

  // Innings 2 data
  const [inn2Runs, setInn2Runs] = useState(0);
  const [inn2Wickets, setInn2Wickets] = useState(0);
  const [inn2BallsBowled, setInn2BallsBowled] = useState(0);
  const [inn2History, setInn2History] = useState<BallRecord[]>([]);
  const [targetScore, setTargetScore] = useState<number | null>(null);

  // Wheel & Visual Spin State
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [lastShot, setLastShot] = useState<CricketDiscSlice | null>(null);
  const [commentary, setCommentary] = useState('Step up to the crease & click SPIN to face the delivery!');

  // Match End Summary Modal
  const [showEndModal, setShowEndModal] = useState(false);
  const [matchWinnerTitle, setMatchWinnerTitle] = useState('');
  const [matchWinnerSubtitle, setMatchWinnerSubtitle] = useState('');
  const [isMatchVictory, setIsMatchVictory] = useState(true);
  const [isMatchDraw, setIsMatchDraw] = useState(false);
  const [matchStats, setMatchStats] = useState<MatchStatItem[]>([]);

  const MAX_BALLS = 12; // 2 Overs (12 legal deliveries)
  const MAX_WICKETS = 3;

  // Viewport metrics for responsive side-by-side or stacked layout
  const { isFullscreen, availableWidth, availableHeight, orientation } = useGameViewport();

  // Load high score
  useEffect(() => {
    const stored = user.stats.highScores?.['spin-cricket'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  // Active batter & bowler based on innings
  const batter = currentInnings === 1 ? players[0] : players[1];
  const bowler = currentInnings === 1 ? players[1] : players[0];

  const currentScore = currentInnings === 1 ? inn1Runs : inn2Runs;
  const currentWickets = currentInnings === 1 ? inn1Wickets : inn2Wickets;
  const currentBalls = currentInnings === 1 ? inn1BallsBowled : inn2BallsBowled;
  const currentHistory = currentInnings === 1 ? inn1History : inn2History;

  const completedOvers = Math.floor(currentBalls / 6);
  const ballsInOver = currentBalls % 6;
  const oversFormatted = `${completedOvers}.${ballsInOver}`;

  // Start fresh match
  const startMatch = (mode?: GameModeType, diff?: AIDifficulty, customPlayers?: PlayerSetup[]) => {
    if (mode) setCurrentMode(mode);
    if (diff) setAiDifficulty(diff);
    if (customPlayers) setPlayers(customPlayers);

    setCurrentInnings(1);
    setShowInningsBreak(false);
    setShowEndModal(false);
    setInn1Runs(0);
    setInn1Wickets(0);
    setInn1BallsBowled(0);
    setInn1History([]);
    setInn2Runs(0);
    setInn2Wickets(0);
    setInn2BallsBowled(0);
    setInn2History([]);
    setTargetScore(null);
    setWheelRotation(0);
    setLastShot(null);
    setIsSpinning(false);
    setCommentary(`Innings 1 Begins! ${customPlayers ? customPlayers[0].name : players[0].name} steps up to bat.`);
    setStatus('PLAYING');
    GameSessionManager.startSession('spin-cricket', user);
  };

  const handleModeSelection = (selection: GameModeSelection) => {
    setShowModeSelector(false);
    if (selection.mode === 'online') {
      openMultiplayerModal({
        id: 'spin-cricket',
        title: 'Spin Cricket (Book Cricket) 🏏',
        slug: 'spin-cricket',
        tagline: 'Multiplayer Spinner Duel',
        description: 'Spin Cricket multiplayer',
        category: '🏫 School Vibes',
        categoryKey: 'school',
        thumbnail: '🏏',
        bannerImage: '/games/spin-cricket.jpg',
        playCount: 172000,
        rating: 4.94,
        difficulty: 'Easy',
        duration: '1-3 min',
        multiplayer: true,
        controls: ['Click SPIN to deliver shot'],
        tags: ['Cricket', 'Multiplayer'],
      });
      return;
    }
    startMatch(selection.mode, selection.difficulty, selection.players);
  };

  // Switch to Innings 2
  const handleProceedToInnings2 = () => {
    setShowInningsBreak(false);
    setCurrentInnings(2);
    setLastShot(null);
    setCommentary(`Innings 2 Chase! Target is ${targetScore} runs. ${players[1].name} takes the crease!`);
  };

  // Spin Wheel Mechanism (Accurate pointer alignment)
  const executeSpin = useCallback(
    (isAutomaticAITurn = false) => {
      if (
        isSpinning ||
        status !== 'PLAYING' ||
        showInningsBreak ||
        showEndModal ||
        currentWickets >= MAX_WICKETS ||
        currentBalls >= MAX_BALLS
      ) {
        return;
      }

      setIsSpinning(true);
      soundFx.playSpin();
      GameSessionManager.recordAction();

      // 1. Pick slice (AI adjusted or fair weighted)
      const sliceCount = CRICKET_DISC_SLICES.length;
      const sliceDeg = 360 / sliceCount; // 36°

      let chosenIndex: number;
      if (isAutomaticAITurn) {
        // AI difficulty influences slice distribution
        if (aiDifficulty === 'hard') {
          // Hard AI: Higher boundary weight
          const pool = [0, 0, 1, 1, 2, 7, 9, 9, 3, 5]; // 0=SIX, 1=FOUR, 7=DOUBLE, 9=FOUR
          chosenIndex = pool[Math.floor(Math.random() * pool.length)];
        } else if (aiDifficulty === 'easy') {
          // Easy AI: Higher chance of out or dot
          const pool = [4, 4, 8, 8, 2, 2, 1, 3, 4, 8]; // 4=DOT, 8=OUT, 2=SINGLE
          chosenIndex = pool[Math.floor(Math.random() * pool.length)];
        } else {
          chosenIndex = Math.floor(Math.random() * sliceCount);
        }
      } else {
        chosenIndex = Math.floor(Math.random() * sliceCount);
      }

      const outcome = CRICKET_DISC_SLICES[chosenIndex];

      // 2. Geometry: midAngle of slice i is i * 36 + 18
      const midAngle = chosenIndex * sliceDeg + sliceDeg / 2;
      // To bring midAngle to top (0°), wheel must be rotated by targetMod where (midAngle + R) % 360 = 0
      const targetMod = (360 - (midAngle % 360)) % 360;
      const currentMod = wheelRotation % 360;
      const delta = (targetMod - currentMod + 360) % 360;

      // 5 full dramatic revolutions (1800°)
      const nextRotation = wheelRotation + 1800 + delta;
      setWheelRotation(nextRotation);

      // 3. Reveal outcome after deceleration (3s)
      setTimeout(async () => {
        setIsSpinning(false);
        setLastShot(outcome);

        const isLegalBall = !outcome.isExtra;
        const runsAdded = outcome.runs;
        const isOut = outcome.isWicket;

        // Sound & Commentary
        if (isOut) {
          soundFx.playWrong();
          setCommentary(`🔴 WICKET! Clean bowled! Timber disturbed!`);
        } else if (outcome.runs === 6) {
          soundFx.playCorrect();
          soundFx.playVictory();
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          setCommentary(`🚀 MAXIMUM SIX! Sent soaring out of the stadium!`);
        } else if (outcome.runs === 4) {
          soundFx.playCorrect();
          soundFx.playCoin();
          setCommentary(`⚡ BOUNDARY FOUR! Pierced through covers with pinpoint precision!`);
        } else if (outcome.runs === 3) {
          soundFx.playCoin();
          setCommentary(`🏃 Triple runs! Outstanding running between the wickets!`);
        } else if (outcome.runs === 2) {
          soundFx.playCoin();
          setCommentary(`Pushed into deep midwicket for an easy double.`);
        } else if (outcome.runs === 1) {
          soundFx.playClick();
          if (outcome.isExtra) {
            setCommentary(`⚠️ Extra run awarded (${outcome.label})! Free delivery!`);
          } else {
            setCommentary(`Quick single taken to keep the strike rotating.`);
          }
        } else {
          soundFx.playHit();
          setCommentary(`Dot ball! Defensive block straight back to the bowler.`);
        }

        const ballRecord: BallRecord = {
          label: outcome.isWicket ? 'W' : outcome.isExtra ? (outcome.label === 'WIDE' ? 'WD' : 'NB') : `${outcome.runs}`,
          runs: outcome.runs,
          isWicket: outcome.isWicket,
          isExtra: outcome.isExtra,
        };

        if (currentInnings === 1) {
          const nextRuns = inn1Runs + runsAdded;
          const nextWickets = inn1Wickets + (isOut ? 1 : 0);
          const nextBalls = isLegalBall ? inn1BallsBowled + 1 : inn1BallsBowled;

          setInn1Runs(nextRuns);
          setInn1Wickets(nextWickets);
          setInn1BallsBowled(nextBalls);
          setInn1History((prev) => [...prev, ballRecord]);

          // Check Innings 1 completion
          if (nextWickets >= MAX_WICKETS || nextBalls >= MAX_BALLS) {
            const calculatedTarget = nextRuns + 1;
            setTargetScore(calculatedTarget);
            setShowInningsBreak(true);
            soundFx.playLevelUp();
            setCommentary(`Innings 1 Over! Target set to ${calculatedTarget} runs. Time for ${players[1].name} to chase!`);
          }
        } else {
          // Innings 2 (Chase)
          const nextRuns = inn2Runs + runsAdded;
          const nextWickets = inn2Wickets + (isOut ? 1 : 0);
          const nextBalls = isLegalBall ? inn2BallsBowled + 1 : inn2BallsBowled;

          setInn2Runs(nextRuns);
          setInn2Wickets(nextWickets);
          setInn2BallsBowled(nextBalls);
          setInn2History((prev) => [...prev, ballRecord]);

          const target = targetScore || inn1Runs + 1;

          // Check if chased or match ended
          const targetReached = nextRuns >= target;
          const inningsEnded = nextWickets >= MAX_WICKETS || nextBalls >= MAX_BALLS;

          if (targetReached || inningsEnded) {
            // Match Finished!
            setStatus('GAMEOVER');
            let winnerTitle = '';
            let winnerSubtitle = '';
            let isVic = false;
            let isDr = false;

            if (targetReached) {
              const wktsLeft = MAX_WICKETS - nextWickets;
              winnerTitle = `🏆 ${players[1].name} Wins!`;
              winnerSubtitle = `Chased down ${target} runs with ${wktsLeft} wicket${wktsLeft === 1 ? '' : 's'} remaining!`;
              isVic = players[1].id === user.id;
            } else if (nextRuns === target - 1) {
              winnerTitle = `🤝 THRILLING TIE MATCH!`;
              winnerSubtitle = `Both teams scored ${inn1Runs} runs! A nail-biting dead heat!`;
              isDr = true;
            } else {
              const margin = target - 1 - nextRuns;
              winnerTitle = `🏆 ${players[0].name} Wins!`;
              winnerSubtitle = `Successfully defended ${inn1Runs} runs by ${margin} run${margin === 1 ? '' : 's'}!`;
              isVic = players[0].id === user.id;
            }

            setMatchWinnerTitle(winnerTitle);
            setMatchWinnerSubtitle(winnerSubtitle);
            setIsMatchVictory(isVic);
            setIsMatchDraw(isDr);

            const statsList: MatchStatItem[] = [
              { label: `${players[0].name} (Inn 1)`, value: `${inn1Runs}/${inn1Wickets} (${Math.floor(inn1BallsBowled/6)}.${inn1BallsBowled%6} ov)`, highlight: true },
              { label: `${players[1].name} (Inn 2)`, value: `${nextRuns}/${nextWickets} (${Math.floor(nextBalls/6)}.${nextBalls%6} ov)`, highlight: true },
              { label: 'Target', value: `${target} Runs` },
              { label: 'Mode', value: currentMode === 'ai' ? `VS AI (${aiDifficulty.toUpperCase()})` : 'Pass & Play' },
              { label: 'Run Rate', value: ((nextRuns / Math.max(1, nextBalls)) * 6).toFixed(1) },
              { label: 'Match Status', value: targetReached ? 'Target Chased' : 'Defended' },
            ];
            setMatchStats(statsList);
            setShowEndModal(true);

            // Record score
            const userScore = currentMode === 'pass-and-play' ? Math.max(inn1Runs, nextRuns) : inn1Runs;
            if (userScore > highScore) {
              setHighScore(userScore);
            }
            await GameSessionManager.finishSession(userScore, isVic, user, highScore);
            await submitGameScore('spin-cricket', userScore, isVic);
          }
        }
      }, 3000);
    },
    [
      isSpinning,
      status,
      showInningsBreak,
      showEndModal,
      currentWickets,
      currentBalls,
      currentInnings,
      inn1Runs,
      inn1Wickets,
      inn1BallsBowled,
      inn2Runs,
      inn2Wickets,
      inn2BallsBowled,
      targetScore,
      wheelRotation,
      aiDifficulty,
      players,
      user,
      highScore,
      submitGameScore,
    ]
  );

  // AI Turn Autopilot in VS AI Mode
  useEffect(() => {
    if (status !== 'PLAYING' || isSpinning || showInningsBreak || showEndModal) return;

    // Check if current batter is AI
    if (batter.isAI) {
      const delay = setTimeout(() => {
        executeSpin(true);
      }, 1200);
      return () => clearTimeout(delay);
    }
  }, [status, isSpinning, showInningsBreak, showEndModal, batter, executeSpin]);

  // Keyboard shortcut (Space / Enter to spin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'PLAYING' || showInningsBreak || showEndModal || isSpinning) return;
      if (batter.isAI) return; // Don't allow manual spin on AI turn

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        executeSpin(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, showInningsBreak, showEndModal, isSpinning, batter, executeSpin]);

  // Responsive Wheel Sizing
  // In fullscreen desktop (width >= 860), wheel & panel are side by side!
  const isDesktopSideBySide = availableWidth >= 860;
  const maxWheelSize = isDesktopSideBySide
    ? Math.min(520, availableHeight - 160, availableWidth * 0.48)
    : Math.min(380, availableHeight - 280, availableWidth - 32);
  const wheelSize = Math.max(220, Math.round(maxWheelSize));
  const centerButtonSize = Math.max(54, Math.round(wheelSize * 0.28));

  return (
    <div className="w-full h-full flex flex-col justify-between select-none relative overflow-hidden">
      {/* Universal Mode Selector Modal */}
      <UniversalGameModeSelector
        gameTitle="Spin Cricket (Book Cricket) 🏏"
        gameId="spin-cricket"
        user={user}
        isOpen={showModeSelector}
        onClose={() => setShowModeSelector(false)}
        onSelectMode={handleModeSelection}
        supportsAI={true}
        supportsPassAndPlay={true}
        supportsOnline={true}
        maxPassAndPlayPlayers={2}
      />

      {/* Universal Match End Modal */}
      <UniversalMatchEndModal
        isOpen={showEndModal}
        gameTitle="Spin Cricket (Book Cricket) 🏏"
        gameId="spin-cricket"
        winnerTitle={matchWinnerTitle}
        winnerSubtitle={matchWinnerSubtitle}
        isVictory={isMatchVictory}
        isDraw={isMatchDraw}
        stats={matchStats}
        onPlayAgain={() => startMatch()}
        onChangeMode={() => {
          setShowEndModal(false);
          setShowModeSelector(true);
        }}
      />

      <GameLifecycleWrapper
        gameTitle="Spin Cricket Premier League 🏏"
        gameId="spin-cricket"
        category="School Vibes & Strategy"
        instructions={[
          'Spin the iconic circular cricket roulette to play shots (1, 2, 3, 4, 6, WIDE, NO BALL, or OUT).',
          'Two Innings Match: Score runs in Innings 1, then defend or chase target in Innings 2!',
          'Wides & No Balls award +1 Extra and do not count toward your 12 legal balls.',
        ]}
        controls={[
          { key: 'SPACE / CLICK CENTER', action: 'Spin Cricket Disc' },
          { key: 'ESC', action: 'Pause / Exit Fullscreen' },
        ]}
        status={status}
        score={inn1Runs + inn2Runs}
        highScore={highScore}
        onStart={() => startMatch()}
        onPause={() => setStatus('PAUSED')}
        onResume={() => setStatus('PLAYING')}
        onRestart={() => startMatch()}
        onChangeMode={() => setShowModeSelector(true)}
        modeBadge={
          <span className="px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-[#00F0FF] text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
            {currentMode === 'ai' ? (
              <>
                <Bot className="w-3 h-3" />
                <span>VS AI ({aiDifficulty})</span>
              </>
            ) : currentMode === 'pass-and-play' ? (
              <>
                <Users className="w-3 h-3 text-purple-400" />
                <span className="text-purple-300">Pass & Play</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3 text-lime-400" />
                <span className="text-lime-300">Online Room</span>
              </>
            )}
          </span>
        }
        activePlayerInfo={
          <span className="text-[10px] font-mono text-gray-300 flex items-center gap-1">
            <span>Batter:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <span>{batter.avatar}</span>
              <span>{batter.name}</span>
            </span>
          </span>
        }
      >
        <div className="w-full h-full flex flex-col justify-between p-2 sm:p-4 select-none relative overflow-hidden max-w-5xl mx-auto">
          {/* ========================================================= */}
          {/* 1. TOP CRICKET SCOREBOARD HUD */}
          {/* ========================================================= */}
          <div className="w-full shrink-0 mb-2">
            <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2 font-mono">
                {/* Innings & Current Batsman / Bowler */}
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold tracking-wider uppercase">
                    INNINGS {currentInnings} OF 2
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-400 text-[10px]">BAT:</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      <span>{batter.avatar}</span>
                      <span>{batter.name}</span>
                      {batter.isAI && <span className="text-[9px] text-cyan-400 font-normal">(BOT)</span>}
                    </span>
                    <span className="text-gray-600">vs</span>
                    <span className="text-gray-400 text-[10px]">BOWL:</span>
                    <span className="font-bold text-gray-300 flex items-center gap-1">
                      <span>{bowler.avatar}</span>
                      <span>{bowler.name}</span>
                    </span>
                  </div>
                </div>

                {/* Target Information (if Innings 2) */}
                {currentInnings === 2 && targetScore && (
                  <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-xs font-mono">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300 font-bold">
                      TARGET: {targetScore} | NEED {Math.max(0, targetScore - inn2Runs)} RUNS IN{' '}
                      {Math.max(0, MAX_BALLS - inn2BallsBowled)} BALLS
                    </span>
                  </div>
                )}
              </div>

              {/* Scoreboard Metrics Bar */}
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                {/* Runs & Wickets */}
                <div className="flex flex-col items-center justify-center border-r border-slate-800/80 pr-1">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    RUNS / WKTS
                  </span>
                  <span className="text-lg sm:text-2xl font-black text-[#00F0FF] tracking-tight">
                    {currentScore}{' '}
                    <span className="text-xs sm:text-sm text-rose-400">/{currentWickets}</span>
                  </span>
                </div>

                {/* Overs */}
                <div className="flex flex-col items-center justify-center border-r border-slate-800/80 px-1">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    OVERS
                  </span>
                  <span className="text-base sm:text-xl font-black text-amber-300">
                    {oversFormatted}{' '}
                    <span className="text-[10px] sm:text-xs text-slate-500">/2.0</span>
                  </span>
                </div>

                {/* Legal Balls */}
                <div className="flex flex-col items-center justify-center border-r border-slate-800/80 px-1">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    LEGAL BALLS
                  </span>
                  <span className="text-base sm:text-xl font-black text-yellow-400">
                    {currentBalls}{' '}
                    <span className="text-[10px] sm:text-xs text-slate-500">/{MAX_BALLS}</span>
                  </span>
                </div>

                {/* Innings 1 / Target */}
                <div className="flex flex-col items-center justify-center pl-1">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {currentInnings === 1 ? 'INN 1 TARGET' : 'TARGET'}
                  </span>
                  <span className="text-base sm:text-xl font-black text-emerald-400">
                    {currentInnings === 1 ? 'SET SCORE' : `${targetScore} RUNS`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. MAIN PLAYING AREA (SIDE-BY-SIDE ON DESKTOP, STACKED ON MOBILE) */}
          {/* ========================================================= */}
          <div
            className={`flex-1 min-h-0 w-full flex ${
              isDesktopSideBySide
                ? 'flex-row items-center justify-around gap-6'
                : 'flex-col items-center justify-center gap-3 my-auto'
            }`}
          >
            {/* WHEEL CONTAINER */}
            <div className="relative flex flex-col items-center justify-center shrink-0">
              {/* Stadium Light Glow Background */}
              <div
                style={{ width: `${wheelSize}px`, height: `${wheelSize}px` }}
                className="absolute inset-0 m-auto rounded-full bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.2)_0%,rgba(16,185,129,0.1)_50%,transparent_75%)] pointer-events-none blur-3xl animate-pulse"
              />

              {/* Top Turn Indicator Badge */}
              <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] sm:text-xs font-mono shadow-md shrink-0">
                {batter.isAI ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-amber-300 font-bold">AI Bowler Running In...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-300 font-bold">
                      {batter.name}'s Turn • Ball {Math.min(MAX_BALLS, currentBalls + 1)} of {MAX_BALLS}
                    </span>
                  </>
                )}
              </div>

              {/* Sized Wheel Container with Razor-Sharp SVG Graphics */}
              <div
                style={{ width: `${wheelSize}px`, height: `${wheelSize}px` }}
                className="relative flex items-center justify-center transition-all duration-300"
              >
                {/* FIXED TOP POINTER */}
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none drop-shadow-[0_4px_12px_rgba(239,68,68,0.8)]">
                  <div className="w-0 h-0 border-x-[12px] sm:border-x-[16px] border-x-transparent border-t-[24px] sm:border-t-[32px] border-t-rose-500 filter drop-shadow(0 2px 4px rgba(0,0,0,0.6))" />
                  <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-amber-300 -mt-7 sm:-mt-9 shadow-inner" />
                </div>

                {/* ROTATING RADIAL CRICKET DISC */}
                <div
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transition: isSpinning ? 'transform 3.0s cubic-bezier(0.12, 0.95, 0.18, 1)' : 'none',
                  }}
                  className="w-full h-full rounded-full relative shadow-[0_0_50px_rgba(0,0,0,0.85)] flex items-center justify-center"
                >
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
                    onClick={() => executeSpin(false)}
                    disabled={isSpinning || status !== 'PLAYING' || batter.isAI}
                    style={{
                      width: `${centerButtonSize}px`,
                      height: `${centerButtonSize}px`,
                    }}
                    className={`absolute inset-0 m-auto rounded-full z-20 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.9)] border-4 border-cyan-400 bg-gradient-to-b from-slate-900 via-slate-950 to-black select-none ${
                      isSpinning || batter.isAI
                        ? 'scale-95 opacity-80 border-slate-700 cursor-not-allowed'
                        : 'hover:scale-105 active:scale-95 hover:border-[#00F0FF] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]'
                    }`}
                    title={batter.isAI ? 'AI Opponent is Facing the Delivery' : 'Click to Spin Cricket Disc'}
                  >
                    <span className="text-lg sm:text-2xl leading-none filter drop-shadow">🏏</span>
                    <span className="text-[10px] sm:text-xs font-black font-mono tracking-widest text-[#00F0FF] mt-0.5">
                      {isSpinning ? 'SPIN' : batter.isAI ? 'BOT' : 'PLAY'}
                    </span>
                    <span className="text-[8px] font-mono text-cyan-300/70 font-bold uppercase tracking-tighter hidden sm:inline">
                      {isSpinning ? '...' : batter.isAI ? 'AUTO' : 'CLICK'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* RESPONSIVE RESULT, COMMENTARY & ACTION PANEL */}
            <div
              className={`w-full flex flex-col justify-center space-y-2.5 ${
                isDesktopSideBySide ? 'max-w-sm' : 'max-w-md'
              }`}
            >
              {/* Revealed Shot Outcome Banner */}
              {lastShot ? (
                <div
                  className={`w-full py-2.5 px-3.5 sm:px-4 rounded-2xl border flex items-center justify-between shadow-xl backdrop-blur-md animate-in zoom-in-95 duration-200 ${
                    lastShot.isWicket
                      ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                      : lastShot.runs === 6
                      ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : lastShot.runs === 4
                      ? 'bg-sky-950/80 border-sky-500/80 text-sky-300 shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                      : 'bg-slate-900/90 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl sm:text-2xl">
                      {lastShot.isWicket ? '🔴' : lastShot.runs >= 4 ? '🔥' : '🏏'}
                    </span>
                    <div>
                      <div className="text-xs sm:text-sm font-black tracking-wider uppercase font-mono">
                        {lastShot.isWicket ? 'WICKET OUT!' : `${lastShot.label}!`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{lastShot.sublabel}</div>
                    </div>
                  </div>

                  <div
                    className={`text-sm sm:text-base font-black font-mono px-3 py-1 rounded-xl border ${
                      lastShot.isWicket
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    }`}
                  >
                    {lastShot.isWicket ? 'OUT' : `+${lastShot.runs}`}
                  </div>
                </div>
              ) : (
                <div className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs font-mono text-gray-400">
                  Awaiting Delivery Shot...
                </div>
              )}

              {/* Live Match Commentary with Full Visibility */}
              <div className="w-full bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 rounded-2xl text-xs font-mono text-cyan-300 shadow-md flex items-start gap-2">
                <span className="shrink-0 text-base">📢</span>
                <span className="leading-snug">{commentary}</span>
              </div>

              {/* Over Timeline Chips */}
              <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between shadow-inner">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider pl-1 shrink-0">
                  OVER LOG:
                </span>

                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
                  {currentHistory.length === 0 ? (
                    <span className="text-[10px] font-mono text-slate-600 italic">No deliveries bowled yet</span>
                  ) : (
                    currentHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-mono font-black text-[10px] sm:text-xs border transition-all ${
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

              {/* Primary Action Button */}
              {status === 'PLAYING' && (
                <button
                  onClick={() => executeSpin(false)}
                  disabled={isSpinning || batter.isAI || currentWickets >= MAX_WICKETS || currentBalls >= MAX_BALLS}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] border border-cyan-300 cursor-pointer disabled:opacity-40 transition-all font-display"
                >
                  <span>
                    {isSpinning
                      ? 'WHEEL SPINNING...'
                      : batter.isAI
                      ? 'AI BOWL IN PROGRESS...'
                      : 'SPIN NEXT BALL 🏏'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. INNINGS BREAK OVERLAY */}
          {/* ========================================================= */}
          {showInningsBreak && (
            <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-xl shadow-yellow-500/20 mb-3 animate-bounce">
                🏏
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                INNINGS BREAK
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide mt-1">
                TARGET SET: {targetScore} RUNS
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-sm mt-2 font-sans">
                {players[0].name} completed Innings 1 scoring{' '}
                <span className="text-[#00F0FF] font-bold">{inn1Runs}/{inn1Wickets}</span>.
                Now {players[1].name} must score{' '}
                <span className="text-emerald-400 font-bold">{targetScore} runs</span> in 12 balls to win!
              </p>

              <div className="my-5 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-gray-400 max-w-sm w-full space-y-1">
                <div className="flex justify-between">
                  <span>Innings 1 Run Rate:</span>
                  <span className="text-white font-bold">
                    {((inn1Runs / Math.max(1, inn1BallsBowled)) * 6).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Required Run Rate:</span>
                  <span className="text-amber-400 font-bold">
                    {(((targetScore || 0) / 12) * 6).toFixed(1)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToInnings2}
                className="py-3 px-8 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-xs font-display uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] active:scale-95 transition-all cursor-pointer"
              >
                <span>PROCEED TO INNINGS 2 (CHASE)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </GameLifecycleWrapper>
    </div>
  );
};
