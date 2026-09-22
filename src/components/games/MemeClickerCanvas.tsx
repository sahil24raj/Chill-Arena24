'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';
import { TrendingUp, Zap, Bot, Sparkles, CheckCircle2 } from 'lucide-react';

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  isCrit: boolean;
}

export const MemeClickerCanvas: React.FC = () => {
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);

  const [clickPower, setClickPower] = useState(1);
  const [autoBots, setAutoBots] = useState(0);
  const [critChance, setCritChance] = useState(0.1);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const autoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = user.stats.highScores?.['meme-clicker'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const handleStartGame = async () => {
    await GameSessionManager.startSession('meme-clicker', user);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
    setClickPower(1);
    setAutoBots(0);
    setResultData(null);
  };

  const handlePause = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    }
  };

  const handleResume = () => {
    if (status === 'PAUSED') {
      setStatus('PLAYING');
    }
  };

  const handleRestart = () => {
    if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    handleStartGame();
  };

  const handleFinishAndSubmit = async () => {
    soundFx.playVictory();
    setStatus('VICTORY');
    if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);

    const res = await GameSessionManager.finishSession(score, true, user, highScore);
    setResultData(res);
    await submitGameScore('meme-clicker', score, true);

    if (score > highScore) {
      setHighScore(score);
      confetti({ particleCount: 60, spread: 70 });
    }
  };

  // Passive Auto-Bots generator
  useEffect(() => {
    if (status !== 'PLAYING') return;

    autoIntervalRef.current = setInterval(() => {
      if (autoBots > 0) {
        setScore((prev) => {
          const next = prev + autoBots * 2;
          return next;
        });
      }
    }, 1000);

    return () => {
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    };
  }, [status, autoBots]);

  // Click action
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (status !== 'PLAYING') return;

    GameSessionManager.recordAction();
    const isCrit = Math.random() < critChance;
    const added = isCrit ? clickPower * 5 : clickPower;

    if (isCrit) {
      soundFx.playLevelUp();
    } else {
      soundFx.playCoin();
    }

    setScore((prev) => prev + added);

    // Combo streak update
    setCombo((prev) => {
      const next = prev + 1;
      if (next % 10 === 0) soundFx.playCombo(Math.min(10, next / 10));
      return next;
    });

    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, 2000);

    // Add floating text
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newId = Date.now() + Math.random();

    setFloatingTexts((prev) => [
      ...prev,
      { id: newId, x, y, text: isCrit ? `🔥 CRIT +${added}!` : `+${added}`, isCrit },
    ]);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newId));
    }, 800);
  };

  const buyClickPower = () => {
    const cost = clickPower * 60;
    if (score >= cost) {
      soundFx.playCorrect();
      setScore(score - cost);
      setClickPower(clickPower + 1);
      GameSessionManager.recordAction();
    }
  };

  const buyAutoBot = () => {
    const cost = (autoBots + 1) * 150;
    if (score >= cost) {
      soundFx.playCorrect();
      setScore(score - cost);
      setAutoBots(autoBots + 1);
      GameSessionManager.recordAction();
    }
  };

  const buyCritChance = () => {
    const cost = Math.floor(critChance * 2000);
    if (score >= cost && critChance < 0.5) {
      soundFx.playLevelUp();
      setScore(score - cost);
      setCritChance((prev) => Math.min(0.5, prev + 0.05));
      GameSessionManager.recordAction();
    }
  };

  return (
    <GameLifecycleWrapper
      gameTitle="Meme Coin Clicker Tycoon"
      gameId="meme-clicker"
      category="Idle Clicker"
      instructions={[
        'Click the giant Meme Coin as fast as possible to generate Viral Views.',
        'Purchase Upgrades (Click Power, Auto-Troll Bots, Crit Chance) to multiply revenue.',
        'When satisfied with your fortune, click CASHOUT SCORE to submit to the leaderboards!',
      ]}
      controls={[
        { key: 'CLICK / TAP', action: 'Farm Meme Views' },
        { key: 'UPGRADE SHOP', action: 'Purchase Multipliers' },
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
      <div className="w-full h-full p-4 flex flex-col justify-between overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center h-full">
          {/* Main Click Target */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800 relative">
            <button
              onClick={handleClick}
              className="relative w-40 h-40 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 p-1.5 shadow-2xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer select-none"
            >
              <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center text-5xl">
                🚀
                <span className="text-[10px] font-black text-amber-300 mt-1 uppercase">FARM VIEWS</span>
              </div>
            </button>

            {/* Floating popups */}
            {floatingTexts.map((f) => (
              <span
                key={f.id}
                style={{ left: f.x, top: f.y }}
                className={`absolute font-black pointer-events-none text-sm animate-bounce drop-shadow-md ${
                  f.isCrit ? 'text-amber-300 text-lg' : 'text-[#00F0FF]'
                }`}
              >
                {f.text}
              </span>
            ))}

            <div className="flex items-center gap-4 mt-4 text-[11px] text-gray-400 font-mono">
              <span>⚡ Power: +{clickPower}</span>
              <span>🤖 Bots: +{autoBots * 2}/s</span>
              <span>🎯 Crit: {Math.round(critChance * 100)}%</span>
            </div>
          </div>

          {/* Upgrades List */}
          <div className="flex flex-col gap-2 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4" /> Upgrades & Automation
            </h4>

            {/* Upgrade 1 */}
            <button
              onClick={buyClickPower}
              disabled={score < clickPower * 60}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 flex items-center justify-between text-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              <div>
                <div className="font-bold text-white">🚀 Upgrade Dank Post</div>
                <div className="text-[10px] text-gray-400">+1 Click power</div>
              </div>
              <span className="font-mono text-yellow-400 font-bold">{clickPower * 60} Views</span>
            </button>

            {/* Upgrade 2 */}
            <button
              onClick={buyAutoBot}
              disabled={score < (autoBots + 1) * 150}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 flex items-center justify-between text-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              <div>
                <div className="font-bold text-white">🤖 Hire Internet Bot</div>
                <div className="text-[10px] text-gray-400">+2 Passive views/sec</div>
              </div>
              <span className="font-mono text-yellow-400 font-bold">{(autoBots + 1) * 150} Views</span>
            </button>

            {/* Upgrade 3 */}
            <button
              onClick={buyCritChance}
              disabled={score < Math.floor(critChance * 2000) || critChance >= 0.5}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 flex items-center justify-between text-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              <div>
                <div className="font-bold text-white">🔥 Viral Meme Surge</div>
                <div className="text-[10px] text-gray-400">+5% 5x Crit chance</div>
              </div>
              <span className="font-mono text-yellow-400 font-bold">
                {critChance >= 0.5 ? 'MAX' : `${Math.floor(critChance * 2000)} Views`}
              </span>
            </button>

            {/* Cashout button */}
            <button
              onClick={handleFinishAndSubmit}
              className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              💰 CASHOUT & SUBMIT SCORE ({score})
            </button>
          </div>
        </div>
      </div>
    </GameLifecycleWrapper>
  );
};
