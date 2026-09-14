'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { RotateCcw, Play } from 'lucide-react';

export const EmojiDodgeCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { updateHighScore, addCoins, addXP } = useAppStore();

  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState(0);

  const startGame = () => {
    soundFx.playJump();
    setGameState('PLAYING');
    setScore(0);
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let currentScore = 0;

    const player = {
      x: 380,
      y: 300,
      width: 40,
      height: 40
    };

    let emojis: Array<{ x: number; y: number; type: 'cringe' | 'dank'; text: string; speed: number }> = [];
    const cringeEmojis = ['🤦‍♂️', '💩', '🤡', '🤢', '🤮'];
    const dankEmojis = ['🗿', '👑', '🔥', ' Pepe', '🚀'];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
      player.x = Math.max(0, Math.min(canvas.width - player.width, mouseX - player.width / 2));
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    let frame = 0;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cyber Matrix Background
      ctx.fillStyle = '#050a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Player Meme Avatar
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.fillText('😎', player.x + 8, player.y + 30);

      // Spawn falling emojis
      frame++;
      if (frame % 15 === 0) {
        const isDank = Math.random() > 0.7;
        const text = isDank
          ? dankEmojis[Math.floor(Math.random() * dankEmojis.length)]
          : cringeEmojis[Math.floor(Math.random() * cringeEmojis.length)];

        emojis.push({
          x: Math.random() * (canvas.width - 30),
          y: -30,
          type: isDank ? 'dank' : 'cringe',
          text,
          speed: 3 + Math.random() * 4
        });
      }

      // Update Emojis
      for (let i = emojis.length - 1; i >= 0; i--) {
        const em = emojis[i];
        em.y += em.speed;

        ctx.fillText(em.text, em.x, em.y);

        // Collision Check
        if (
          player.x < em.x + 25 &&
          player.x + player.width > em.x &&
          player.y < em.y + 25 &&
          player.y + player.height > em.y
        ) {
          if (em.type === 'cringe') {
            soundFx.playGameOver();
            setGameState('GAMEOVER');
            updateHighScore('emoji-dodge', currentScore);
            addCoins(Math.floor(currentScore / 10));
            addXP(Math.floor(currentScore / 5));
            cancelAnimationFrame(animId);
            canvas.removeEventListener('mousemove', handleMouseMove);
            return;
          } else {
            soundFx.playCoin();
            currentScore += 250;
            emojis.splice(i, 1);
            continue;
          }
        }

        if (em.y > canvas.height + 30) {
          emojis.splice(i, 1);
          if (em.type === 'cringe') currentScore += 10;
        }
      }

      currentScore += 1;
      setScore(currentScore);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gameState]);

  return (
    <div className="relative w-full max-w-4xl mx-auto glass-panel p-4 rounded-2xl border-purple-800/40 text-center shadow-2xl">
      <div className="flex justify-between items-center mb-3 text-xs font-black">
        <span className="text-emerald-400">Catch: 🗿 👑 🔥 🚀</span>
        <span className="text-cyan-400 text-lg">Gen-Z Score: {score}</span>
        <span className="text-red-400">Avoid: 🤦‍♂️ 💩 🤡</span>
      </div>

      <div className="relative w-full aspect-[16/9] max-h-[420px] bg-slate-950 rounded-xl overflow-hidden border border-purple-900/60 shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={360}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <span className="text-5xl mb-2 animate-bounce">🗿</span>
            <h2 className="text-2xl font-black text-white">Emoji Dodge: Gen-Z Survival</h2>
            <p className="text-xs text-gray-300 max-w-md my-2">
              Move your mouse to dodge cringe emojis and catch viral Gigachad Pepe emojis!
            </p>
            <button
              onClick={startGame}
              className="cyber-button px-8 py-3 rounded-full text-sm font-black text-white flex items-center gap-2 shadow-lg mt-2"
            >
              <Play className="w-5 h-5 fill-white" /> START REACTION
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <span className="text-4xl mb-2">🤡</span>
            <h2 className="text-2xl font-black text-red-500">HIT BY CRINGE EMOJI!</h2>
            <p className="text-sm font-bold text-gray-200 mt-1">Final Gen-Z Score: {score}</p>
            <button
              onClick={startGame}
              className="cyber-button px-8 py-3 rounded-full text-sm font-black text-white flex items-center gap-2 shadow-lg mt-4"
            >
              <RotateCcw className="w-4 h-4" /> RETRY REACTION
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[11px] text-gray-400 mt-3 px-2">
        <span>Controls: Move Mouse Left & Right across the Canvas</span>
        <span>Reaction & Skill Test</span>
      </div>
    </div>
  );
};
