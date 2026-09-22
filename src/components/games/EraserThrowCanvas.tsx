'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';
import { Wind, Target, Eye, EyeOff } from 'lucide-react';

export const EraserThrowCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [throwsLeft, setThrowsLeft] = useState(8);
  const [wind, setWind] = useState(1.5);
  const [teacherState, setTeacherState] = useState<'WRITING' | 'WATCHING'>('WRITING');
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  const gameLoopRef = useRef<number | null>(null);
  const teacherTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = user.stats.highScores?.['eraser-throw'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const handleStartGame = async () => {
    await GameSessionManager.startSession('eraser-throw', user);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
    setThrowsLeft(8);
    setWind((Math.random() - 0.5) * 3);
    setTeacherState('WRITING');
    setResultData(null);
  };

  const handlePause = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (teacherTimerRef.current) clearInterval(teacherTimerRef.current);
    }
  };

  const handleResume = () => {
    if (status === 'PAUSED') {
      setStatus('PLAYING');
    }
  };

  const handleRestart = () => {
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    if (teacherTimerRef.current) clearInterval(teacherTimerRef.current);
    handleStartGame();
  };

  // Teacher AI Cycle
  useEffect(() => {
    if (status !== 'PLAYING') return;

    teacherTimerRef.current = setInterval(() => {
      const isWatching = Math.random() > 0.6;
      setTeacherState(isWatching ? 'WATCHING' : 'WRITING');
      // Shift wind occasionally
      setWind((prev) => parseFloat(((Math.random() - 0.5) * 4).toFixed(1)));
    }, 3000);

    return () => {
      if (teacherTimerRef.current) clearInterval(teacherTimerRef.current);
    };
  }, [status]);

  // Main Canvas Projectile Physics Loop
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
    let remainingThrows = 8;

    let isDragging = false;
    let dragStart = { x: 140, y: 380 };
    let dragCurrent = { x: 140, y: 380 };

    let projectile = {
      x: 140,
      y: 380,
      vx: 0,
      vy: 0,
      radius: 12,
      active: false,
      rotation: 0,
    };

    let target = {
      x: 680,
      y: 180,
      radius: 35,
      vy: 1.5,
    };

    let particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number }> = [];

    const onGameOver = async () => {
      soundFx.playGameOver();
      setStatus(currentScore >= 200 ? 'VICTORY' : 'GAMEOVER');

      const res = await GameSessionManager.finishSession(currentScore, currentScore >= 200, user, highScore);
      setResultData(res);
      await submitGameScore('eraser-throw', currentScore, currentScore >= 200);

      if (currentScore > highScore) {
        setHighScore(currentScore);
        confetti({ particleCount: 50, spread: 60 });
      }
    };

    const getCanvasPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * canvas.width,
        y: ((clientY - rect.top) / rect.height) * canvas.height,
      };
    };

    const onPointerDown = (e: MouseEvent | Touch) => {
      if (projectile.active || remainingThrows <= 0) return;
      const pos = getCanvasPos(e.clientX, e.clientY);
      if (Math.hypot(pos.x - 140, pos.y - 380) < 60) {
        isDragging = true;
        dragStart = { x: 140, y: 380 };
        dragCurrent = pos;
        soundFx.playClick();
      }
    };

    const onPointerMove = (e: MouseEvent | Touch) => {
      if (!isDragging) return;
      dragCurrent = getCanvasPos(e.clientX, e.clientY);
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;

      // Calculate launch velocity vector from drag
      const dx = dragStart.x - dragCurrent.x;
      const dy = dragStart.y - dragCurrent.y;
      const pullDist = Math.hypot(dx, dy);

      if (pullDist > 15) {
        projectile.x = 140;
        projectile.y = 380;
        projectile.vx = (dx / pullDist) * Math.min(22, pullDist * 0.18);
        projectile.vy = (dy / pullDist) * Math.min(22, pullDist * 0.18);
        projectile.active = true;
        projectile.rotation = 0;
        soundFx.playThrow();
        GameSessionManager.recordAction();

        // Check if teacher catches you!
        if (teacherState === 'WATCHING') {
          soundFx.playWrong();
          localCombo = 0;
          setCombo(0);
          remainingThrows -= 1;
          setThrowsLeft(remainingThrows);
          projectile.active = false;
          if (remainingThrows <= 0) onGameOver();
          return;
        }

        remainingThrows -= 1;
        setThrowsLeft(remainingThrows);
      }
    };

    const handleMouseDown = (e: MouseEvent) => onPointerDown(e);
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e);
    const handleMouseUp = () => onPointerUp();

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) onPointerDown(e.touches[0]);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) onPointerMove(e.touches[0]);
    };
    const handleTouchEnd = () => onPointerUp();

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Classroom Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blackboard at front
      ctx.fillStyle = '#14532d'; // Dark Green Chalkboard
      ctx.fillRect(450, 60, 310, 260);
      ctx.strokeStyle = '#78350f'; // Wooden border
      ctx.lineWidth = 8;
      ctx.strokeRect(450, 60, 310, 260);

      // Chalk math equations
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 12px Courier New';
      ctx.fillText('E = mc²', 480, 100);
      ctx.fillText('sin²θ + cos²θ = 1', 480, 130);
      ctx.fillText('PV = nRT', 480, 160);

      // Target Circle on Blackboard (Moves up and down)
      target.y += target.vy;
      if (target.y > 260 || target.y < 120) target.vy *= -1;

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Teacher Podium & Avatar
      ctx.fillStyle = '#78350f';
      ctx.fillRect(400, 240, 50, 140);
      ctx.font = '36px sans-serif';
      ctx.fillText(teacherState === 'WATCHING' ? '👨‍🏫' : '🧑‍🏫', 405, 230);

      // Teacher Alert Warning
      if (teacherState === 'WATCHING') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(360, 150, 140, 25);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('⚠️ TEACHER WATCHING!', 370, 166);
      }

      // 2. Slingshot Anchor on Player Desk (Bottom Left)
      ctx.fillStyle = '#b45309';
      ctx.fillRect(135, 390, 10, 60);

      // Trajectory Prediction Line when dragging
      if (isDragging) {
        const dx = dragStart.x - dragCurrent.x;
        const dy = dragStart.y - dragCurrent.y;
        const pullDist = Math.hypot(dx, dy);
        const simVx = (dx / pullDist) * Math.min(22, pullDist * 0.18);
        const simVy = (dy / pullDist) * Math.min(22, pullDist * 0.18);

        ctx.strokeStyle = '#00F0FF';
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        let simX = 140;
        let simY = 380;
        let simVyAcc = simVy;
        for (let s = 0; s < 25; s++) {
          simX += simVx + wind * 0.1;
          simY += simVyAcc;
          simVyAcc += 0.45;
          if (s === 0) ctx.moveTo(simX, simY);
          else ctx.lineTo(simX, simY);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Rubber band
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(140, 380);
        ctx.lineTo(dragCurrent.x, dragCurrent.y);
        ctx.stroke();
      }

      // 3. Projectile Physics & Rendering
      if (projectile.active) {
        projectile.x += projectile.vx + wind * 0.15;
        projectile.y += projectile.vy;
        projectile.vy += 0.45; // Gravity
        projectile.rotation += 0.2;

        // Draw Eraser (Apsara Non-Dust Black & White)
        ctx.save();
        ctx.translate(projectile.x, projectile.y);
        ctx.rotate(projectile.rotation);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-12, -8, 24, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -8, 8, 16);
        ctx.restore();

        // Hit Detection with Target
        const dist = Math.hypot(projectile.x - target.x, projectile.y - target.y);
        if (dist < projectile.radius + target.radius) {
          projectile.active = false;
          const isBullseye = dist < target.radius * 0.35;
          const gained = isBullseye ? 100 : 50;
          currentScore += gained + localCombo * 20;
          localCombo += 1;
          setCombo(localCombo);
          setScore(currentScore);
          soundFx.playCorrect();
          soundFx.playHit();

          if (isBullseye) {
            confetti({ particleCount: 35, spread: 50 });
          }

          for (let p = 0; p < 15; p++) {
            particles.push({
              x: projectile.x,
              y: projectile.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              color: isBullseye ? '#fbbf24' : '#ef4444',
              life: 25,
            });
          }

          if (remainingThrows <= 0) onGameOver();
        }

        // Out of bounds
        if (projectile.y > canvas.height + 20 || projectile.x > canvas.width + 20) {
          projectile.active = false;
          localCombo = 0;
          setCombo(0);
          soundFx.playWrong();
          if (remainingThrows <= 0) onGameOver();
        }
      } else if (!isDragging) {
        // Idle Eraser on Desk
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(128, 372, 24, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(136, 372, 8, 16);
      }

      // 4. Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
        if (p.life <= 0) particles.splice(i, 1);
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [status, highScore, user, submitGameScore, teacherState, wind]);

  return (
    <GameLifecycleWrapper
      gameTitle="Eraser Football / Classroom Fling"
      gameId="eraser-throw"
      category="Trajectory Aim"
      instructions={[
        'Drag back and release the eraser to slingshot it toward the moving target.',
        'Watch out for the TEACHER: If you throw while the teacher is watching, you get caught!',
        'Compensate for shifting classroom ceiling fan wind drifts.',
      ]}
      controls={[
        { key: 'DRAG & RELEASE', action: 'Aim & Fling Eraser' },
        { key: 'WATCH TEACHER', action: 'Throw only when safe' },
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
        <canvas ref={canvasRef} className="w-full h-full object-contain cursor-crosshair" />

        {/* Top Wind & Teacher Status HUD */}
        {status === 'PLAYING' && (
          <div className="absolute top-3 left-3 flex items-center gap-3 z-20 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-cyan-300">
              <Wind className="w-3.5 h-3.5" />
              <span>WIND: {wind > 0 ? `+${wind}m/s ➔` : `${wind}m/s ⬅`}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold ${
                teacherState === 'WATCHING'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {teacherState === 'WATCHING' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{teacherState === 'WATCHING' ? 'TEACHER ALERT!' : 'TEACHER WRITING'}</span>
            </div>

            <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-yellow-400">
              THROWS: {throwsLeft} / 8
            </div>
          </div>
        )}
      </div>
    </GameLifecycleWrapper>
  );
};
