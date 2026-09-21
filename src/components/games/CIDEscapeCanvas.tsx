'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { RotateCcw, Play } from 'lucide-react';

export const CIDEscapeCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { updateHighScore, addCoins, addXP, submitGameScore } = useAppStore();

  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [cluesFound, setCluesFound] = useState(0);

  const startGame = () => {
    soundFx.playJump();
    setGameState('PLAYING');
    setScore(0);
    setCluesFound(0);
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let currentScore = 0;
    let currentClues = 0;

    const lanes = [90, 180, 270];
    let currentLane = 1;

    const player = {
      x: 100,
      y: lanes[currentLane],
      width: 40,
      height: 40
    };

    let dayaDoors: Array<{ x: number; lane: number; smashed: boolean }> = [];
    let pradyumanLasers: Array<{ x: number; lane: number }> = [];
    let clues: Array<{ x: number; lane: number; collected: boolean }> = [];
    let speed = 6;
    let frame = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' && currentLane > 0) {
        currentLane--;
        soundFx.playClick();
      } else if (e.code === 'ArrowDown' && currentLane < lanes.length - 1) {
        currentLane++;
        soundFx.playClick();
      }
      player.y = lanes[currentLane];
    };

    window.addEventListener('keydown', handleKeyDown);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background - Dark CID Mystery Room
      ctx.fillStyle = '#090514';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Lanes
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.3)';
      ctx.setLineDash([15, 15]);
      lanes.forEach((ly) => {
        ctx.beginPath();
        ctx.moveTo(0, ly + 25);
        ctx.lineTo(canvas.width, ly + 25);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Spawning
      frame++;
      if (frame % 70 === 0) {
        const lane = Math.floor(Math.random() * 3);
        dayaDoors.push({ x: canvas.width + 30, lane, smashed: false });
      }
      if (frame % 110 === 0) {
        const lane = Math.floor(Math.random() * 3);
        pradyumanLasers.push({ x: canvas.width + 30, lane });
      }
      if (frame % 50 === 0) {
        const lane = Math.floor(Math.random() * 3);
        clues.push({ x: canvas.width + 30, lane, collected: false });
      }

      // Draw Player
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('🕵️', player.x + 8, player.y + 28);

      // Update & Draw Daya Doors (Smash Obstacle)
      for (let i = dayaDoors.length - 1; i >= 0; i--) {
        const door = dayaDoors[i];
        door.x -= speed;
        const dy = lanes[door.lane];

        ctx.fillStyle = '#b45309';
        ctx.fillRect(door.x, dy, 30, 50);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('🚪', door.x + 4, dy + 32);

        // Collision
        if (
          player.x < door.x + 30 &&
          player.x + player.width > door.x &&
          player.y < dy + 50 &&
          player.y + player.height > dy
        ) {
          soundFx.playGameOver();
          setGameState('GAMEOVER');
          updateHighScore('cid-escape', currentScore);
          addCoins(currentClues * 10);
          addXP(Math.floor(currentScore / 2));
          cancelAnimationFrame(animId);
          window.removeEventListener('keydown', handleKeyDown);
          return;
        }

        if (door.x < -40) dayaDoors.splice(i, 1);
      }

      // Update & Draw Pradyuman Lasers
      for (let i = pradyumanLasers.length - 1; i >= 0; i--) {
        const laser = pradyumanLasers[i];
        laser.x -= speed * 1.2;
        const ly = lanes[laser.lane] + 20;

        ctx.fillStyle = '#ec4899';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ec4899';
        ctx.fillRect(laser.x, ly, 60, 10);
        ctx.shadowBlur = 0;

        if (
          player.x < laser.x + 60 &&
          player.x + player.width > laser.x &&
          player.y < ly + 10 &&
          player.y + player.height > ly
        ) {
          soundFx.playGameOver();
          setGameState('GAMEOVER');
          submitGameScore('cid-escape', currentScore, currentScore > 50);
          if (currentClues > 0) addCoins(currentClues * 10);
          cancelAnimationFrame(animId);
          window.removeEventListener('keydown', handleKeyDown);
          return;
        }

        if (laser.x < -70) pradyumanLasers.splice(i, 1);
      }

      // Update & Draw Clues
      for (let i = clues.length - 1; i >= 0; i--) {
        const cl = clues[i];
        cl.x -= speed;
        const cy = lanes[cl.lane] + 10;

        if (!cl.collected) {
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('🔍', cl.x, cy + 20);

          if (
            player.x < cl.x + 20 &&
            player.x + player.width > cl.x &&
            player.y < cy + 20 &&
            player.y + player.height > cy
          ) {
            cl.collected = true;
            currentClues += 1;
            soundFx.playCoin();
            setCluesFound(currentClues);
          }
        }

        if (cl.x < -20) clues.splice(i, 1);
      }

      currentScore += 1;
      setScore(currentScore);
      speed += 0.0008;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]);

  return (
    <div className="relative w-full max-w-4xl mx-auto glass-panel p-4 rounded-2xl border-purple-800/40 text-center shadow-2xl">
      <div className="flex justify-between items-center mb-3 text-xs font-black">
        <span className="text-amber-400">🔍 Clues Collected: {cluesFound}</span>
        <span className="text-cyan-400 text-lg">Score: {score}</span>
        <span className="text-pink-400">🚪 ACP Warning: DAYA IS COMING!</span>
      </div>

      <div className="relative w-full aspect-[16/9] max-h-[420px] bg-slate-950 rounded-xl overflow-hidden border border-purple-900/60 shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={360}
          className="w-full h-full object-contain"
        />

        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <span className="text-5xl mb-2 animate-bounce">🚪</span>
            <h2 className="text-2xl font-black text-white">CID Escape: Daya Tod Do Darwaza</h2>
            <p className="text-xs text-gray-300 max-w-md my-2">
              Dodge Daya’s door smashes and ACP Pradyuman’s lasers! Collect magnifying glass clues!
            </p>
            <button
              onClick={startGame}
              className="cyber-button px-8 py-3 rounded-full text-sm font-black text-white flex items-center gap-2 shadow-lg mt-2"
            >
              <Play className="w-5 h-5 fill-white" /> START ESCAPE
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <span className="text-4xl mb-2">🚨</span>
            <h2 className="text-2xl font-black text-pink-500">ACP PRADYUMAN CAUGHT YOU!</h2>
            <p className="text-sm font-bold text-gray-200 mt-1">Kuch Toh Gadbad Hai! Score: {score}</p>
            <button
              onClick={startGame}
              className="cyber-button px-8 py-3 rounded-full text-sm font-black text-white flex items-center gap-2 shadow-lg mt-4"
            >
              <RotateCcw className="w-4 h-4" /> RETRY ESCAPE
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[11px] text-gray-400 mt-3 px-2">
        <span>Controls: Use [Up Arrow] and [Down Arrow] to Switch Lanes</span>
        <span>CID TV Meme Tribute</span>
      </div>
    </div>
  );
};
