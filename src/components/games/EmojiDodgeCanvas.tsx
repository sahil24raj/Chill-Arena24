'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';

export const EmojiDodgeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = user.stats.highScores?.['emoji-dodge'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const handleStartGame = async () => {
    await GameSessionManager.startSession('emoji-dodge', user);
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

  // Main Game Loop
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
    let frame = 0;
    let hasShield = false;
    let shieldTimer = 0;

    const player = {
      x: 375,
      y: 390,
      width: 50,
      height: 50,
      speed: 8,
    };

    let keysPressed: Record<string, boolean> = {};

    interface EmojiObj {
      x: number;
      y: number;
      type: 'cringe' | 'dank' | 'shield';
      text: string;
      speed: number;
      radius: number;
    }

    let emojis: EmojiObj[] = [];
    let particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number }> = [];

    const cringeEmojis = ['🤦‍♂️', '💩', '🤡', '🤢', '🤮', '💣'];
    const dankEmojis = ['🗿', '👑', '🔥', '🚀', '💎'];

    const handlePointerMove = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((clientX - rect.left) / rect.width) * canvas.width;
      player.x = Math.max(0, Math.min(canvas.width - player.width, mouseX - player.width / 2));
      GameSessionManager.recordAction();
    };

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        e.preventDefault();
        handlePointerMove(e.touches[0].clientX);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.code] = true;
      if (e.code === 'Escape') handlePause();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const onGameOver = async () => {
      soundFx.playGameOver();
      setStatus('GAMEOVER');

      const res = await GameSessionManager.finishSession(currentScore, currentScore > 300, user, highScore);
      setResultData(res);
      await submitGameScore('emoji-dodge', currentScore, currentScore > 300);

      if (currentScore > highScore) {
        setHighScore(currentScore);
        confetti({ particleCount: 50, spread: 60 });
      }
    };

    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Keyboard movement support
      if (keysPressed['ArrowLeft'] || keysPressed['KeyA']) {
        player.x = Math.max(0, player.x - player.speed);
      }
      if (keysPressed['ArrowRight'] || keysPressed['KeyD']) {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
      }

      // Background Cyber Matrix
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, '#030712');
      bg.addColorStop(0.5, '#0b1329');
      bg.addColorStop(1, '#030712');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Shield Timer check
      if (hasShield) {
        shieldTimer--;
        if (shieldTimer <= 0) hasShield = false;
      }

      // Draw Player Avatar
      ctx.font = '36px sans-serif';
      ctx.fillText('😎', player.x + 6, player.y + 38);

      // Shield Aura
      if (hasShield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 34, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Spawn falling emojis
      if (frame % Math.max(8, 20 - Math.floor(currentScore / 200)) === 0) {
        const roll = Math.random();
        let type: 'cringe' | 'dank' | 'shield' = 'cringe';
        let text = cringeEmojis[Math.floor(Math.random() * cringeEmojis.length)];

        if (roll < 0.05) {
          type = 'shield';
          text = '🛡️';
        } else if (roll < 0.35) {
          type = 'dank';
          text = dankEmojis[Math.floor(Math.random() * dankEmojis.length)];
        }

        emojis.push({
          x: Math.random() * (canvas.width - 40) + 10,
          y: -30,
          type,
          text,
          speed: 3.5 + Math.random() * 3.5 + currentScore * 0.002,
          radius: 18,
        });
      }

      // Update & Render Emojis
      for (let i = emojis.length - 1; i >= 0; i--) {
        const em = emojis[i];
        em.y += em.speed;

        ctx.font = '28px sans-serif';
        ctx.fillText(em.text, em.x - 14, em.y + 10);

        // Hitbox Collision Check with Player
        const dist = Math.hypot(player.x + player.width / 2 - em.x, player.y + player.height / 2 - em.y);
        if (dist < player.width / 2 + em.radius) {
          if (em.type === 'cringe') {
            if (hasShield) {
              // Absorbed by shield
              hasShield = false;
              soundFx.playHit();
              emojis.splice(i, 1);
              continue;
            } else {
              window.removeEventListener('keydown', onKeyDown);
              window.removeEventListener('keyup', onKeyUp);
              canvas.removeEventListener('mousemove', onMouseMove);
              canvas.removeEventListener('touchmove', onTouchMove);
              onGameOver();
              return;
            }
          } else if (em.type === 'dank') {
            currentScore += 50;
            localCombo += 1;
            setCombo(localCombo);
            soundFx.playCoin();

            for (let p = 0; p < 8; p++) {
              particles.push({
                x: em.x,
                y: em.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: '#f59e0b',
                life: 20,
              });
            }
            emojis.splice(i, 1);
            continue;
          } else if (em.type === 'shield') {
            hasShield = true;
            shieldTimer = 300; // 5 seconds of shield
            soundFx.playLevelUp();
            emojis.splice(i, 1);
            continue;
          }
        }

        // Survived / Dodged cringe emoji bonus
        if (em.y > canvas.height + 20) {
          if (em.type === 'cringe') {
            currentScore += 5;
          }
          emojis.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        if (p.life <= 0) particles.splice(i, 1);
      }

      setScore(currentScore);
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, [status, highScore, user, submitGameScore]);

  return (
    <GameLifecycleWrapper
      gameTitle="Emoji Dodge / Brain Reflex"
      gameId="emoji-dodge"
      category="Skill Reflex"
      instructions={[
        'Move your Chad avatar left and right using your Mouse, Touch, or Arrow keys.',
        'DODGE cringe emojis (💩, 🤡, 🤮, 💣) to stay alive!',
        'COLLECT dank meme emojis (🗿, 👑, 🔥, 🚀) and blue shields (🛡️) for multipliers.',
      ]}
      controls={[
        { key: 'MOUSE / TOUCH DRAG', action: 'Move Avatar' },
        { key: '← / → / A / D', action: 'Move Left / Right' },
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
      <canvas ref={canvasRef} className="w-full h-full object-contain cursor-ew-resize" />
    </GameLifecycleWrapper>
  );
};
