'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';
import { Disc, Play, Sparkles } from 'lucide-react';

type ShotOutcome = '1' | '2' | '3' | '4' | '6' | 'OUT' | 'DOT';

const WHEEL_SLICES: { label: ShotOutcome; text: string; color: string }[] = [
  { label: '6', text: '6 RUNS', color: '#10b981' },
  { label: '1', text: '1 RUN', color: '#0284c7' },
  { label: 'OUT', text: 'WICKET!', color: '#ef4444' },
  { label: '4', text: '4 RUNS', color: '#06b6d4' },
  { label: '2', text: '2 RUNS', color: '#8b5cf6' },
  { label: 'DOT', text: '0 DOT', color: '#64748b' },
  { label: '3', text: '3 RUNS', color: '#f59e0b' },
  { label: '6', text: '6 RUNS', color: '#10b981' },
];

export const SpinCricketCanvas: React.FC = () => {
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [ballsBowled, setBallsBowled] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [commentary, setCommentary] = useState('Spin the wheel to face the next delivery!');
  const [lastShot, setLastShot] = useState<string | null>(null);
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  const MAX_BALLS = 12; // 2 Overs match
  const MAX_WICKETS = 3;

  useEffect(() => {
    const stored = user.stats.highScores?.['spin-cricket'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const handleStartGame = async () => {
    await GameSessionManager.startSession('spin-cricket', user);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
    setWickets(0);
    setBallsBowled(0);
    setWheelRotation(0);
    setLastShot(null);
    setCommentary('Over 1.1: Step up to the crease and spin the wheel!');
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

  // Spin Wheel Action
  const spinWheel = () => {
    if (isSpinning || status !== 'PLAYING' || wickets >= MAX_WICKETS || ballsBowled >= MAX_BALLS) return;

    setIsSpinning(true);
    soundFx.playSpin();
    GameSessionManager.recordAction();

    // Pick random slice
    const sliceIndex = Math.floor(Math.random() * WHEEL_SLICES.length);
    const sliceDeg = 360 / WHEEL_SLICES.length;
    // Calculate rotation to align selected slice at the top pointer
    const targetAngle = 360 * 5 + sliceIndex * sliceDeg + sliceDeg / 2;
    setWheelRotation((prev) => prev + targetAngle);

    setTimeout(async () => {
      setIsSpinning(false);
      const outcome = WHEEL_SLICES[sliceIndex];
      setLastShot(outcome.text);

      let newRuns = 0;
      let newWickets = wickets;
      let newCombo = combo;

      if (outcome.label === '6') {
        newRuns = 6;
        newCombo += 1;
        soundFx.playCorrect();
        soundFx.playVictory();
        setCommentary('🚀 MASSIVE SIX! Out of the stadium into the parking lot!');
        confetti({ particleCount: 40, spread: 60 });
      } else if (outcome.label === '4') {
        newRuns = 4;
        newCombo += 1;
        soundFx.playCorrect();
        soundFx.playCoin();
        setCommentary('⚡ BOUNDARY FOUR! Pierced the cover fielders!');
      } else if (outcome.label === '3') {
        newRuns = 3;
        soundFx.playCoin();
        setCommentary('🏃 Triple runs taken! Excellent running between the wickets!');
      } else if (outcome.label === '2') {
        newRuns = 2;
        soundFx.playCoin();
        setCommentary('Double runs pushed into the deep gap.');
      } else if (outcome.label === '1') {
        newRuns = 1;
        soundFx.playClick();
        setCommentary('Single rotated to the non-striker end.');
      } else if (outcome.label === 'OUT') {
        newWickets += 1;
        newCombo = 0;
        soundFx.playWrong();
        setCommentary('🔴 WICKET! Clean bowled by a vicious inswinger!');
      } else {
        newCombo = 0;
        soundFx.playHit();
        setCommentary('Dot ball! Solid defense pushed back to the bowler.');
      }

      setCombo(newCombo);
      setWickets(newWickets);
      const currentScore = score + newRuns;
      setScore(currentScore);

      const nextBalls = ballsBowled + 1;
      setBallsBowled(nextBalls);

      // Check Match Finish
      if (newWickets >= MAX_WICKETS || nextBalls >= MAX_BALLS) {
        soundFx.playGameOver();
        setStatus(currentScore >= 24 ? 'VICTORY' : 'GAMEOVER');

        const res = await GameSessionManager.finishSession(currentScore, currentScore >= 24, user, highScore);
        setResultData(res);
        await submitGameScore('spin-cricket', currentScore, currentScore >= 24);

        if (currentScore > highScore) {
          setHighScore(currentScore);
          confetti({ particleCount: 60, spread: 70 });
        }
      }
    }, 1800);
  };

  return (
    <GameLifecycleWrapper
      gameTitle="Book / Spin Cricket League"
      gameId="spin-cricket"
      category="Strategy Cricket"
      instructions={[
        'Face a 2-over (12 balls) chase with 3 wickets in hand.',
        'Click the SPIN WHEEL button or press SPACE to deliver each ball.',
        'Score 24+ runs to secure victory for your team!',
      ]}
      controls={[
        { key: 'SPACE / ENTER / CLICK', action: 'Spin Wheel' },
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
        {/* Match Scoreboard Header */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center text-xs font-mono">
          <div>
            <div className="text-[10px] text-gray-400">TOTAL RUNS</div>
            <div className="text-xl font-black text-[#00F0FF]">{score}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400">WICKETS</div>
            <div className="text-xl font-black text-red-400">
              {wickets} / {MAX_WICKETS}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400">BALLS</div>
            <div className="text-xl font-black text-yellow-400">
              {ballsBowled} / {MAX_BALLS}
            </div>
          </div>
        </div>

        {/* Dynamic Spinning Cricket Wheel */}
        <div className="relative w-52 h-52 flex items-center justify-center my-2">
          {/* Top Pointer Needle */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-[18px] border-t-red-500 drop-shadow-lg" />

          {/* Rotating Wheel */}
          <div
            style={{
              transform: `rotate(${wheelRotation}deg)`,
              transition: isSpinning ? 'transform 1.8s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
            }}
            className="w-full h-full rounded-full border-4 border-slate-800 shadow-2xl relative overflow-hidden bg-slate-900"
          >
            {WHEEL_SLICES.map((s, i) => {
              const deg = (360 / WHEEL_SLICES.length) * i;
              return (
                <div
                  key={i}
                  style={{
                    transform: `rotate(${deg}deg)`,
                    backgroundColor: s.color,
                  }}
                  className="absolute top-0 left-1/2 w-24 h-28 -ml-12 origin-bottom flex items-start justify-center pt-2 text-slate-950 font-black text-xs shadow-inner opacity-90"
                >
                  <span className="transform -rotate-90 text-[10px]">{s.text}</span>
                </div>
              );
            })}
            {/* Center Hub */}
            <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center text-xl shadow-xl z-10">
              🏏
            </div>
          </div>
        </div>

        {/* Commentary & Spin Action Button */}
        <div className="w-full max-w-md flex flex-col gap-2 items-center">
          <div className="w-full bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-cyan-300 text-center">
            📢 {commentary}
          </div>

          {status === 'PLAYING' && (
            <button
              onClick={spinWheel}
              disabled={isSpinning || wickets >= MAX_WICKETS || ballsBowled >= MAX_BALLS}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl border-2 border-cyan-300 cursor-pointer disabled:opacity-40"
            >
              <Disc className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning ? 'BOWLER DELIVERING BALL...' : 'SPIN WHEEL / FACE BALL'}
            </button>
          )}
        </div>
      </div>
    </GameLifecycleWrapper>
  );
};
