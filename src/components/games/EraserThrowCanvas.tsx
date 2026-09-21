'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { RotateCcw, Target, Wind, Users, Bot, Zap, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EraserThrowProps {
  mode?: 'local' | 'ai' | 'solo';
}

export const EraserThrowCanvas: React.FC<EraserThrowProps> = ({ mode: initialMode = 'local' }) => {
  const { user, addCoins, addXP, updateHighScore, recordGameWin, submitGameScore } = useAppStore();

  const [gameMode, setGameMode] = useState<'local' | 'ai' | 'solo'>(initialMode);
  const [activeItem, setActiveItem] = useState<'eraser' | 'sharpener'>('eraser');
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [combo, setCombo] = useState(0);
  const [wind, setWind] = useState(0); // -5 to +5 drift
  const [roastComment, setRoastComment] = useState('Aim and fling your non-dust eraser at the blackboard target!');
  const [gameOver, setGameOver] = useState(false);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 30, speed: 1.2, dir: 1 });

  // Projectile state
  const [projectile, setProjectile] = useState<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    active: boolean;
    rotation: number;
  }>({ x: 50, y: 85, vx: 0, vy: 0, active: false, rotation: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const [aimAngle, setAimAngle] = useState(45); // degrees
  const [aimPower, setAimPower] = useState(65);

  const teacherAlerts = [
    'MASTER THROW! Hit the chalkboard dead-center! 🎯',
    'TEACHER IS TURNING AROUND! Quick duck! 👨‍🏫',
    'ABSOLUTE CINEMA! Ricochet precision! 🍿',
    'Backbencher sniper aim 100 💀',
    'Hit the dust bin target cleanly! 🔥'
  ];

  // Wind and Target Movement Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const interval = setInterval(() => {
      // Move target side to side
      setTargetPos((prev) => {
        let nextX = prev.x + prev.speed * prev.dir;
        let nextDir = prev.dir;
        if (nextX > 80) {
          nextX = 80;
          nextDir = -1;
        } else if (nextX < 20) {
          nextX = 20;
          nextDir = 1;
        }
        return { ...prev, x: nextX, dir: nextDir };
      });
    }, 40);

    // Occasional wind gust change
    const windInterval = setInterval(() => {
      setWind(Math.floor(Math.random() * 9) - 4);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(windInterval);
    };
  }, [isPlaying, gameOver]);

  // Round Timer Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleEndRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver, currentTurn, player1Score, player2Score]);

  // Projectile Physics Flight Loop
  useEffect(() => {
    if (!projectile.active) return;

    const anim = setInterval(() => {
      setProjectile((prev) => {
        const nextX = prev.x + prev.vx + wind * 0.05;
        const nextY = prev.y + prev.vy;
        const nextVy = prev.vy + 1.2; // Gravity pull
        const nextRot = prev.rotation + 25;

        // Check Target Hit Collision
        const dist = Math.hypot(nextX - targetPos.x, nextY - targetPos.y);
        if (dist < 8) {
          handleHit(dist < 4);
          return { x: 50, y: 85, vx: 0, vy: 0, active: false, rotation: 0 };
        }

        // Out of bounds / Desk crash
        if (nextY > 90 || nextX < 5 || nextX > 95 || nextY < 5) {
          handleMiss();
          return { x: 50, y: 85, vx: 0, vy: 0, active: false, rotation: 0 };
        }

        return {
          ...prev,
          x: nextX,
          y: nextY,
          vy: nextVy,
          rotation: nextRot
        };
      });
    }, 30);

    return () => clearInterval(anim);
  }, [projectile.active, targetPos, wind]);

  const handleHit = (isBullseye: boolean) => {
    soundFx.playHit();
    soundFx.playCoin();
    const alert = teacherAlerts[Math.floor(Math.random() * teacherAlerts.length)];
    setRoastComment(alert);

    const points = (isBullseye ? 2 : 1) * (combo > 2 ? 2 : 1);
    setCombo((c) => c + 1);

    if (currentTurn === 1) {
      setPlayer1Score((s) => s + points);
    } else {
      setPlayer2Score((s) => s + points);
    }

    addCoins(isBullseye ? 30 : 15);
    addXP(20);
  };

  const handleMiss = () => {
    soundFx.playGameOver();
    setCombo(0);
    setRoastComment('Missed the blackboard! Teacher heard the sound 💀');
  };

  const throwItem = () => {
    if (projectile.active || gameOver) return;
    if (!isPlaying) setIsPlaying(true);

    soundFx.playThrow();

    const rad = (aimAngle * Math.PI) / 180;
    const speed = aimPower * 0.045;
    const vx = Math.cos(rad) * speed * (aimAngle > 90 ? -1 : 1);
    const vy = -Math.sin(rad) * speed;

    setProjectile({
      x: 50,
      y: 85,
      vx,
      vy,
      active: true,
      rotation: 0
    });
  };

  const handleEndRound = () => {
    if (gameMode !== 'solo' && currentTurn === 1) {
      soundFx.playLevelUp();
      setCurrentTurn(2);
      setTimeLeft(30);
      setCombo(0);
      setRoastComment('Player 1 finished round! Player 2 switch turn now!');
      return;
    }

    setGameOver(true);
    setIsPlaying(false);
    soundFx.playLevelUp();
    confetti({ particleCount: 80, spread: 60 });

    const p1 = player1Score;
    const p2 = player2Score;
    const isWin = p1 > p2 || gameMode === 'solo';
    submitGameScore('eraser-throw', p1, isWin);
    if (isWin) {
      addCoins(200);
    }
  };

  const resetGame = () => {
    soundFx.playClick();
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentTurn(1);
    setTimeLeft(30);
    setCombo(0);
    setGameOver(false);
    setIsPlaying(false);
    setProjectile({ x: 50, y: 85, vx: 0, vy: 0, active: false, rotation: 0 });
    setRoastComment('Aim at the moving blackboard target and fling!');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border-[#00F0FF]/20 bg-[#0d1117]/90">
        <div className="flex items-center gap-2 font-display">
          <span className="text-2xl">✏️</span>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              ERASER & SHARPENER THROW <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">30S DUEL</span>
            </h2>
            <p className="text-[11px] text-gray-400 font-sans">Aim trajectory, compensate for fan wind, and hit moving targets.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'local', label: '👥 Pass & Play 1v1', icon: Users },
            { id: 'solo', label: '🎯 Solo Target', icon: Zap }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                soundFx.playClick();
                setGameMode(m.id as any);
                resetGame();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display transition-all ${
                gameMode === m.id
                  ? 'bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F] text-slate-950 shadow-md shadow-[#00F0FF]/20'
                  : 'bg-slate-900 border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}

          <button
            onClick={resetGame}
            className="p-2 rounded-lg bg-slate-900 border border-gray-800 text-gray-400 hover:text-white hover:border-[#00F0FF]/40 transition-colors"
            title="Restart Match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Score and Timer HUD */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl glass-panel border ${
          currentTurn === 1 ? 'border-[#00F0FF] bg-[#00F0FF]/10' : 'border-gray-800 bg-[#0d1117]/80'
        }`}>
          <span className="text-[10px] text-gray-400 font-mono block">PLAYER 1 (YOU)</span>
          <span className="text-3xl font-black text-[#00F0FF] font-display">{player1Score}</span>
          <span className="text-[9px] text-gray-500 block">POINTS</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 bg-amber-500/5 text-center flex flex-col items-center justify-center">
          <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1">
            <Wind className="w-3.5 h-3.5" /> CEILING FAN WIND
          </span>
          <span className="text-xl font-black text-white font-mono">
            {wind === 0 ? 'CALM (0)' : wind > 0 ? `→ +${wind} RIGHT` : `← ${wind} LEFT`}
          </span>
          <span className="text-xs font-bold text-pink-400 font-mono mt-1">⏳ {timeLeft}s REMAINING</span>
        </div>

        <div className={`p-4 rounded-2xl glass-panel border ${
          currentTurn === 2 ? 'border-pink-500 bg-pink-500/10' : 'border-gray-800 bg-[#0d1117]/80'
        }`}>
          <span className="text-[10px] text-gray-400 font-mono block">PLAYER 2</span>
          <span className="text-3xl font-black text-pink-400 font-display">{player2Score}</span>
          <span className="text-[9px] text-gray-500 block">POINTS</span>
        </div>
      </div>

      {/* Classroom Canvas Arena */}
      <div className="relative w-full h-80 rounded-3xl overflow-hidden border border-emerald-900/40 shadow-2xl bg-gradient-to-b from-[#14291f] via-[#0d1a14] to-[#08100c] flex flex-col justify-between p-6 select-none">
        {/* Blackboard Frame at Top */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-[#1b3d2d] border-b-4 border-amber-800 shadow-inner flex items-center justify-center">
          <div className="absolute inset-2 border border-dashed border-emerald-500/20" />
          <span className="text-[10px] font-mono text-emerald-300/40 uppercase tracking-widest absolute top-2 left-4">
            BLACKBOARD TARGET ZONE • DO NOT THROW DUST CHALK
          </span>
        </div>

        {/* Moving Target on Blackboard */}
        <div
          className="absolute top-10 w-16 h-16 rounded-full border-4 border-red-500 bg-red-950/80 shadow-lg shadow-red-500/40 flex items-center justify-center transition-all duration-75"
          style={{ left: `${targetPos.x}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <Target className="w-6 h-6 text-red-400 absolute opacity-70" />
        </div>

        {/* Classroom Desk Surface at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#2a170d] to-[#3a2012] border-t-2 border-amber-600/40 shadow-2xl flex items-center justify-center">
          <div className="text-[9px] font-mono text-amber-500/40">FRONT DESK THROW LINE</div>
        </div>

        {/* Fling Projectile (Eraser / Sharpener) */}
        {projectile.active ? (
          <div
            className="absolute z-20 transition-transform"
            style={{
              left: `${projectile.x}%`,
              top: `${projectile.y}%`,
              transform: `translate(-50%, -50%) rotate(${projectile.rotation}deg)`
            }}
          >
            {activeItem === 'eraser' ? (
              <div className="w-9 h-5 bg-gradient-to-r from-blue-500 via-white to-red-500 rounded-sm shadow-xl border border-gray-400 flex items-center justify-center text-[7px] font-bold text-slate-900 font-mono">
                APSARA
              </div>
            ) : (
              <div className="w-7 h-7 bg-amber-400 rounded border border-amber-600 shadow-xl flex items-center justify-center text-xs">
                ⚙️
              </div>
            )}
          </div>
        ) : (
          /* Stationary Ready Object on Desk */
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
            {activeItem === 'eraser' ? (
              <div className="w-10 h-6 bg-gradient-to-r from-blue-500 via-white to-red-500 rounded-sm shadow-xl border border-gray-400 flex items-center justify-center text-[8px] font-bold text-slate-900 font-mono">
                APSARA
              </div>
            ) : (
              <div className="w-8 h-8 bg-amber-400 rounded border border-amber-600 shadow-xl flex items-center justify-center text-sm">
                ⚙️
              </div>
            )}
            <span className="text-[8px] font-mono text-amber-300 mt-1 font-bold">READY TO THROW</span>
          </div>
        )}

        {/* Dynamic Teacher Reaction Banner */}
        <div className="relative z-10 text-center bg-black/70 border border-emerald-500/30 p-2.5 rounded-xl backdrop-blur-md mt-auto mb-1">
          <p className="text-xs font-mono font-bold text-emerald-300">{roastComment}</p>
        </div>
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/90 to-slate-950/90 border-2 border-[#00F0FF] text-center space-y-4 shadow-2xl animate-fadeIn">
          <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide">
            {player1Score > player2Score
              ? `${user.username} WON THE CLASSROOM THROW!`
              : player2Score > player1Score
              ? 'PLAYER 2 WON!'
              : 'TIED MATCH!'}
          </h3>
          <p className="text-xs text-gray-300 font-mono">
            Final Score: P1 ({player1Score} pts) vs P2 ({player2Score} pts)
          </p>
          <button
            onClick={resetGame}
            className="cyber-button px-6 py-2.5 rounded-xl font-display text-xs font-black text-slate-950 shadow-lg"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* Aim & Power Controls */}
      {!gameOver && (
        <div className="p-5 rounded-2xl glass-panel border-gray-800 bg-[#0e1218]/90 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Item Switcher */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveItem('eraser');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold font-display border transition-all ${
                  activeItem === 'eraser'
                    ? 'bg-blue-600/30 border-blue-400 text-white'
                    : 'bg-slate-900 border-gray-800 text-gray-400'
                }`}
              >
                🧼 Non-Dust Eraser
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setActiveItem('sharpener');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold font-display border transition-all ${
                  activeItem === 'sharpener'
                    ? 'bg-amber-600/30 border-amber-400 text-white'
                    : 'bg-slate-900 border-gray-800 text-gray-400'
                }`}
              >
                ⚙️ Sharpener
              </button>
            </div>

            {/* Power & Angle Sliders */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                <span>THROW POWER: {aimPower}%</span>
                <span>TRAJECTORY ANGLE: {aimAngle}°</span>
              </div>
              <div className="flex gap-4">
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={aimPower}
                  onChange={(e) => setAimPower(Number(e.target.value))}
                  className="w-full accent-[#00F0FF]"
                />
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={aimAngle}
                  onChange={(e) => setAimAngle(Number(e.target.value))}
                  className="w-full accent-[#ADFF2F]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={throwItem}
              disabled={projectile.active}
              className={`px-12 py-3.5 rounded-xl font-display text-sm font-black transition-all flex items-center gap-2 shadow-xl ${
                projectile.active ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'cyber-button text-slate-950'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>FLING {activeItem.toUpperCase()}! 🎯</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
