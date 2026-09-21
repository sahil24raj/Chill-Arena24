'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { RotateCcw, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GullyCricketCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { updateHighScore, addCoins, addXP, submitGameScore } = useAppStore();

  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [runs, setRuns] = useState(0);
  const [balls, setBalls] = useState(6); // 1 Over match

  const startGame = () => {
    soundFx.playLevelUp();
    setGameState('PLAYING');
    setRuns(0);
    setBalls(6);
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let currentRuns = 0;
    let remainingBalls = 6;
    let resultMessage = '';

    let ball = {
      x: 700,
      y: 180,
      radius: 10,
      vx: -7,
      vy: 0,
      active: true
    };

    const bat = {
      x: 120,
      y: 180,
      swinging: false,
      swingAngle: 0
    };

    const swingBat = () => {
      if (bat.swinging || remainingBalls <= 0) return;
      bat.swinging = true;
      soundFx.playJump();

      // Hit Timing calculation
      const dist = Math.abs(ball.x - bat.x);
      if (dist < 40) {
        // Hit 6!
        soundFx.playCoin();
        currentRuns += 6;
        remainingBalls--;
        resultMessage = '🚀 MASSIVE SIX! OVER THE ROOFTOP!';
        confetti({ particleCount: 40, spread: 50 });
        ball.vx = 14;
        ball.vy = -8;
      } else if (dist < 80) {
        // Hit 4!
        soundFx.playCoin();
        currentRuns += 4;
        remainingBalls--;
        resultMessage = '⚡ FOUR! CRACKING BOUNDARY!';
        ball.vx = 10;
        ball.vy = -3;
      } else {
        // Miss / Wicket
        soundFx.playGameOver();
        remainingBalls--;
        resultMessage = '❌ OUT! AUNTY’S WINDOW SAFE!';
        ball.active = false;
      }

      setRuns(currentRuns);
      setBalls(remainingBalls);

      // Reset for next ball after 1.5s
      setTimeout(() => {
        if (remainingBalls <= 0) {
          setGameState('GAMEOVER');
          submitGameScore('gully-cricket', currentRuns, currentRuns >= 12);
          if (currentRuns > 0) addCoins(currentRuns * 10);
        } else {
          ball = { x: 700, y: 180, radius: 10, vx: -7, vy: 0, active: true };
          bat.swinging = false;
          resultMessage = '';
        }
      }, 1200);
    };

    const handleCanvasClick = () => swingBat();
    canvas.addEventListener('click', handleCanvasClick);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gully Street Background
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Alley Walls & Balcony
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, canvas.width, 80);
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('🏢 Aunty’s Balcony Glass Window', 250, 45);

      // Pitch Line
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(100, 240);
      ctx.lineTo(720, 240);
      ctx.stroke();

      // Draw Wickets
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(90, 160, 6, 80);
      ctx.fillRect(100, 160, 6, 80);
      ctx.fillRect(110, 160, 6, 80);

      // Draw Batsman
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(bat.x - 20, 160, 25, 80);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('🏏', bat.x - 15, 190);

      // Draw Ball
      if (ball.active) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shot feedback text
      if (resultMessage) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(resultMessage, 240, 130);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [gameState]);

  return (
    <div className="relative w-full max-w-4xl mx-auto glass-panel p-4 rounded-2xl border-purple-800/40 text-center shadow-2xl">
      <div className="flex justify-between items-center mb-3 text-xs font-black">
        <span className="text-amber-400">🏏 Balls Remaining: {balls} / 6</span>
        <span className="text-cyan-400 text-lg">Total Runs: {runs}</span>
        <span className="text-pink-400">🔥 Target: Hit 30+ Runs</span>
      </div>

      <div className="relative w-full aspect-[16/9] max-h-[420px] bg-slate-950 rounded-xl overflow-hidden border border-purple-900/60 shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={360}
          className="w-full h-full object-contain cursor-pointer"
        />

        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <span className="text-5xl mb-2 animate-bounce">🏏</span>
            <h2 className="text-2xl font-black text-white">Cricket Gully Smash</h2>
            <p className="text-xs text-gray-300 max-w-md my-2">
              Click to swing the bat with precise timing as the ball approaches! Hit massive sixes!
            </p>
            <button
              onClick={startGame}
              className="cyber-button px-8 py-3 rounded-full text-sm font-black text-white flex items-center gap-2 shadow-lg mt-2"
            >
              <Play className="w-5 h-5 fill-white" /> START MATCH (1 OVER)
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <span className="text-4xl mb-2">🏆</span>
            <h2 className="text-2xl font-black text-cyan-400">OVER COMPLETED!</h2>
            <p className="text-sm font-bold text-gray-200 mt-1">Final Score: {runs} Runs</p>
            <button
              onClick={startGame}
              className="cyber-button px-8 py-3 rounded-full text-sm font-black text-white flex items-center gap-2 shadow-lg mt-4"
            >
              <RotateCcw className="w-4 h-4" /> PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[11px] text-gray-400 mt-3 px-2">
        <span>Controls: Click anywhere on the Canvas to swing the bat when ball reaches batsman</span>
        <span>Gully Cricket Simulator</span>
      </div>
    </div>
  );
};
