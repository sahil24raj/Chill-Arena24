'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Zap, Bot, User, Users, Globe, Target, Sparkles } from 'lucide-react';

export const PenFlipCanvas: React.FC = () => {
  const { user, submitGameScore, openMultiplayerModal } = useAppStore();
  const { isFullscreen } = useGameViewport();

  // Mode Selection State
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [currentMode, setCurrentMode] = useState<GameModeType>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { id: user.id || 'p1', name: user.displayName || user.username || 'You', avatar: user.avatar || '🖊️', isAI: false },
    { id: 'ai-flipper', name: 'AI Bot (MED)', avatar: '🤖', isAI: true },
  ]);

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);

  // Turn and Round State
  const [roundNumber, setRoundNumber] = useState(1);
  const MAX_ROUNDS = 5;
  const [isPlayer1Turn, setIsPlayer1Turn] = useState(true);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Tips, setP1Tips] = useState(0);
  const [p2Tips, setP2Tips] = useState(0);

  // Physics & Flip State
  const [power, setPower] = useState(50);
  const [isCharging, setIsCharging] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipRotation, setFlipRotation] = useState(0);
  const [flipHeight, setFlipHeight] = useState(0);
  const [roastComment, setRoastComment] = useState('Hold SPACE or CHARGE button to aim for the sweet spot (70%-80%)!');
  const [lastOutcome, setLastOutcome] = useState<'TIP' | 'BODY' | 'FAIL' | null>(null);

  // Match End Modal State
  const [showEndModal, setShowEndModal] = useState(false);
  const [matchWinnerTitle, setMatchWinnerTitle] = useState('');
  const [matchWinnerSubtitle, setMatchWinnerSubtitle] = useState('');
  const [isMatchVictory, setIsMatchVictory] = useState(true);
  const [isMatchDraw, setIsMatchDraw] = useState(false);
  const [matchStats, setMatchStats] = useState<MatchStatItem[]>([]);

  const chargeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const powerDirRef = useRef<number>(2);

  useEffect(() => {
    const stored = user.stats.highScores?.['pen-flip'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const activePlayer = isPlayer1Turn ? players[0] : players[1];

  const handleStartGame = (mode?: GameModeType, diff?: AIDifficulty, customPlayers?: PlayerSetup[]) => {
    if (mode) setCurrentMode(mode);
    if (diff) setAiDifficulty(diff);
    if (customPlayers) setPlayers(customPlayers);

    setShowEndModal(false);
    setStatus('PLAYING');
    setCombo(0);
    setRoundNumber(1);
    setIsPlayer1Turn(true);
    setP1Score(0);
    setP2Score(0);
    setP1Tips(0);
    setP2Tips(0);
    setPower(50);
    setLastOutcome(null);
    setRoastComment(`Round 1/${MAX_ROUNDS}: ${customPlayers ? customPlayers[0].name : players[0].name} takes the first flip!`);
    GameSessionManager.startSession('pen-flip', user);
  };

  const handleModeSelection = (selection: GameModeSelection) => {
    setShowModeSelector(false);
    if (selection.mode === 'online') {
      openMultiplayerModal({
        id: 'pen-flip',
        title: 'Pen Flip Battle 🖊️',
        slug: 'pen-flip',
        tagline: 'Last Bench Physics Duel',
        description: 'Multiplayer Pen Flip',
        category: '🏫 School Vibes',
        categoryKey: 'school',
        thumbnail: '🖊️',
        bannerImage: '/games/pen-flip.jpg',
        playCount: 189000,
        rating: 4.96,
        difficulty: 'Medium',
        duration: '1-2 min',
        multiplayer: true,
        controls: ['Hold & Release to flip'],
        tags: ['School', 'Physics', 'Multiplayer'],
      });
      return;
    }
    handleStartGame(selection.mode, selection.difficulty, selection.players);
  };

  // Charging oscillation
  const startCharging = () => {
    if (isFlipping || status !== 'PLAYING') return;
    setIsCharging(true);
    soundFx.playSpin();

    if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    chargeIntervalRef.current = setInterval(() => {
      setPower((prev) => {
        let next = prev + powerDirRef.current * 3;
        if (next >= 100) {
          next = 100;
          powerDirRef.current = -1;
        } else if (next <= 10) {
          next = 10;
          powerDirRef.current = 1;
        }
        return next;
      });
    }, 20);
  };

  const stopCharging = () => {
    if (chargeIntervalRef.current) {
      clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = null;
    }
    setIsCharging(false);
  };

  const releaseFlip = (forcedPower?: number) => {
    if (isFlipping || status !== 'PLAYING') return;
    stopCharging();
    setIsFlipping(true);
    soundFx.playFlip();
    GameSessionManager.recordAction();

    const actualPower = forcedPower !== undefined ? forcedPower : power;

    // Sweet spot is between 68 and 78
    const distanceToSweet = Math.abs(actualPower - 73);
    const tipChance = distanceToSweet < 8 ? 0.85 : distanceToSweet < 18 ? 0.45 : 0.1;
    const roll = Math.random();

    let outcome: 'TIP' | 'BODY' | 'FAIL' = 'BODY';
    if (roll < tipChance) {
      outcome = 'TIP';
    } else if (roll < tipChance + 0.5) {
      outcome = 'BODY';
    } else {
      outcome = 'FAIL';
    }

    const spins = 360 * 3 + (outcome === 'TIP' ? 90 : outcome === 'FAIL' ? 180 : 0);
    setFlipRotation(spins);
    setFlipHeight(140);

    setTimeout(async () => {
      setFlipHeight(0);
      setIsFlipping(false);
      setLastOutcome(outcome);

      let roundScore = 0;
      let newCombo = combo;

      if (outcome === 'TIP') {
        soundFx.playCorrect();
        soundFx.playVictory();
        newCombo += 1;
        roundScore = 100 + newCombo * 25;
        setRoastComment(`🎯 NAH THAT WAS CLEAN! ${activePlayer.name} LANDED ON THE TIP!`);
        confetti({ particleCount: 40, spread: 60 });
      } else if (outcome === 'BODY') {
        soundFx.playHit();
        newCombo = 0;
        roundScore = 30;
        setRoastComment(`🫓 Landed flat on the body! +30 pts for ${activePlayer.name}.`);
      } else {
        soundFx.playWrong();
        newCombo = 0;
        roundScore = 0;
        setRoastComment(`💀 Pen went flying to the first bench! 0 pts.`);
      }

      setCombo(newCombo);

      if (isPlayer1Turn) {
        setP1Score((prev) => prev + roundScore);
        if (outcome === 'TIP') setP1Tips((prev) => prev + 1);
        setIsPlayer1Turn(false);
      } else {
        setP2Score((prev) => prev + roundScore);
        if (outcome === 'TIP') setP2Tips((prev) => prev + 1);

        // End of round for both players
        if (roundNumber >= MAX_ROUNDS) {
          // Finish Match
          const finalP1 = p1Score + (isPlayer1Turn ? roundScore : 0);
          const finalP2 = p2Score + (!isPlayer1Turn ? roundScore : 0);

          setStatus('GAMEOVER');
          let title = '';
          let subtitle = '';
          let isVic = false;
          let isTie = false;

          if (finalP1 > finalP2) {
            title = `🏆 ${players[0].name} Wins!`;
            subtitle = `Classroom Pen Flip Champion with ${finalP1} pts vs ${finalP2} pts!`;
            isVic = true;
          } else if (finalP1 === finalP2) {
            title = `🤝 Equal Precision Tie!`;
            subtitle = `Both players matched scores at ${finalP1} pts!`;
            isTie = true;
          } else {
            title = `🏆 ${players[1].name} Wins!`;
            subtitle = `Cleaned up the desk with ${finalP2} pts vs ${finalP1} pts!`;
            isVic = false;
          }

          setMatchWinnerTitle(title);
          setMatchWinnerSubtitle(subtitle);
          setIsMatchVictory(isVic);
          setIsMatchDraw(isTie);

          const statsList: MatchStatItem[] = [
            { label: `${players[0].name} Score`, value: finalP1, highlight: true },
            { label: `${players[1].name} Score`, value: finalP2, highlight: true },
            { label: `${players[0].name} Tips`, value: `${p1Tips + (isPlayer1Turn && outcome === 'TIP' ? 1 : 0)} / 5` },
            { label: `${players[1].name} Tips`, value: `${p2Tips + (!isPlayer1Turn && outcome === 'TIP' ? 1 : 0)} / 5` },
            { label: 'Mode', value: currentMode === 'ai' ? `VS AI (${aiDifficulty.toUpperCase()})` : 'Pass & Play' },
          ];
          setMatchStats(statsList);
          setShowEndModal(true);

          if (finalP1 > highScore) setHighScore(finalP1);
          await GameSessionManager.finishSession(finalP1, isVic, user, highScore);
          await submitGameScore('pen-flip', finalP1, isVic);
        } else {
          setRoundNumber((prev) => prev + 1);
          setIsPlayer1Turn(true);
        }
      }
    }, 900);
  };

  // AI Turn Execution in VS AI Mode
  useEffect(() => {
    if (status !== 'PLAYING' || isFlipping || isCharging || showEndModal) return;

    if (currentMode === 'ai' && !isPlayer1Turn) {
      // AI charges and flips with difficulty variance
      const delay = setTimeout(() => {
        let simulatedPower = 73;
        if (aiDifficulty === 'hard') {
          simulatedPower = 73 + (Math.random() * 8 - 4); // close to sweet spot
        } else if (aiDifficulty === 'medium') {
          simulatedPower = 73 + (Math.random() * 24 - 12);
        } else {
          simulatedPower = 40 + Math.random() * 50; // widespread error
        }
        setPower(Math.round(simulatedPower));
        releaseFlip(simulatedPower);
      }, 1000);
      return () => clearTimeout(delay);
    }
  }, [status, currentMode, isPlayer1Turn, isFlipping, isCharging, showEndModal, aiDifficulty]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'PLAYING' || isFlipping || isCharging) return;
      if (currentMode === 'ai' && !isPlayer1Turn) return; // Prevent input on AI turn

      if (e.code === 'Space') {
        e.preventDefault();
        startCharging();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (status !== 'PLAYING' || !isCharging) return;
      if (currentMode === 'ai' && !isPlayer1Turn) return;

      if (e.code === 'Space') {
        e.preventDefault();
        releaseFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, isFlipping, isCharging, currentMode, isPlayer1Turn, power]);

  return (
    <div className="w-full h-full flex flex-col justify-between select-none relative overflow-hidden">
      {/* Universal Mode Selector Modal */}
      <UniversalGameModeSelector
        gameTitle="Pen Flip Battle 🖊️"
        gameId="pen-flip"
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
        gameTitle="Pen Flip Battle 🖊️"
        gameId="pen-flip"
        winnerTitle={matchWinnerTitle}
        winnerSubtitle={matchWinnerSubtitle}
        isVictory={isMatchVictory}
        isDraw={isMatchDraw}
        stats={matchStats}
        onPlayAgain={() => handleStartGame()}
        onChangeMode={() => {
          setShowEndModal(false);
          setShowModeSelector(true);
        }}
      />

      <GameLifecycleWrapper
        gameTitle="School Pen Flip Duel"
        gameId="pen-flip"
        category="Physics Duel"
        instructions={[
          'Hold SPACE or CHARGE BUTTON to build flip power.',
          'Release when the power bar hits the GREEN SWEET SPOT (70%-80%).',
          'Land vertically on the TIP for 100+ points and combo bonuses across 5 rounds!',
        ]}
        controls={[
          { key: 'HOLD SPACE', action: 'Charge Flip Power' },
          { key: 'RELEASE SPACE', action: 'Execute Flip' },
          { key: 'ESC', action: 'Pause / Exit Fullscreen' },
        ]}
        status={status}
        score={p1Score + p2Score}
        highScore={highScore}
        combo={combo}
        onStart={() => handleStartGame()}
        onPause={() => setStatus('PAUSED')}
        onResume={() => setStatus('PLAYING')}
        onRestart={() => handleStartGame()}
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
            <span>Flipper:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <span>{activePlayer.avatar}</span>
              <span>{activePlayer.name}</span>
            </span>
          </span>
        }
      >
        <div className="w-full h-full flex flex-col justify-between p-4 select-none max-w-xl mx-auto">
          {/* Top Scoreboard */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-mono shadow-lg">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="text-base">{players[0].avatar}</span>
              <span className="font-bold">{players[0].name}: {p1Score} pts</span>
            </div>
            <span className="text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded-lg border border-yellow-400/30">
              ROUND {roundNumber} / {MAX_ROUNDS}
            </span>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="font-bold">{players[1].name}: {p2Score} pts</span>
              <span className="text-base">{players[1].avatar}</span>
            </div>
          </div>

          {/* DESK STAGE & PEN PHYSICS ANIMATION */}
          <div className="relative w-full h-56 sm:h-64 bg-gradient-to-b from-slate-950/60 to-slate-900/80 border border-slate-800 rounded-3xl flex flex-col items-center justify-end p-6 overflow-hidden my-auto shadow-inner">
            {/* Wooden Classroom Desk Line */}
            <div className="absolute bottom-6 inset-x-4 h-4 bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 rounded-lg border-t border-amber-500/40 shadow-xl" />

            {/* FLIPPING PEN ELEMENT */}
            <div
              style={{
                transform: `translateY(-${flipHeight}px) rotate(${flipRotation}deg)`,
                transition: isFlipping
                  ? 'transform 0.8s cubic-bezier(0.2, 0.8, 0.3, 1)'
                  : 'transform 0.2s ease-out',
              }}
              className="relative z-10 w-4 h-28 flex flex-col items-center filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]"
            >
              {/* Pen Tip (100 pts zone) */}
              <div className="w-1.5 h-4 bg-amber-400 rounded-t-full border border-amber-200" />
              {/* Pen Grip */}
              <div className="w-3.5 h-6 bg-cyan-500 rounded-sm shadow-inner" />
              {/* Pen Body */}
              <div className="w-3 h-14 bg-gradient-to-b from-blue-600 via-indigo-600 to-blue-700 shadow-md flex items-center justify-center">
                <span className="text-[6px] text-white font-mono font-bold rotate-90 opacity-70">
                  REYNOLDS
                </span>
              </div>
              {/* Pen Cap / Tail */}
              <div className="w-3.5 h-4 bg-blue-900 rounded-b-md" />
            </div>

            {/* Outcome Pop-up */}
            {lastOutcome && (
              <div
                className={`absolute top-4 px-4 py-1.5 rounded-full font-mono font-black text-xs uppercase tracking-wider animate-bounce shadow-lg ${
                  lastOutcome === 'TIP'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                    : lastOutcome === 'BODY'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400'
                }`}
              >
                {lastOutcome === 'TIP' ? '🎯 PERFECT TIP LANDING!' : lastOutcome === 'BODY' ? '🫓 BODY LANDING (+30)' : '💀 DESK FALL (0 PTS)'}
              </div>
            )}
          </div>

          {/* POWER METER & CONTROLS */}
          <div className="space-y-3">
            {/* Roast Commentary */}
            <div className="text-center text-xs font-mono text-cyan-300 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl shadow-md">
              {roastComment}
            </div>

            {/* Oscillating Power Bar */}
            <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2 relative">
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1 px-1">
                <span>POWER: {power}%</span>
                <span className="text-emerald-400 font-bold">SWEET SPOT: 70%-80%</span>
              </div>
              <div className="w-full h-4 bg-slate-900 rounded-xl relative overflow-hidden">
                {/* Sweet Spot Target Window */}
                <div className="absolute top-0 bottom-0 left-[68%] w-[12%] bg-emerald-500/40 border-x border-emerald-400 z-10 animate-pulse" />
                {/* Active Power Indicator Bar */}
                <div
                  style={{ width: `${power}%` }}
                  className={`h-full transition-all duration-75 rounded-xl ${
                    power >= 68 && power <= 80
                      ? 'bg-gradient-to-r from-emerald-400 to-green-300 shadow-[0_0_15px_rgba(52,211,153,0.8)]'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Charge & Flip Button */}
            {status === 'PLAYING' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onMouseDown={startCharging}
                  onMouseUp={() => releaseFlip()}
                  onTouchStart={startCharging}
                  onTouchEnd={() => releaseFlip()}
                  disabled={isFlipping || (currentMode === 'ai' && !isPlayer1Turn)}
                  className="py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black text-xs font-display uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{isCharging ? 'RELEASE TO FLIP!' : 'HOLD TO CHARGE'}</span>
                </button>

                <button
                  onClick={() => releaseFlip()}
                  disabled={isFlipping || (currentMode === 'ai' && !isPlayer1Turn)}
                  className="py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 active:scale-95 text-slate-950 font-black text-xs font-display uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Target className="w-4 h-4" />
                  <span>TAP QUICK FLIP</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </GameLifecycleWrapper>
    </div>
  );
};
