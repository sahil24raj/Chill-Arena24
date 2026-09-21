'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { RotateCcw, Play } from 'lucide-react';

export const ChaiTapriCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { updateHighScore, addCoins, addXP, submitGameScore } = useAppStore();

  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [chaiServed, setChaiServed] = useState(0);

  const startGame = () => {
    soundFx.playLevelUp();
    setGameState('PLAYING');
    setScore(0);
    setChaiServed(0);
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let currentScore = 0;
    let currentChai = 0;
    let timer = 30; // 30 seconds speed run

    let customers: Array<{ x: number; item: 'chai' | 'samosa' | 'bun'; patience: number }> = [];

    const interval = setInterval(() => {
      timer--;
      if (timer <= 0) {
        clearInterval(interval);
        soundFx.playGameOver();
        setGameState('GAMEOVER');
        submitGameScore('chai-tapri', currentScore, currentScore > 50);
        if (currentChai > 0) addCoins(currentChai * 15);
      }
    }, 1000);

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

      // Tapri Menu Buttons (Bottom UI bar)
      if (clickY > 280) {
        let servedItem: 'chai' | 'samosa' | 'bun' | null = null;
        if (clickX < 260) servedItem = 'chai';
        else if (clickX < 530) servedItem = 'samosa';
        else servedItem = 'bun';

        if (servedItem && customers.length > 0) {
          const matchIdx = customers.findIndex((c) => c.item === servedItem);
          if (matchIdx !== -1) {
            customers.splice(matchIdx, 1);
            currentScore += 150;
            currentChai += 1;
            soundFx.playCoin();
            setScore(currentScore);
            setChaiServed(currentChai);
          }
        }
      }
    };

    canvas.addEventListener('click', handleCanvasClick);

    let frame = 0;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background - Warm Indian Tea Stall
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Customers Queue
      frame++;
      if (frame % 80 === 0 && customers.length < 5) {
        const items: Array<'chai' | 'samosa' | 'bun'> = ['chai', 'samosa', 'bun'];
        customers.push({
          x: 100 + customers.length * 130,
          item: items[Math.floor(Math.random() * items.length)],
          patience: 100
        });
      }

      // Draw Customers & Patience Bars
      for (let i = customers.length - 1; i >= 0; i--) {
        const cust = customers[i];
        cust.patience -= 0.25;

        if (cust.patience <= 0) {
          customers.splice(i, 1);
          continue;
        }

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(cust.x, 140, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('👨‍💻', cust.x - 10, 148);

        // Thought bubble for order
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cust.x - 20, 70, 40, 30);
        ctx.fillStyle = '#000000';
        const icon = cust.item === 'chai' ? '☕' : cust.item === 'samosa' ? '🥟' : '🍞';
        ctx.fillText(icon, cust.x - 8, 90);

        // Patience Meter
        ctx.fillStyle = cust.patience > 50 ? '#22c55e' : '#ef4444';
        ctx.fillRect(cust.x - 20, 175, (cust.patience / 100) * 40, 6);
      }

      // Menu Tapri Bar at Bottom
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 280, canvas.width, 80);

      ctx.fillStyle = '#d97706';
      ctx.fillRect(10, 290, 240, 60);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('☕ SERVE CHAI (Click)', 30, 325);

      ctx.fillStyle = '#ea580c';
      ctx.fillRect(270, 290, 240, 60);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('🥟 SERVE SAMOSA (Click)', 285, 325);

      ctx.fillStyle = '#0284c7';
      ctx.fillRect(530, 290, 240, 60);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('🍞 SERVE BUN MASKA (Click)', 540, 325);

      // Timer Display
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`⏳ Time Left: ${timer}s`, 650, 40);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [gameState]);

  return (
    <div className="relative w-full max-w-4xl mx-auto glass-panel p-4 rounded-2xl border-purple-800/40 text-center shadow-2xl">
      <div className="flex justify-between items-center mb-3 text-xs font-black">
        <span className="text-amber-400">☕ Cutting Chais Served: {chaiServed}</span>
        <span className="text-cyan-400 text-lg">Revenue: ₹{score}</span>
        <span className="text-pink-400">🔥 Tapri Rating: 4.9 ★</span>
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
            <span className="text-5xl mb-2 animate-bounce">☕</span>
            <h2 className="text-2xl font-black text-white">Chai Tapri Tycoon</h2>
            <p className="text-xs text-gray-300 max-w-md my-2">
              Click the correct menu buttons to serve Cutting Chai, Samosas, and Bun Maska before customers get angry!
            </p>
            <button
              onClick={startGame}
              className="cyber-button px-8 py-3 rounded-full text-sm font-black text-white flex items-center gap-2 shadow-lg mt-2"
            >
              <Play className="w-5 h-5 fill-white" /> OPEN TEA STALL
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <span className="text-4xl mb-2">🎉</span>
            <h2 className="text-2xl font-black text-amber-400">DAY SHIFT COMPLETED!</h2>
            <p className="text-sm font-bold text-gray-200 mt-1">Total Revenue: ₹{score}</p>
            <p className="text-xs text-cyan-400 mb-4">{chaiServed} Customers Served Satisfied</p>
            <button
              onClick={startGame}
              className="cyber-button px-8 py-3 rounded-full text-sm font-black text-white flex items-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-4 h-4" /> START NEXT SHIFT
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[11px] text-gray-400 mt-3 px-2">
        <span>Controls: Click the Tea / Samosa / Bun Maska buttons at bottom</span>
        <span>Tapri Management Simulator</span>
      </div>
    </div>
  );
};
