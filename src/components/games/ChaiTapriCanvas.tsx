'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';
import { Coffee, Cookie, Flame } from 'lucide-react';

interface Customer {
  id: number;
  item: 'chai' | 'samosa' | 'bun';
  patience: number;
  maxPatience: number;
  x: number;
  avatar: string;
}

export const ChaiTapriCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  const serveRef = useRef<((item: 'chai' | 'samosa' | 'bun') => void) | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = user.stats.highScores?.['chai-tapri'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const handleStartGame = async () => {
    await GameSessionManager.startSession('chai-tapri', user);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
    setTimeLeft(45);
    setResultData(null);
  };

  const handlePause = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleResume = () => {
    if (status === 'PAUSED') {
      setStatus('PLAYING');
    }
  };

  const handleRestart = () => {
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    handleStartGame();
  };

  // Main Game Loop & Logic
  useEffect(() => {
    if (status !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 480;

    let currentScore = 0;
    let localCombo = 0;
    let currentTime = 45;
    let frame = 0;
    let nextCustId = 1;

    let customers: Customer[] = [];
    let steamParticles: Array<{ x: number; y: number; vy: number; radius: number; opacity: number }> = [];

    const avatars = ['👨‍💼', '👩‍💻', '👴', '👮‍♂️', '🧑‍🎨'];
    const items: Array<'chai' | 'samosa' | 'bun'> = ['chai', 'samosa', 'bun'];

    const onGameOver = async () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      soundFx.playGameOver();
      setStatus('GAMEOVER');

      const res = await GameSessionManager.finishSession(currentScore, currentScore > 500, user, highScore);
      setResultData(res);
      await submitGameScore('chai-tapri', currentScore, currentScore > 500);

      if (currentScore > highScore) {
        setHighScore(currentScore);
        confetti({ particleCount: 50, spread: 60 });
      }
    };

    // Timer Interval
    timerIntervalRef.current = setInterval(() => {
      currentTime -= 1;
      setTimeLeft(currentTime);
      if (currentTime <= 0) {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        onGameOver();
      }
    }, 1000);

    const serveItem = (item: 'chai' | 'samosa' | 'bun') => {
      GameSessionManager.recordAction();
      const matchIdx = customers.findIndex((c) => c.item === item);

      if (matchIdx !== -1) {
        const cust = customers[matchIdx];
        const patienceBonus = Math.floor(cust.patience / 2);
        const gained = 150 + patienceBonus + localCombo * 25;
        currentScore += gained;
        localCombo += 1;
        setCombo(localCombo);
        setScore(currentScore);
        soundFx.playCorrect();

        customers.splice(matchIdx, 1);
      } else {
        // Wrong order served
        localCombo = 0;
        setCombo(0);
        soundFx.playWrong();
      }
    };
    serveRef.current = serveItem;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === 'a' || e.key === 'A') {
        serveItem('chai');
      } else if (e.key === '2' || e.key === 's' || e.key === 'S') {
        serveItem('samosa');
      } else if (e.key === '3' || e.key === 'd' || e.key === 'D') {
        serveItem('bun');
      } else if (e.code === 'Escape') {
        handlePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background - Cozy Tapri Stall
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#1c1917');
      bg.addColorStop(0.6, '#292524');
      bg.addColorStop(1, '#0c0a09');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stall Counter Top
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 310, canvas.width, 170);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(0, 310, canvas.width, 12);

      // Boiling Chai Kettle on Left
      ctx.fillStyle = '#d97706';
      ctx.fillRect(40, 240, 50, 70);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(65, 235, 25, Math.PI, 0);
      ctx.fill();

      // Steam Emitter from Kettle
      if (frame % 4 === 0) {
        steamParticles.push({
          x: 65 + (Math.random() - 0.5) * 15,
          y: 210,
          vy: -1.5 - Math.random(),
          radius: 4 + Math.random() * 6,
          opacity: 0.6,
        });
      }

      // Update & Draw Steam
      for (let i = steamParticles.length - 1; i >= 0; i--) {
        const s = steamParticles[i];
        s.y += s.vy;
        s.opacity -= 0.015;
        s.radius += 0.2;

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, s.opacity)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        if (s.opacity <= 0) steamParticles.splice(i, 1);
      }

      // Customer Queue Spawner
      if (frame % 70 === 0 && customers.length < 5) {
        customers.push({
          id: nextCustId++,
          item: items[Math.floor(Math.random() * items.length)],
          patience: 100,
          maxPatience: 100,
          x: 120 + customers.length * 130,
          avatar: avatars[Math.floor(Math.random() * avatars.length)],
        });
      }

      // Update & Draw Customers
      for (let i = customers.length - 1; i >= 0; i--) {
        const c = customers[i];
        c.x = 120 + i * 130;
        c.patience -= 0.3 + (localCombo > 3 ? 0.1 : 0);

        // Angry customer left
        if (c.patience <= 0) {
          customers.splice(i, 1);
          localCombo = 0;
          setCombo(0);
          soundFx.playWrong();
          continue;
        }

        // Draw Customer Avatar
        ctx.font = '36px sans-serif';
        ctx.fillText(c.avatar, c.x, 180);

        // Speech Bubble with Order
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(c.x - 10, 80, 60, 45, 10);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = '22px sans-serif';
        const itemEmoji = c.item === 'chai' ? '☕' : c.item === 'samosa' ? '🥟' : '🍞';
        ctx.fillText(itemEmoji, c.x + 8, 112);

        // Patience Bar
        ctx.fillStyle = '#44403c';
        ctx.fillRect(c.x - 15, 205, 70, 8);
        const pRatio = c.patience / c.maxPatience;
        ctx.fillStyle = pRatio > 0.5 ? '#22c55e' : pRatio > 0.25 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(c.x - 15, 205, 70 * pRatio, 8);
      }

      // Timer on Stall
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`⏳ TIME: ${currentTime}s`, 640, 40);

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status, highScore, user, submitGameScore]);

  return (
    <GameLifecycleWrapper
      gameTitle="Tapri Tycoon: Chai Master"
      gameId="chai-tapri"
      category="Time Management"
      instructions={[
        'Serve hot Masala Chai, Crispy Samosas, and Bun Maska before customer patience runs out!',
        'Use keyboard hotkeys [1, 2, 3] or click the food trays below.',
        'Serve fast for juicy patience bonuses and combo multipliers.',
      ]}
      controls={[
        { key: '1 / A / TAP ☕', action: 'Serve Chai' },
        { key: '2 / S / TAP 🥟', action: 'Serve Samosa' },
        { key: '3 / D / TAP 🍞', action: 'Serve Bun Maska' },
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
      <div className="relative w-full h-full flex flex-col justify-between">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {/* Interactive Bottom Serving Tray UI */}
        {status === 'PLAYING' && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
            <button
              onClick={() => serveRef.current?.('chai')}
              className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-xl border-2 border-amber-400 cursor-pointer"
            >
              <span className="text-xl">☕</span>
              <div className="text-left">
                <div className="text-[9px] text-amber-200">KEY [1]</div>
                <div>CHAI</div>
              </div>
            </button>

            <button
              onClick={() => serveRef.current?.('samosa')}
              className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-xl border-2 border-orange-400 cursor-pointer"
            >
              <span className="text-xl">🥟</span>
              <div className="text-left">
                <div className="text-[9px] text-orange-200">KEY [2]</div>
                <div>SAMOSA</div>
              </div>
            </button>

            <button
              onClick={() => serveRef.current?.('bun')}
              className="px-5 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-xl border-2 border-yellow-400 cursor-pointer"
            >
              <span className="text-xl">🍞</span>
              <div className="text-left">
                <div className="text-[9px] text-yellow-200">KEY [3]</div>
                <div>BUN MASKA</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </GameLifecycleWrapper>
  );
};
