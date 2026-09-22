'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';
import { ChevronUp, ChevronDown, Zap } from 'lucide-react';

export const CIDEscapeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  const currentLaneRef = useRef<number>(1);
  const triggerSmashRef = useRef<(() => void) | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = user.stats.highScores?.['cid-escape'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const handleStartGame = async () => {
    await GameSessionManager.startSession('cid-escape', user);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
    currentLaneRef.current = 1;
    setResultData(null);
  };

  const handlePause = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
  };

  const handleResume = () => {
    if (status === 'PAUSED') {
      setStatus('PLAYING');
    }
  };

  const handleRestart = () => {
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    handleStartGame();
  };

  const switchLane = (dir: 'up' | 'down') => {
    if (status !== 'PLAYING') return;
    if (dir === 'up' && currentLaneRef.current > 0) {
      currentLaneRef.current -= 1;
      soundFx.playClick();
      GameSessionManager.recordAction();
    } else if (dir === 'down' && currentLaneRef.current < 2) {
      currentLaneRef.current += 1;
      soundFx.playClick();
      GameSessionManager.recordAction();
    }
  };

  // Main Canvas Loop
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
    let speed = 6.0;
    let frame = 0;
    let screenShake = 0;

    const lanes = [100, 220, 340];

    const player = {
      x: 120,
      y: lanes[currentLaneRef.current],
      targetY: lanes[currentLaneRef.current],
      width: 48,
      height: 48,
      smashEnergy: 100,
    };

    let dayaDoors: Array<{ x: number; lane: number; smashed: boolean; width: number; height: number }> = [];
    let pradyumanLasers: Array<{ x: number; lane: number; width: number; height: number }> = [];
    let clues: Array<{ x: number; lane: number; collected: boolean }> = [];
    let particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number }> = [];

    const smash = () => {
      if (player.smashEnergy >= 30) {
        player.smashEnergy -= 30;
        soundFx.playHit();
        screenShake = 12;
        GameSessionManager.recordAction();

        // Break nearest door in same lane
        dayaDoors.forEach((d) => {
          if (d.lane === currentLaneRef.current && Math.abs(d.x - player.x) < 180) {
            d.smashed = true;
            currentScore += 100;
            localCombo += 1;
            setCombo(localCombo);
            soundFx.playCorrect();

            for (let p = 0; p < 12; p++) {
              particles.push({
                x: d.x,
                y: lanes[d.lane] + 20,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: '#f59e0b',
                life: 25,
              });
            }
          }
        });
      }
    };
    triggerSmashRef.current = smash;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        switchLane('up');
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        switchLane('down');
      } else if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        smash();
      } else if (e.code === 'Escape') {
        handlePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const onGameOver = async () => {
      soundFx.playGameOver();
      setStatus('GAMEOVER');

      const res = await GameSessionManager.finishSession(currentScore, false, user, highScore);
      setResultData(res);
      await submitGameScore('cid-escape', currentScore, false);

      if (currentScore > highScore) {
        setHighScore(currentScore);
        confetti({ particleCount: 50, spread: 60 });
      }
    };

    const loop = () => {
      frame++;

      // Smooth lane transition
      player.targetY = lanes[currentLaneRef.current];
      player.y += (player.targetY - player.y) * 0.25;

      // Recharge smash energy slowly
      if (player.smashEnergy < 100) player.smashEnergy += 0.15;

      // Screen shake effect
      ctx.save();
      if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake;
        const sy = (Math.random() - 0.5) * screenShake;
        ctx.translate(sx, sy);
        screenShake *= 0.9;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background - Dark CID Mystery Bureau
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#090514');
      bgGrad.addColorStop(0.5, '#130e29');
      bgGrad.addColorStop(1, '#090514');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw 3 High-Tech Cyber Lanes
      lanes.forEach((ly) => {
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.setLineDash([20, 15]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, ly + 24);
        ctx.lineTo(canvas.width, ly + 24);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Spawning Obstacles & Clues
      if (frame % 65 === 0) {
        const lane = Math.floor(Math.random() * 3);
        dayaDoors.push({ x: canvas.width + 40, lane, smashed: false, width: 30, height: 55 });
      }
      if (frame % 100 === 0) {
        const lane = Math.floor(Math.random() * 3);
        pradyumanLasers.push({ x: canvas.width + 40, lane, width: 45, height: 18 });
      }
      if (frame % 45 === 0) {
        const lane = Math.floor(Math.random() * 3);
        clues.push({ x: canvas.width + 30, lane, collected: false });
      }

      // 1. Draw & Update Clues (Magnifying Glasses)
      for (let i = clues.length - 1; i >= 0; i--) {
        const c = clues[i];
        c.x -= speed;
        const cy = lanes[c.lane] + 24;

        if (!c.collected) {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(c.x, cy, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('🔍', c.x - 5, cy + 3);

          // Collision with player
          if (c.lane === currentLaneRef.current && Math.abs(c.x - player.x) < 30) {
            c.collected = true;
            currentScore += 30;
            localCombo += 1;
            setCombo(localCombo);
            soundFx.playCoin();

            for (let p = 0; p < 6; p++) {
              particles.push({
                x: c.x,
                y: cy,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: '#38bdf8',
                life: 20,
              });
            }
          }
        }
        if (c.x < -30) clues.splice(i, 1);
      }

      // 2. Draw & Update Daya Doors
      for (let i = dayaDoors.length - 1; i >= 0; i--) {
        const d = dayaDoors[i];
        d.x -= speed;
        const dy = lanes[d.lane];

        if (!d.smashed) {
          // Wooden Door Frame
          ctx.fillStyle = '#78350f';
          ctx.fillRect(d.x, dy - 5, d.width, d.height);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(d.x + 3, dy - 2, d.width - 6, d.height - 6);
          // Door handle
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(d.x + 6, dy + 20, 4, 4);

          // Collision Check with un-smashed door
          if (
            d.lane === currentLaneRef.current &&
            d.x < player.x + player.width &&
            d.x + d.width > player.x
          ) {
            window.removeEventListener('keydown', handleKeyDown);
            ctx.restore();
            onGameOver();
            return;
          }
        } else {
          // Smashed debris
          ctx.fillStyle = 'rgba(120, 53, 15, 0.4)';
          ctx.fillRect(d.x, dy + 15, 20, 10);
        }

        if (d.x < -40) dayaDoors.splice(i, 1);
      }

      // 3. Draw & Update Red Lasers
      for (let i = pradyumanLasers.length - 1; i >= 0; i--) {
        const l = pradyumanLasers[i];
        l.x -= speed * 1.2;
        const ly = lanes[l.lane] + 16;

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(l.x, ly, l.width, l.height);
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(l.x + 4, ly + 4, l.width - 8, l.height - 8);

        // Laser collision
        if (
          l.lane === currentLaneRef.current &&
          l.x < player.x + player.width &&
          l.x + l.width > player.x
        ) {
          window.removeEventListener('keydown', handleKeyDown);
          ctx.restore();
          onGameOver();
          return;
        }

        if (l.x < -50) pradyumanLasers.splice(i, 1);
      }

      // 4. Draw Player (Daya Cyber Detective)
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('DAYA', player.x + 10, player.y + 28);

      // Smash Energy Bar over player
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(player.x, player.y - 12, player.width, 6);
      ctx.fillStyle = player.smashEnergy >= 30 ? '#10b981' : '#f59e0b';
      ctx.fillRect(player.x, player.y - 12, (player.width * player.smashEnergy) / 100, 6);

      // 5. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Score update
      currentScore += 1;
      speed += 0.0008;
      setScore(currentScore);

      ctx.restore();
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status, highScore, user, submitGameScore]);

  return (
    <GameLifecycleWrapper
      gameTitle="CID Escape: Daya Darwaza Todo"
      gameId="cid-escape"
      category="Action Runner"
      instructions={[
        'Switch between 3 lanes to dodge deadly red security lasers.',
        'Smash heavy doors by pressing SPACE / SMASH button when in front of them.',
        'Collect blue CID magnifying glass clues for bonus score multipliers.',
      ]}
      controls={[
        { key: '↑ / W / SWIPE UP', action: 'Move Up Lane' },
        { key: '↓ / S / SWIPE DOWN', action: 'Move Down Lane' },
        { key: 'SPACE / ENTER / SMASH', action: 'Daya Door Smash' },
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
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {/* On-Screen Mobile / Touch Controls */}
        {status === 'PLAYING' && (
          <div className="absolute right-4 bottom-4 flex flex-col items-center gap-2 z-20 sm:hidden">
            <button
              onClick={() => switchLane('up')}
              className="w-12 h-12 rounded-xl bg-purple-600/80 active:bg-purple-500 text-white flex items-center justify-center shadow-lg backdrop-blur-sm"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <button
              onClick={() => triggerSmashRef.current?.()}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 text-slate-950 font-black text-xs flex flex-col items-center justify-center shadow-xl border-2 border-yellow-300"
            >
              <Zap className="w-5 h-5 fill-current" />
              SMASH
            </button>
            <button
              onClick={() => switchLane('down')}
              className="w-12 h-12 rounded-xl bg-purple-600/80 active:bg-purple-500 text-white flex items-center justify-center shadow-lg backdrop-blur-sm"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </GameLifecycleWrapper>
  );
};
