'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';
import { Zap, Bot, User } from 'lucide-react';

export const PenFlipCanvas: React.FC = () => {
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [roundsLeft, setRoundsLeft] = useState(5);
  const [power, setPower] = useState(50);
  const [isCharging, setIsCharging] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipRotation, setFlipRotation] = useState(0);
  const [flipHeight, setFlipHeight] = useState(0);
  const [roastComment, setRoastComment] = useState('Hold SPACE or CHARGE button to aim for the sweet spot!');
  const [lastOutcome, setLastOutcome] = useState<'TIP' | 'BODY' | 'FAIL' | null>(null);
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  const chargeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const powerDirRef = useRef<number>(2);

  useEffect(() => {
    const stored = user.stats.highScores?.['pen-flip'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const handleStartGame = async () => {
    await GameSessionManager.startSession('pen-flip', user);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
    setRoundsLeft(5);
    setPower(50);
    setLastOutcome(null);
    setRoastComment('Round 1/5: Charge up and land on the Reynolds pen tip!');
    setResultData(null);
  };

  const handlePause = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
      stopCharging();
    }
  };

  const handleResume = () => {
    if (status === 'PAUSED') {
      setStatus('PLAYING');
    }
  };

  const handleRestart = () => {
    stopCharging();
    handleStartGame();
  };

  // Charging oscillation
  const startCharging = () => {
    if (isFlipping || status !== 'PLAYING' || roundsLeft <= 0) return;
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

  const releaseFlip = () => {
    if (isFlipping || status !== 'PLAYING' || roundsLeft <= 0) return;
    stopCharging();
    setIsFlipping(true);
    soundFx.playFlip();
    GameSessionManager.recordAction();

    // Sweet spot is between 68 and 78
    const distanceToSweet = Math.abs(power - 73);
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
        setRoastComment('🎯 NAH THAT WAS CLEAN! PERFECT TIP LANDING!');
        confetti({ particleCount: 40, spread: 60 });
      } else if (outcome === 'BODY') {
        soundFx.playHit();
        newCombo = 0;
        roundScore = 30;
        setRoastComment('🫓 Landed flat on the body! 30 pts.');
      } else {
        soundFx.playWrong();
        newCombo = 0;
        roundScore = 0;
        setRoastComment('💀 Pen went flying to the first bench! 0 pts.');
      }

      setCombo(newCombo);
      const newScore = score + roundScore;
      setScore(newScore);

      const nextRounds = roundsLeft - 1;
      setRoundsLeft(nextRounds);

      if (nextRounds <= 0) {
        // Game Finished
        soundFx.playGameOver();
        setStatus(newScore >= 200 ? 'VICTORY' : 'GAMEOVER');

        const res = await GameSessionManager.finishSession(newScore, newScore >= 200, user, highScore);
        setResultData(res);
        await submitGameScore('pen-flip', newScore, newScore >= 200);

        if (newScore > highScore) {
          setHighScore(newScore);
          confetti({ particleCount: 60, spread: 70 });
        }
      }
    }, 900);
  };

  // Keyboard charging trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isCharging && !isFlipping && status === 'PLAYING') {
        e.preventDefault();
        startCharging();
      } else if (e.code === 'Escape') {
        handlePause();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isCharging && status === 'PLAYING') {
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
  }, [isCharging, isFlipping, status, power, roundsLeft, score, combo]);

  return (
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
        { key: 'ESC', action: 'Pause' },
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
    >
      <div className="w-full h-full flex flex-col items-center justify-between p-6 select-none">
        {/* Top Round indicator */}
        <div className="flex items-center justify-between w-full max-w-lg px-4 py-2 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300">
          <span>FLIPS LEFT: {roundsLeft} / 5</span>
          <span>{roastComment}</span>
        </div>

        {/* Classroom Desk with 3D Flipping Reynolds Pen */}
        <div className="relative w-full max-w-lg h-52 flex items-center justify-center">
          {/* Wooden Bench Surface */}
          <div className="absolute bottom-6 inset-x-8 h-10 bg-amber-900/80 border-t-4 border-amber-700 rounded-lg shadow-2xl flex items-center justify-center">
            <span className="text-[10px] text-amber-500/40 font-mono tracking-widest">
              CLASSROOM DESK • FLIP ZONE
            </span>
          </div>

          {/* Reynolds Ballpoint Pen */}
          <div
            style={{
              transform: `translateY(-${flipHeight}px) rotate(${flipRotation}deg)`,
              transition: isFlipping ? 'transform 0.85s cubic-bezier(0.2, 0.8, 0.3, 1.2)' : 'none',
            }}
            className="relative w-7 h-36 flex flex-col items-center shadow-2xl cursor-pointer"
          >
            {/* White/Blue Cap */}
            <div className="w-6 h-10 bg-blue-600 rounded-t-full border border-blue-400 relative">
              {/* Pocket Clip */}
              <div className="absolute right-0 top-2 w-1.5 h-7 bg-blue-800 rounded-r" />
            </div>
            {/* Transparent Body with Refill */}
            <div className="w-5 h-20 bg-slate-200/90 border-x border-slate-300 flex items-center justify-center">
              <div className="w-1.5 h-16 bg-blue-900 rounded-full" />
            </div>
            {/* Metal Tip */}
            <div className="w-3.5 h-6 bg-gradient-to-b from-gray-400 to-amber-300 rounded-b-full border-b-2 border-slate-900" />
          </div>
        </div>

        {/* Bottom Charging Bar & Mobile Controls */}
        <div className="w-full max-w-md flex flex-col gap-3 items-center">
          {/* Power Bar */}
          <div className="w-full bg-slate-900 h-6 rounded-xl border border-slate-800 overflow-hidden relative shadow-inner">
            {/* Sweet spot indicator (68% to 78%) */}
            <div className="absolute left-[68%] w-[12%] h-full bg-emerald-500/30 border-x-2 border-emerald-400 flex items-center justify-center text-[9px] text-emerald-300 font-bold">
              TIP
            </div>
            {/* Active meter */}
            <div
              style={{ width: `${power}%` }}
              className={`h-full transition-all duration-75 ${
                power >= 68 && power <= 80
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-cyan-500 to-amber-500'
              }`}
            />
          </div>

          {/* Charge Button for Touch */}
          {status === 'PLAYING' && (
            <button
              onMouseDown={startCharging}
              onMouseUp={releaseFlip}
              onTouchStart={startCharging}
              onTouchEnd={releaseFlip}
              disabled={isFlipping || roundsLeft <= 0}
              className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl border-2 transition-all cursor-pointer ${
                isCharging
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 scale-95'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-300 hover:scale-[1.02]'
              } disabled:opacity-40`}
            >
              <Zap className="w-4 h-4 fill-current" />
              {isCharging ? 'RELEASE TO FLIP!' : 'HOLD TO CHARGE FLIP POWER'}
            </button>
          )}
        </div>
      </div>
    </GameLifecycleWrapper>
  );
};
