'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';

export const ModiRunCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = user.stats.highScores?.['modi-run'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const handleStartGame = async () => {
    await GameSessionManager.startSession('modi-run', user);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
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

  // Main Canvas Game Loop
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
    let gameSpeed = 5.5;
    let spawnTimer = 0;
    let runCycle = 0;

    const player = {
      x: 120,
      y: 340,
      width: 44,
      height: 60,
      vy: 0,
      gravity: 0.65,
      jumping: false,
      groundY: 340,
    };

    const acpChaser = {
      x: 25,
      y: 340,
      width: 44,
      height: 60,
    };

    let obstacles: Array<{ x: number; y: number; width: number; height: number; type: 'mic' | 'tomato' }> = [];
    let coins: Array<{ x: number; y: number; radius: number; collected: boolean }> = [];
    let particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number }> = [];

    const jump = () => {
      if (!player.jumping) {
        player.vy = -13.5;
        player.jumping = true;
        soundFx.playJump();
        GameSessionManager.recordAction();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        jump();
      } else if (e.code === 'Escape') {
        handlePause();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };

    const handleMouseDown = () => {
      jump();
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);

    const onGameOver = async () => {
      soundFx.playGameOver();
      setStatus('GAMEOVER');

      const res = await GameSessionManager.finishSession(currentScore, false, user, highScore);
      setResultData(res);
      await submitGameScore('modi-run', currentScore, false);

      if (currentScore > highScore) {
        setHighScore(currentScore);
        confetti({ particleCount: 50, spread: 60 });
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      spawnTimer++;
      runCycle += 0.2;

      // 1. Draw Parallax Background (Delhi Parliament / Metro vibe)
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.7, '#1e1b4b');
      grad.addColorStop(1, '#312e81');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant building silhouettes
      ctx.fillStyle = '#1e1b4b';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(i * 150 - ((spawnTimer * 0.5) % 150), 200, 110, 200);
      }

      // Ground pavement
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 400, canvas.width, 80);
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(0, 398, canvas.width, 2);

      // Road markings
      ctx.fillStyle = '#475569';
      for (let i = 0; i < 10; i++) {
        ctx.fillRect(i * 90 - ((spawnTimer * gameSpeed) % 90), 435, 45, 6);
      }

      // 2. Physics & Player Update
      player.y += player.vy;
      player.vy += player.gravity;

      if (player.y >= player.groundY) {
        player.y = player.groundY;
        player.vy = 0;
        player.jumping = false;
      }

      // Draw ACP Chaser
      ctx.fillStyle = '#475569'; // Suit
      ctx.fillRect(acpChaser.x, acpChaser.y + 10, acpChaser.width, acpChaser.height - 20);
      ctx.fillStyle = '#fed7aa'; // Face
      ctx.fillRect(acpChaser.x + 8, acpChaser.y - 2, 28, 16);
      ctx.fillStyle = '#1e293b'; // Mustache
      ctx.fillRect(acpChaser.x + 14, acpChaser.y + 8, 16, 4);

      // ACP speech bubble
      if (spawnTimer % 180 < 40) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(acpChaser.x - 10, acpChaser.y - 35, 120, 22);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('DAYA, ROKO ISSE!', acpChaser.x - 5, acpChaser.y - 20);
      }

      // Draw Modi Player Avatar
      ctx.fillStyle = '#f97316'; // Saffron jacket
      ctx.fillRect(player.x, player.y + 8, player.width, player.height - 20);
      ctx.fillStyle = '#ffffff'; // White Kurta
      ctx.fillRect(player.x + 4, player.y + 24, player.width - 8, player.height - 36);

      // Legs
      const legOffset = player.jumping ? 0 : Math.sin(runCycle) * 8;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(player.x + 6, player.y + 45, 10, 15 + legOffset);
      ctx.fillRect(player.x + 28, player.y + 45, 10, 15 - legOffset);

      // Face, beard & glasses
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(player.x + 8, player.y - 4, 28, 16);
      ctx.fillStyle = '#000000';
      ctx.fillRect(player.x + 12, player.y + 2, 8, 4);
      ctx.fillRect(player.x + 24, player.y + 2, 8, 4);
      ctx.fillStyle = '#f1f5f9'; // Beard
      ctx.fillRect(player.x + 10, player.y + 8, 24, 7);

      // 3. Obstacle Spawning & Update
      if (spawnTimer % 80 === 0) {
        const type = Math.random() > 0.5 ? 'mic' : 'tomato';
        obstacles.push({
          x: canvas.width + 20,
          y: type === 'mic' ? 350 : 330,
          width: 26,
          height: 50,
          type,
        });
      }

      // Coins Spawning
      if (spawnTimer % 60 === 0) {
        coins.push({
          x: canvas.width + 20,
          y: 260 + Math.random() * 80,
          radius: 12,
          collected: false,
        });
      }

      // Update Obstacles & Collision Check
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;

        if (obs.type === 'mic') {
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(obs.x + 8, obs.y + 10, 10, 40);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(obs.x + 13, obs.y + 10, 12, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(obs.x + 13, obs.y + 25, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hitbox Collision
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y < obs.y + obs.height &&
          player.y + player.height > obs.y
        ) {
          window.removeEventListener('keydown', handleKeyDown);
          canvas.removeEventListener('touchstart', handleTouchStart);
          canvas.removeEventListener('mousedown', handleMouseDown);
          onGameOver();
          return;
        }

        if (obs.x < -40) obstacles.splice(i, 1);
      }

      // Update Coins
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        c.x -= gameSpeed;

        if (!c.collected) {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('₹', c.x - 3, c.y + 3);

          // Coin Collision
          const dist = Math.hypot(player.x + player.width / 2 - c.x, player.y + player.height / 2 - c.y);
          if (dist < player.width / 2 + c.radius) {
            c.collected = true;
            currentScore += 25;
            localCombo += 1;
            setCombo(localCombo);
            soundFx.playCoin();

            // Spawn confetti particles on pickup
            for (let p = 0; p < 6; p++) {
              particles.push({
                x: c.x,
                y: c.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: '#fbbf24',
                life: 20,
              });
            }
          }
        }

        if (c.x < -30) coins.splice(i, 1);
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Score Increment & Speed Ramp
      currentScore += 1;
      gameSpeed += 0.001;
      setScore(currentScore);

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [status, highScore, user, submitGameScore]);

  return (
    <GameLifecycleWrapper
      gameTitle="Caught Modi: Chase & Escape"
      gameId="modi-run"
      category="Endless Runner"
      instructions={[
        'Run and escape ACP Pradyuman through the streets of Delhi!',
        'Jump over media microphones and flying protest tomatoes.',
        'Collect gold coins for combo score multipliers.',
      ]}
      controls={[
        { key: 'SPACE / ↑ / W', action: 'Jump' },
        { key: 'CLICK / TAP', action: 'Jump' },
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
      <canvas ref={canvasRef} className="w-full h-full object-contain cursor-pointer" />
    </GameLifecycleWrapper>
  );
};
