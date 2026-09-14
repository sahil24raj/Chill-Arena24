'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { RotateCcw, Volume2, VolumeX, Play, Maximize2, Minimize2, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ModiRunCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  
  const { updateHighScore, addCoins, addXP, isMuted, toggleMute } = useAppStore();

  const [gameState, setGameState] = useState<'IDLE' | 'TUTORIAL' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const stored = useAppStore.getState().user.stats.highScores['modi-run'] || 0;
    setHighScore(stored);

    // Sync fullscreen change events
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const showTutorial = () => {
    soundFx.playClick();
    setGameState('TUTORIAL');
  };

  const startGame = () => {
    soundFx.playJump();
    setGameState('PLAYING');
    setScore(0);
    setCoinsCollected(0);
    
    // Play reels BGM
    if (bgmRef.current) {
      bgmRef.current.currentTime = 0;
      bgmRef.current.muted = isMuted;
      bgmRef.current.play().catch(e => console.log('BGM Play block:', e));
    }
  };

  const handleMuteToggle = () => {
    toggleMute();
    if (bgmRef.current) {
      bgmRef.current.muted = !isMuted;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (bgmRef.current) {
        bgmRef.current.pause();
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let currentScore = 0;
    let currentCoins = 0;

    // Game variables
    const player = {
      x: 100,
      y: 220,
      width: 44,
      height: 60,
      vy: 0,
      gravity: 0.7,
      jumping: false,
      groundY: 220
    };

    // ACP Pradyuman chasing from behind
    const acpChaser = {
      x: 20,
      y: 220,
      width: 44,
      height: 60,
      runFrame: 0
    };

    let obstacles: Array<{ x: number; y: number; width: number; height: number; type: 'mic' | 'tomato' }> = [];
    let coins: Array<{ x: number; y: number; radius: number; collected: boolean }> = [];
    let gameSpeed = 5.5;
    let spawnTimer = 0;

    const triggerJump = () => {
      if (!player.jumping) {
        player.vy = -13.0;
        player.jumping = true;
        soundFx.playJump();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        triggerJump();
      }
    };

    const handleCanvasTouch = (e: TouchEvent) => {
      e.preventDefault();
      triggerJump();
    };

    const handleCanvasClick = (e: MouseEvent) => {
      e.preventDefault();
      triggerJump();
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleCanvasTouch, { passive: false });
    canvas.addEventListener('mousedown', handleCanvasClick);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background Gradient (Cyber Indian Flag Dusk)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#0f051d');
      bgGrad.addColorStop(0.5, '#290b4d');
      bgGrad.addColorStop(1, '#070312');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber Ground Line
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 280);
      ctx.lineTo(canvas.width, 280);
      ctx.stroke();

      // Ground Grid effect
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 280);
        ctx.lineTo(x - 60, canvas.height);
        ctx.stroke();
      }

      // Physics
      player.y += player.vy;
      player.vy += player.gravity;

      if (player.y >= player.groundY) {
        player.y = player.groundY;
        player.vy = 0;
        player.jumping = false;
      }

      // Animate run cycles
      spawnTimer++;
      const runCycle = spawnTimer * 0.15;
      acpChaser.runFrame += 0.15;

      // Draw ACP Pradyuman (Chaser)
      // Body (Suit)
      ctx.fillStyle = '#1e3a8a'; 
      ctx.fillRect(acpChaser.x, acpChaser.y, acpChaser.width, acpChaser.height - 15);
      // Pants
      ctx.fillStyle = '#1e293b';
      const acpLegOffset = Math.sin(acpChaser.runFrame) * 10;
      ctx.fillRect(acpChaser.x + 8, acpChaser.y + 45, 10, 15 + acpLegOffset);
      ctx.fillRect(acpChaser.x + 26, acpChaser.y + 45, 10, 15 - acpLegOffset);
      // Arm Pointing (Signature ACP Style)
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(acpChaser.x + 36, acpChaser.y + 20, 16, 8); // Arm pointing forward
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(acpChaser.x + 28, acpChaser.y + 15, 12, 10);
      // Face
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(acpChaser.x + 12, acpChaser.y + 2, 20, 14);
      // Hair & Mustache
      ctx.fillStyle = '#334155';
      ctx.fillRect(acpChaser.x + 12, acpChaser.y - 3, 20, 5); // Hair
      ctx.fillRect(acpChaser.x + 18, acpChaser.y + 10, 8, 3); // Mustache
      // Text bubble from ACP occasionally
      if (spawnTimer % 200 < 50) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(acpChaser.x - 10, acpChaser.y - 30, 110, 20);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 8px Courier New';
        ctx.fillText("KUCH GADBAD HAI!", acpChaser.x - 5, acpChaser.y - 17);
      }

      // Draw Player (Modi Meme Avatar)
      // Saffron Jacket
      ctx.fillStyle = '#f97316'; 
      ctx.fillRect(player.x, player.y, player.width, player.height - 15);
      // Kurta
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(player.x + 4, player.y + 16, player.width - 8, player.height - 31);
      // Running Legs
      ctx.fillStyle = '#cbd5e1';
      const playerLegOffset = Math.sin(runCycle) * 10;
      ctx.fillRect(player.x + 8, player.y + 45, 10, 15 + playerLegOffset);
      ctx.fillRect(player.x + 26, player.y + 45, 10, 15 - playerLegOffset);
      // Face & Glasses
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(player.x + 8, player.y + 2, 28, 15);
      ctx.fillStyle = '#000000';
      ctx.fillRect(player.x + 12, player.y + 6, 8, 4); // left lens
      ctx.fillRect(player.x + 24, player.y + 6, 8, 4); // right lens
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(player.x + 20, player.y + 8);
      ctx.lineTo(player.x + 24, player.y + 8);
      ctx.stroke();
      // White Beard
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(player.x + 10, player.y + 12, 24, 6);

      // Spawn Obstacles & Coins
      if (spawnTimer % 90 === 0) {
        const obsType = Math.random() > 0.5 ? 'mic' : 'tomato';
        obstacles.push({
          x: canvas.width + 20,
          y: obsType === 'mic' ? 230 : 210,
          width: 25,
          height: 50,
          type: obsType
        });
      }

      if (spawnTimer % 70 === 0) {
        coins.push({
          x: canvas.width + 30,
          y: 160 + Math.random() * 50,
          radius: 10,
          collected: false
        });
      }

      // Update & Draw Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;

        if (obs.type === 'mic') {
          // Draw Microphone
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(obs.x, obs.y, 12, 50);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(obs.x + 6, obs.y, 12, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw Tomato
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(obs.x + 12, obs.y + 25, 14, 0, Math.PI * 2);
          ctx.fill();
        }

        // Collision Check
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y < obs.y + obs.height &&
          player.y + player.height > obs.y
        ) {
          soundFx.playGameOver();
          setGameState('GAMEOVER');
          updateHighScore('modi-run', currentScore);
          addCoins(currentCoins);
          addXP(Math.floor(currentScore / 2));
          cancelAnimationFrame(animId);
          
          window.removeEventListener('keydown', handleKeyDown);
          canvas.removeEventListener('touchstart', handleCanvasTouch);
          canvas.removeEventListener('mousedown', handleCanvasClick);
          return;
        }

        if (obs.x < -50) obstacles.splice(i, 1);
      }

      // Update & Draw Coins
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        c.x -= gameSpeed;

        if (!c.collected) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
          ctx.fill();

          // Coin Collision
          const dist = Math.hypot(player.x + player.width / 2 - c.x, player.y + player.height / 2 - c.y);
          if (dist < player.width / 2 + c.radius) {
            c.collected = true;
            currentCoins += 5;
            soundFx.playCoin();
            setCoinsCollected(currentCoins);
          }
        }

        if (c.x < -20) coins.splice(i, 1);
      }

      // Score Increase
      currentScore += 1;
      gameSpeed += 0.001;
      setScore(currentScore);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleCanvasTouch);
      canvas.removeEventListener('mousedown', handleCanvasClick);
    };
  }, [gameState, isMuted]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-4xl mx-auto glass-panel p-4 rounded-2xl border-purple-800/40 text-center shadow-2xl bg-slate-950 flex flex-col justify-between ${
        isFullscreen ? 'h-screen max-w-none rounded-none p-6' : ''
      }`}
    >
      {/* Dynamic Reels BGM element */}
      <audio 
        ref={bgmRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
        loop
      />

      {/* Header Info */}
      <div className="flex justify-between items-center mb-3 text-xs font-black">
        <span className="text-amber-400">🪙 Coins: {coinsCollected}</span>
        <span className="text-cyan-400 text-lg">Score: {score}</span>
        <span className="text-pink-400 flex items-center gap-2">
          👑 Best: {Math.max(score, highScore)}
        </span>
      </div>

      {/* Canvas viewport */}
      <div className="relative w-full flex-1 aspect-[16/9] max-h-[460px] bg-slate-950 rounded-xl overflow-hidden border border-purple-900/60 shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={360}
          className="w-full h-full object-contain cursor-pointer"
        />

        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <span className="text-5xl mb-2 animate-bounce">🏃‍♂️👮‍♂️</span>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-green-400">
              CAUGHT MODI: CHASE & ESCAPE
            </h2>
            <p className="text-xs text-purple-200 max-w-md my-2">
              Dodge political traps and microphones! Jump to escape ACP Pradyuman who is chasing you from behind!
            </p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={showTutorial}
                className="cyber-button px-6 py-2.5 rounded-full text-xs font-bold text-cyan-300 flex items-center gap-1.5 border border-cyan-500/30"
              >
                <HelpCircle className="w-4 h-4" /> HOW TO PLAY
              </button>
              <button
                onClick={startGame}
                className="cyber-button bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 rounded-full text-sm font-black text-white flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
              >
                <Play className="w-5 h-5 fill-white" /> START GAME
              </button>
            </div>
          </div>
        )}

        {gameState === 'TUTORIAL' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <span className="text-4xl mb-2">📜 Game Rules & Controls</span>
            <h3 className="text-xl font-bold text-white mb-4">Mitron, rules samajh lo!</h3>
            
            <div className="grid grid-cols-2 gap-6 max-w-lg mb-6 text-left text-xs bg-slate-900/80 p-4 rounded-xl border border-purple-500/20">
              <div>
                <h4 className="font-black text-orange-400 mb-2">💻 PC CONTROLS</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">Spacebar</kbd> to Jump</li>
                  <li>• Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">Arrow Up</kbd> to Jump</li>
                  <li>• Or Click left mouse button</li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-green-400 mb-2">📱 MOBILE CONTROLS</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Tap anywhere on screen to Jump</li>
                  <li>• High-responsiveness screen taps</li>
                </ul>
              </div>
            </div>

            <button
              onClick={startGame}
              className="cyber-button bg-gradient-to-r from-green-500 to-emerald-500 px-10 py-3 rounded-full text-sm font-black text-white flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <Play className="w-5 h-5 fill-white" /> SPRINT NOW (Mitron, Chalo!)
            </button>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <span className="text-5xl mb-2">🚨</span>
            <h2 className="text-2xl font-black text-red-500">KUCH TOH GADBAD HAI!</h2>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">Modi gets Caught by ACP!</h3>
            <p className="text-sm font-bold text-gray-200 mt-1">Final Score: {score}</p>
            <p className="text-xs text-amber-400 mb-4">+ {coinsCollected} Meme Coins Earned</p>
            <button
              onClick={startGame}
              className="cyber-button bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 rounded-full text-sm font-black text-white flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <RotateCcw className="w-4 h-4" /> TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Footer / Control Bar */}
      <div className="flex justify-between items-center text-[11px] text-gray-400 mt-3 px-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleMuteToggle}
            className="p-1.5 hover:text-white rounded-lg bg-slate-900/60 border border-purple-900/40"
            title={isMuted ? "Unmute BGM" : "Mute BGM"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <span>Tap/Click screen or Press [Space] to Jump</span>
        </div>
        <button 
          onClick={toggleFullscreen}
          className="p-1.5 hover:text-cyan-400 rounded-lg bg-slate-900/60 border border-purple-900/40 flex items-center gap-1"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </button>
      </div>
    </div>
  );
};

