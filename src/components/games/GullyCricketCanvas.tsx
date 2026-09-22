'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';
import { Zap } from 'lucide-react';

export const GullyCricketCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [ballsLeft, setBallsLeft] = useState(6);
  const [commentary, setCommentary] = useState('Step up to the crease! 1 Over Challenge.');
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  const swingRef = useRef<(() => void) | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = user.stats.highScores?.['gully-cricket'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const handleStartGame = async () => {
    await GameSessionManager.startSession('gully-cricket', user);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
    setBallsLeft(6);
    setCommentary('Bowler is running in from the far street end!');
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

  // Main Canvas Batting Simulation
  useEffect(() => {
    if (status !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 480;

    let currentRuns = 0;
    let localCombo = 0;
    let remainingBalls = 6;
    let isSwinging = false;
    let shotOutcome = '';
    let isBallInPlay = false;

    let ball = {
      x: 720,
      y: 280,
      vx: 0,
      vy: 0,
      radius: 9,
      spin: 0,
      bounceY: 340,
    };

    let particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number }> = [];

    const onGameOver = async () => {
      soundFx.playGameOver();
      setStatus(currentRuns >= 18 ? 'VICTORY' : 'GAMEOVER');

      const res = await GameSessionManager.finishSession(currentRuns, currentRuns >= 18, user, highScore);
      setResultData(res);
      await submitGameScore('gully-cricket', currentRuns, currentRuns >= 18);

      if (currentRuns > highScore) {
        setHighScore(currentRuns);
        confetti({ particleCount: 50, spread: 60 });
      }
    };

    // Pitch the next delivery
    const pitchBall = () => {
      if (remainingBalls <= 0) {
        onGameOver();
        return;
      }

      isBallInPlay = true;
      isSwinging = false;
      shotOutcome = '';

      const ballTypes = [
        { vx: -8.5, vy: 1.5, type: 'Fast Yorker' },
        { vx: -7.0, vy: -1.0, type: 'Bouncer' },
        { vx: -6.5, vy: 0.5, type: 'Off-Spin' },
      ];
      const selected = ballTypes[Math.floor(Math.random() * ballTypes.length)];

      ball = {
        x: 720,
        y: 260,
        vx: selected.vx,
        vy: selected.vy,
        radius: 9,
        spin: 0.2,
        bounceY: 350,
      };

      setCommentary(`Incoming ${selected.type}! Time your shot perfectly!`);
    };

    pitchBall();

    // Bat Swing Action
    const swingBat = () => {
      if (!isBallInPlay || isSwinging) return;
      isSwinging = true;
      GameSessionManager.recordAction();

      const batX = 180;
      const distance = Math.abs(ball.x - batX);

      // Sweet timing window
      if (distance < 30) {
        // Perfect Six
        soundFx.playHit();
        soundFx.playVictory();
        currentRuns += 6;
        localCombo += 1;
        setCombo(localCombo);
        shotOutcome = '🚀 MASSIVE SIX! GULLY ROOFTOP!';
        setCommentary('Aunty’s cooler in danger! 6 Runs!');
        ball.vx = 14;
        ball.vy = -12;
        confetti({ particleCount: 40, spread: 60 });

        for (let p = 0; p < 12; p++) {
          particles.push({
            x: batX,
            y: ball.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: '#f59e0b',
            life: 25,
          });
        }
      } else if (distance < 65) {
        // Boundary Four
        soundFx.playHit();
        soundFx.playCorrect();
        currentRuns += 4;
        localCombo += 1;
        setCombo(localCombo);
        shotOutcome = '⚡ CRACKING FOUR! STRAIGHT DRIVE!';
        setCommentary('Pierced the field between two parked scooters!');
        ball.vx = 11;
        ball.vy = -3;
      } else if (distance < 110) {
        // Double Run
        soundFx.playHit();
        currentRuns += 2;
        localCombo = 0;
        setCombo(0);
        shotOutcome = '🏃 2 RUNS! QUICK BETWEEN THE WICKETS!';
        setCommentary('Good running!');
        ball.vx = 6;
        ball.vy = -1;
      } else {
        // Miss / Clean Bowled
        soundFx.playWrong();
        localCombo = 0;
        setCombo(0);
        shotOutcome = '❌ BEATEN! MISSED THE TIMING!';
        setCommentary('Bowled right past the bat!');
      }

      setScore(currentRuns);
      remainingBalls -= 1;
      setBallsLeft(remainingBalls);

      // Reset for next ball after delay
      setTimeout(() => {
        if (remainingBalls > 0) {
          pitchBall();
        } else {
          onGameOver();
        }
      }, 1500);
    };

    swingRef.current = swingBat;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        swingBat();
      } else if (e.code === 'Escape') {
        handlePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Gully Cricket Street Background
      const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
      sky.addColorStop(0, '#0c4a6e');
      sky.addColorStop(0.6, '#0284c7');
      sky.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Street Walls & Houses
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(30, 180, 180, 180);
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(580, 160, 200, 200);

      // Windows with grills
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(70, 210, 40, 40);
      ctx.fillRect(630, 190, 40, 40);

      // Pitch
      ctx.fillStyle = '#d97706';
      ctx.fillRect(100, 360, 600, 60);

      // Stumps / Wickets on Left
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(140, 290, 4, 70);
      ctx.fillRect(146, 290, 4, 70);
      ctx.fillRect(152, 290, 4, 70);
      ctx.fillRect(138, 288, 18, 3); // Bails

      // 2. Draw Batsman (Player)
      ctx.fillStyle = '#3b82f6'; // Jersey
      ctx.fillRect(165, 290, 30, 45);
      ctx.fillStyle = '#fed7aa'; // Head
      ctx.fillRect(170, 265, 20, 20);
      ctx.fillStyle = '#1e293b'; // Helmet/Cap
      ctx.fillRect(168, 260, 24, 8);

      // Bat
      ctx.save();
      ctx.translate(185, 310);
      ctx.rotate(isSwinging ? -0.8 : 0.3);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-4, -5, 8, 45);
      ctx.fillStyle = '#ef4444'; // Grip
      ctx.fillRect(-3, -15, 6, 12);
      ctx.restore();

      // 3. Draw Bowler on Right
      ctx.fillStyle = '#ef4444'; // Red bowler jersey
      ctx.fillRect(680, 280, 28, 50);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(684, 258, 20, 20);

      // 4. Ball Physics & Rendering
      if (isBallInPlay) {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce on pitch
        if (ball.y >= ball.bounceY && ball.vx < 0) {
          ball.vy = -ball.vy * 0.7;
        } else if (ball.vx < 0) {
          ball.vy += 0.15; // Gravity
        }

        // Draw Tennis Ball (Neon Yellow with seams)
        ctx.fillStyle = '#ccff00';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#a3e635';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 5. Draw Timing Zone HUD Indicator
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(150, 240, 60, 120);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('HIT ZONE', 155, 235);

      // Shot result overlay
      if (shotOutcome) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(shotOutcome, 280, 100);
      }

      // Balls Remaining Bar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(300, 20, 200, 30);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`BALLS LEFT: ${remainingBalls} / 6`, 330, 40);

      // Update Particles
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
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status, highScore, user, submitGameScore]);

  return (
    <GameLifecycleWrapper
      gameTitle="Gully Cricket: Box League"
      gameId="gully-cricket"
      category="Sports Cricket"
      instructions={[
        'Face a 1-over (6 balls) street cricket chase!',
        'Time the tennis ball as it enters the HIT ZONE by pressing SPACE or hitting the BAT button.',
        'Score 18+ runs to achieve victory and top the leaderboards.',
      ]}
      controls={[
        { key: 'SPACE / ENTER', action: 'Swing Cricket Bat' },
        { key: 'CLICK / TAP', action: 'Hit Shot' },
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

        {/* Bottom Commentary & Bat Swing Mobile Button */}
        {status === 'PLAYING' && (
          <div className="absolute bottom-3 inset-x-4 flex items-center justify-between z-20">
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-cyan-300 shadow-xl max-w-md">
              📢 {commentary}
            </div>

            <button
              onClick={() => swingRef.current?.()}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl border-2 border-yellow-300 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current" />
              SWING BAT
            </button>
          </div>
        )}
      </div>
    </GameLifecycleWrapper>
  );
};
