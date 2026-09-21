'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { RotateCcw, Play, Users, Bot, Zap, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpinCricketProps {
  mode?: 'local' | 'ai' | 'solo';
}

type ShotOutcome = '1' | '2' | '3' | '4' | '6' | 'OUT' | 'DOT';

const SPINNER_SLICES: { label: ShotOutcome; name: string; color: string; bg: string }[] = [
  { label: '6', name: 'MAXIMUM SIXER! 🚀', color: '#ADFF2F', bg: 'from-lime-600 to-emerald-700' },
  { label: '1', name: 'SINGLE RUN (1)', color: '#38bdf8', bg: 'from-blue-600 to-cyan-700' },
  { label: 'OUT', name: 'WICKET! OUT! 🔴', color: '#ef4444', bg: 'from-red-600 to-rose-800' },
  { label: '4', name: 'BOUNDARY FOUR! 🏏', color: '#00F0FF', bg: 'from-cyan-600 to-teal-700' },
  { label: '2', name: 'DOUBLE (2)', color: '#a855f7', bg: 'from-purple-600 to-indigo-700' },
  { label: 'DOT', name: 'DOT BALL (0)', color: '#94a3b8', bg: 'from-slate-600 to-gray-700' },
  { label: '3', name: 'TRIPLE RUNS (3)', color: '#f59e0b', bg: 'from-amber-600 to-orange-700' },
  { label: '6', name: 'MONSTER SIX! 💥', color: '#ADFF2F', bg: 'from-lime-600 to-emerald-700' }
];

export const SpinCricketCanvas: React.FC<SpinCricketProps> = ({ mode: initialMode = 'local' }) => {
  const { user, addCoins, addXP, updateHighScore, recordGameWin, submitGameScore } = useAppStore();

  const [gameMode, setGameMode] = useState<'local' | 'ai' | 'solo'>(initialMode);
  const [currentInnings, setCurrentInnings] = useState<1 | 2>(1);
  const [innings1Score, setInnings1Score] = useState({ runs: 0, wickets: 0, balls: 0 });
  const [innings2Score, setInnings2Score] = useState({ runs: 0, wickets: 0, balls: 0 });
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [lastShot, setLastShot] = useState<ShotOutcome | null>(null);
  const [roastComment, setRoastComment] = useState('Spin the notebook cricket wheel to open your innings!');
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const [shotAnimation, setShotAnimation] = useState<string | null>(null);

  const MAX_BALLS = 6; // 1 Over shootout
  const MAX_WICKETS = 2;

  // AI Spin automation
  useEffect(() => {
    if (gameMode === 'ai' && currentInnings === 2 && !matchWinner && !isSpinning) {
      const timer = setTimeout(() => {
        handleSpinClick();
        setTimeout(() => handleStopClick(), 900);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentInnings, gameMode, matchWinner, isSpinning]);

  const handleSpinClick = () => {
    if (isSpinning || matchWinner) return;
    setIsSpinning(true);
    soundFx.playSpin();
    setShotAnimation(null);
  };

  // Continuous wheel rotation while spinning
  useEffect(() => {
    if (!isSpinning) return;
    const interval = setInterval(() => {
      setWheelAngle((prev) => (prev + 35) % 360);
      soundFx.playClick();
    }, 45);
    return () => clearInterval(interval);
  }, [isSpinning]);

  const handleStopClick = () => {
    if (!isSpinning) return;
    setIsSpinning(false);

    // Pick random outcome slice
    const randomIndex = Math.floor(Math.random() * SPINNER_SLICES.length);
    const sliceAngle = randomIndex * (360 / SPINNER_SLICES.length);
    const finalAngle = 360 * 2 + sliceAngle;
    setWheelAngle(finalAngle);

    const outcome = SPINNER_SLICES[randomIndex].label;
    setLastShot(outcome);

    setTimeout(() => {
      processShotOutcome(outcome);
    }, 500);
  };

  const processShotOutcome = (outcome: ShotOutcome) => {
    let runsAdded = 0;
    let wicketAdded = 0;

    if (outcome === '6') {
      runsAdded = 6;
      soundFx.playLevelUp();
      setShotAnimation('🏏 MASSIVE SIX! OUT OF THE STADIUM! 🚀');
      setRoastComment('Crowd goes wild! That landed in aunty ki balcony 😂');
      confetti({ particleCount: 50, spread: 60 });
    } else if (outcome === '4') {
      runsAdded = 4;
      soundFx.playCoin();
      setShotAnimation('🏏 BOUNDARY FOUR! CRACKING SHOT! 🔥');
      setRoastComment('Pierced through extra cover! Beautiful timing!');
    } else if (outcome === '1' || outcome === '2' || outcome === '3') {
      runsAdded = Number(outcome);
      soundFx.playHit();
      setShotAnimation(`🏏 ${runsAdded} RUNS TAKEN!`);
      setRoastComment('Good running between the classroom desks!');
    } else if (outcome === 'OUT') {
      wicketAdded = 1;
      soundFx.playGameOver();
      setShotAnimation('🔴 WICKET! TIMBER DISTURBED! 💥');
      setRoastComment('Clean bowled! Middle stump uprooted 💀');
    } else {
      soundFx.playClick();
      setShotAnimation('⚪ DOT BALL! Great bowling!');
      setRoastComment('Beaten outside off stump! Dot ball.');
    }

    if (currentInnings === 1) {
      const nextRuns = innings1Score.runs + runsAdded;
      const nextWickets = innings1Score.wickets + wicketAdded;
      const nextBalls = innings1Score.balls + 1;
      const nextState = { runs: nextRuns, wickets: nextWickets, balls: nextBalls };
      setInnings1Score(nextState);

      if (nextWickets >= MAX_WICKETS || nextBalls >= MAX_BALLS) {
        soundFx.playLevelUp();
        setCurrentInnings(2);
        setRoastComment(`Innings 1 complete! Target for P2: ${nextRuns + 1} runs in 6 balls!`);
      }
    } else {
      const nextRuns = innings2Score.runs + runsAdded;
      const nextWickets = innings2Score.wickets + wicketAdded;
      const nextBalls = innings2Score.balls + 1;
      const nextState = { runs: nextRuns, wickets: nextWickets, balls: nextBalls };
      setInnings2Score(nextState);

      // Check Chase condition
      if (nextRuns > innings1Score.runs) {
        handleMatchEnd('Player 2 / Chaser Won!');
      } else if (nextWickets >= MAX_WICKETS || nextBalls >= MAX_BALLS) {
        if (nextRuns === innings1Score.runs) {
          handleMatchEnd('Super Over Tie!');
        } else {
          handleMatchEnd(`${user.username} (P1) Won by Defending!`);
        }
      }
    }
  };

  const handleMatchEnd = (resultText: string) => {
    setMatchWinner(resultText);
    soundFx.playLevelUp();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

    const isP1Win = resultText.includes('P1') || resultText.includes(user.username);
    submitGameScore('spin-cricket', innings1Score.runs, isP1Win);
    if (isP1Win) {
      addCoins(300);
    }
  };

  const resetGame = () => {
    soundFx.playClick();
    setCurrentInnings(1);
    setInnings1Score({ runs: 0, wickets: 0, balls: 0 });
    setInnings2Score({ runs: 0, wickets: 0, balls: 0 });
    setIsSpinning(false);
    setLastShot(null);
    setMatchWinner(null);
    setShotAnimation(null);
    setRoastComment('New 1-Over match started! Spin the cricket wheel.');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border-[#00F0FF]/20 bg-[#0d1117]/90">
        <div className="flex items-center gap-2 font-display">
          <span className="text-2xl">🏏</span>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              SPIN CRICKET (BOOK CRICKET) <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-[#00F0FF] border border-cyan-500/30">1 OVER SHOOTOUT</span>
            </h2>
            <p className="text-[11px] text-gray-400 font-sans">Spin the wheel and hit STOP for 4s, 6s and Wickets!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'local', label: '👥 Pass & Play 1v1', icon: Users },
            { id: 'ai', label: '🤖 vs Smart AI', icon: Bot },
            { id: 'solo', label: '🎯 Solo Practice', icon: Zap }
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

      {/* Scoreboard HUD */}
      <div className="grid grid-cols-2 gap-4">
        {/* Innings 1 (P1 Batting) */}
        <div className={`p-4 rounded-2xl glass-panel border ${
          currentInnings === 1 && !matchWinner
            ? 'border-[#00F0FF] bg-[#00F0FF]/10'
            : 'border-gray-800 bg-[#0d1117]/80'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-white block">{user.username} (Innings 1)</span>
              <span className="text-[10px] text-cyan-300 font-mono">
                Overs: {(innings1Score.balls / 6).toFixed(1)} / 1.0 • Wickets: {innings1Score.wickets}/2
              </span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-[#00F0FF] font-display">
                {innings1Score.runs}/{innings1Score.wickets}
              </span>
            </div>
          </div>
        </div>

        {/* Innings 2 (P2 Chasing) */}
        <div className={`p-4 rounded-2xl glass-panel border ${
          currentInnings === 2 && !matchWinner
            ? 'border-pink-500 bg-pink-500/10'
            : 'border-gray-800 bg-[#0d1117]/80'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-white block">
                {gameMode === 'ai' ? 'Bot_Chad (Innings 2)' : 'Player 2 (Innings 2)'}
              </span>
              <span className="text-[10px] text-pink-400 font-mono">
                Target: {innings1Score.runs + 1} Runs ({MAX_BALLS - innings2Score.balls} balls left)
              </span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-pink-400 font-display">
                {innings2Score.runs}/{innings2Score.wickets}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Wheel Spinner Canvas Arena */}
      <div className="relative w-full h-84 rounded-3xl overflow-hidden border border-cyan-900/40 shadow-2xl bg-gradient-to-b from-[#09182b] via-[#0b121e] to-[#06090e] flex flex-col items-center justify-between p-6">
        {/* Shot Big Celebration Overlay */}
        {shotAnimation && (
          <div className="absolute top-4 z-20 px-6 py-2 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF] text-white font-display text-sm font-black animate-bounce shadow-lg shadow-[#00F0FF]/30 backdrop-blur-md">
            {shotAnimation}
          </div>
        )}

        {/* Spinner Wheel Center Stage */}
        <div className="relative my-auto flex items-center justify-center">
          {/* Top Indicator Arrow */}
          <div className="absolute -top-5 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-yellow-400 drop-shadow-[0_4px_8px_rgba(234,179,8,0.8)]" />

          {/* Rotating Wheel Container */}
          <div
            className="w-52 h-52 rounded-full border-4 border-cyan-400 shadow-2xl relative overflow-hidden transition-transform duration-500 ease-out bg-slate-950 flex items-center justify-center"
            style={{ transform: `rotate(${wheelAngle}deg)` }}
          >
            {/* Wheel Slices */}
            {SPINNER_SLICES.map((slice, idx) => {
              const angle = idx * (360 / SPINNER_SLICES.length);
              return (
                <div
                  key={idx}
                  className="absolute w-full h-full flex justify-center pt-2"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span
                    className="font-display font-black text-sm drop-shadow"
                    style={{ color: slice.color }}
                  >
                    {slice.label}
                  </span>
                </div>
              );
            })}

            {/* Inner Hub Center Circle */}
            <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center z-10 shadow-inner">
              <span className="text-xl">🏏</span>
            </div>
          </div>
        </div>

        {/* Dynamic Commentary Banner */}
        <div className="relative z-10 text-center bg-black/70 border border-cyan-500/30 p-2.5 rounded-xl backdrop-blur-md w-full max-w-lg">
          <p className="text-xs font-mono font-bold text-cyan-300">{roastComment}</p>
        </div>
      </div>

      {/* Match Result Banner */}
      {matchWinner && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/90 to-purple-950/90 border-2 border-[#00F0FF] text-center space-y-4 shadow-2xl animate-fadeIn">
          <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide">
            🏆 {matchWinner}
          </h3>
          <p className="text-xs text-gray-300 font-mono">
            Innings 1: {innings1Score.runs} runs vs Innings 2: {innings2Score.runs} runs
          </p>
          <button
            onClick={resetGame}
            className="cyber-button px-6 py-2.5 rounded-xl font-display text-xs font-black text-slate-950 shadow-lg"
          >
            PLAY NEXT MATCH 🏏
          </button>
        </div>
      )}

      {/* Spinner Interactive Action Buttons */}
      {!matchWinner && (
        <div className="p-5 rounded-2xl glass-panel border-gray-800 bg-[#0e1218]/90 flex justify-center gap-4">
          {!isSpinning ? (
            <button
              onClick={handleSpinClick}
              disabled={gameMode === 'ai' && currentInnings === 2}
              className="px-12 py-4 rounded-xl font-display text-sm font-black cyber-button text-slate-950 shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              <span>SPIN CRICKET WHEEL 🔄</span>
            </button>
          ) : (
            <button
              onClick={handleStopClick}
              className="px-12 py-4 rounded-xl font-display text-sm font-black bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-500/30 flex items-center gap-2 animate-pulse"
            >
              <span>HIT STOP! 🛑</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
