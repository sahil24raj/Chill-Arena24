'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { RotateCcw, Volume2, Trophy, Users, Bot, Zap, Play, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PenFlipProps {
  mode?: 'local' | 'ai' | 'solo';
}

export const PenFlipCanvas: React.FC<PenFlipProps> = ({ mode: initialMode = 'local' }) => {
  const { user, addCoins, addXP, updateHighScore, recordGameWin, submitGameScore } = useAppStore();

  const [gameMode, setGameMode] = useState<'local' | 'ai' | 'solo'>(initialMode);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1); // 1 = P1, 2 = P2/AI
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipRotation, setFlipRotation] = useState(0);
  const [flipHeight, setFlipHeight] = useState(0);
  const [lastOutcome, setLastOutcome] = useState<'TIP' | 'BODY' | 'FAIL' | null>(null);
  const [roastComment, setRoastComment] = useState('Flip your Reynolds pen to start the classroom duel!');
  const [comboP1, setComboP1] = useState(0);
  const [comboP2, setComboP2] = useState(0);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [power, setPower] = useState(50);
  const [isCharging, setIsCharging] = useState(false);

  const roastQuotesTip = [
    'NAH THAT WAS CLEAN! 🎯',
    'Bro got lucky on that landing 💀',
    'Classroom physicist right here! 👨‍🔬',
    'ABSOLUTE MASTERPIECE FLIP! 🚀',
    'The desk itself bowed down! 👑'
  ];

  const roastQuotesFail = [
    'Skill issue bro 😂',
    'Pen went flying to the first bench 💀',
    'Teacher is staring right at you 👁️',
    'Gravity said NO 😭',
    'Bro flipped air instead of pen 🤡'
  ];

  const roastQuotesBody = [
    'Flat like a chapati! 0 pts 🫓',
    'Body side landed. Nice try though!',
    'Balanced... but not on the tip 🥲',
    'Almost had it!'
  ];

  // AI turn automation
  useEffect(() => {
    if (gameMode === 'ai' && currentTurn === 2 && !winner && !isFlipping) {
      const timer = setTimeout(() => {
        executeFlip(Math.floor(Math.random() * 40) + 40);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameMode, winner, isFlipping]);

  const executeFlip = (appliedPower: number) => {
    if (isFlipping || winner) return;

    setIsFlipping(true);
    soundFx.playFlip();

    // Determine physics outcome based on power sweet-spot (60-80 has higher tip chance)
    const sweetDistance = Math.abs(appliedPower - 72);
    const tipChance = sweetDistance < 15 ? 0.45 : sweetDistance < 30 ? 0.25 : 0.12;
    const roll = Math.random();

    let outcome: 'TIP' | 'BODY' | 'FAIL' = 'BODY';
    let endAngle = 0;

    if (roll < tipChance) {
      outcome = 'TIP';
      endAngle = 90; // Standing vertical on tip
    } else if (roll < tipChance + 0.5) {
      outcome = 'BODY';
      endAngle = 0; // Flat
    } else {
      outcome = 'FAIL';
      endAngle = 180; // Inverted / dropped
    }

    // Dynamic rotation spins
    const totalSpins = 360 * 3 + (outcome === 'TIP' ? 90 : outcome === 'FAIL' ? 180 : 0);
    setFlipRotation(totalSpins);
    setFlipHeight(120);

    setTimeout(() => {
      setFlipHeight(0);
      setIsFlipping(false);
      setLastOutcome(outcome);

      if (outcome === 'TIP') {
        soundFx.playCorrect();
        soundFx.playCoin();
        const quote = roastQuotesTip[Math.floor(Math.random() * roastQuotesTip.length)];
        setRoastComment(quote);

        if (currentTurn === 1) {
          const nextScore = player1Score + 1;
          const nextCombo = comboP1 + 1;
          setPlayer1Score(nextScore);
          setComboP1(nextCombo);
          addCoins(20);
          addXP(15);

          if (nextScore >= 10) {
            handleVictory(1);
            return;
          }
        } else {
          const nextScore = player2Score + 1;
          const nextCombo = comboP2 + 1;
          setPlayer2Score(nextScore);
          setComboP2(nextCombo);

          if (nextScore >= 10) {
            handleVictory(2);
            return;
          }
        }
      } else if (outcome === 'BODY') {
        soundFx.playHit();
        const quote = roastQuotesBody[Math.floor(Math.random() * roastQuotesBody.length)];
        setRoastComment(quote);
        if (currentTurn === 1) setComboP1(0);
        else setComboP2(0);
      } else {
        soundFx.playGameOver();
        const quote = roastQuotesFail[Math.floor(Math.random() * roastQuotesFail.length)];
        setRoastComment(quote);
        if (currentTurn === 1) setComboP1(0);
        else setComboP2(0);
      }

      // Switch turn in multiplayer / AI mode
      if (gameMode !== 'solo') {
        setCurrentTurn(currentTurn === 1 ? 2 : 1);
      }
    }, 900);
  };

  const handleVictory = (winningPlayer: 1 | 2) => {
    setWinner(winningPlayer);
    soundFx.playLevelUp();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    submitGameScore('pen-flip', player1Score, winningPlayer === 1);
    if (winningPlayer === 1) {
      addCoins(250);
    }
  };

  const resetGame = () => {
    soundFx.playClick();
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentTurn(1);
    setLastOutcome(null);
    setWinner(null);
    setComboP1(0);
    setComboP2(0);
    setRoastComment('New match started! Target: 10 TIP points.');
  };

  const handlePowerStart = () => {
    if (isFlipping || winner || (gameMode === 'ai' && currentTurn === 2)) return;
    setIsCharging(true);
  };

  const handlePowerRelease = () => {
    if (!isCharging) return;
    setIsCharging(false);
    executeFlip(power);
  };

  // Power oscillating animation
  useEffect(() => {
    if (!isCharging) return;
    const interval = setInterval(() => {
      setPower((prev) => {
        if (prev >= 95) return 20;
        return prev + 6;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isCharging]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Mode Selector & Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border-[#00F0FF]/20 bg-[#0d1117]/90">
        <div className="flex items-center gap-2 font-display">
          <span className="text-2xl">🖊️</span>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              PEN FLIP BATTLE <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">FIRST TO 10 PTS</span>
            </h2>
            <p className="text-[11px] text-gray-400 font-sans">Flip your ballpen. Land on the TIP for +1 point.</p>
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
        {/* Player 1 Card */}
        <div className={`p-4 rounded-2xl glass-panel border transition-all ${
          currentTurn === 1 && !winner
            ? 'border-[#00F0FF] bg-[#00F0FF]/10 shadow-lg shadow-[#00F0FF]/15'
            : 'border-gray-800 bg-[#0d1117]/80 opacity-80'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-blue-600 flex items-center justify-center text-xl shadow">
                {user.avatar}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{user.username} (P1)</span>
                <span className="text-[10px] text-[#00F0FF] font-mono">Streak: {comboP1}x Tip</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-[#00F0FF] font-display">{player1Score}</span>
              <span className="text-[9px] text-gray-500 block uppercase">/ 10 PTS</span>
            </div>
          </div>
          {currentTurn === 1 && !winner && (
            <div className="mt-2 text-[10px] font-mono text-[#00F0FF] font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" /> YOUR TURN TO FLIP
            </div>
          )}
        </div>

        {/* Player 2 / AI Card */}
        <div className={`p-4 rounded-2xl glass-panel border transition-all ${
          currentTurn === 2 && !winner
            ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/15'
            : 'border-gray-800 bg-[#0d1117]/80 opacity-80'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-xl shadow">
                {gameMode === 'ai' ? '🤖' : '🕹️'}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {gameMode === 'ai' ? 'Bot_Chad (AI)' : 'Player 2 (Local)'}
                </span>
                <span className="text-[10px] text-pink-400 font-mono">Streak: {comboP2}x Tip</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-pink-400 font-display">{player2Score}</span>
              <span className="text-[9px] text-gray-500 block uppercase">/ 10 PTS</span>
            </div>
          </div>
          {currentTurn === 2 && !winner && (
            <div className="mt-2 text-[10px] font-mono text-pink-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              {gameMode === 'ai' ? 'BOT THINKING FLIP...' : 'PLAYER 2 TURN TO FLIP'}
            </div>
          )}
        </div>
      </div>

      {/* Classroom Desk Arena (Play Area) */}
      <div className="relative w-full h-80 rounded-3xl overflow-hidden border border-amber-900/40 shadow-2xl bg-gradient-to-b from-[#2d1b11] via-[#1f130b] to-[#120b06] flex flex-col justify-between p-6">
        {/* Classroom Desk Wood Grain & Notebook Doodle Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Chalkboard Desk Markings */}
        <div className="absolute top-4 left-6 border border-amber-500/20 bg-black/40 px-3 py-1.5 rounded-lg text-[10px] font-mono text-amber-300 backdrop-blur-sm">
          DESK #04 • REYNOLDS 045 PHYSICS SIMULATOR
        </div>

        <div className="absolute top-4 right-6 border border-amber-500/20 bg-black/40 px-3 py-1.5 rounded-lg text-[10px] font-mono text-amber-300 backdrop-blur-sm">
          {lastOutcome === 'TIP' && <span className="text-[#ADFF2F] font-bold">🎯 TIP STAND (+1 PT)</span>}
          {lastOutcome === 'BODY' && <span className="text-amber-400 font-bold">🫓 FLAT BODY (0 PT)</span>}
          {lastOutcome === 'FAIL' && <span className="text-red-400 font-bold">❌ OFF DESK (0 PT)</span>}
          {!lastOutcome && <span>WAITING FOR FLIP</span>}
        </div>

        {/* Center Stage: The Interactive Pen Object */}
        <div className="relative flex-1 flex items-center justify-center">
          {/* Landing Target Zone on Desk */}
          <div className="absolute bottom-6 w-32 h-8 rounded-full bg-amber-500/10 border border-dashed border-amber-500/30 blur-[1px]" />

          {/* Animated 3D Styled Ballpen */}
          <div
            className="relative transition-all duration-700 ease-out"
            style={{
              transform: `translateY(-${flipHeight}px) rotate(${flipRotation}deg)`,
              transformOrigin: 'center center'
            }}
          >
            {/* Pen Structure */}
            <div className="relative w-7 h-44 flex flex-col items-center drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]">
              {/* Pen Cap Clip */}
              <div className="absolute top-2 -left-1.5 w-1.5 h-12 bg-gray-400 rounded-l-sm border border-gray-600 shadow" />
              
              {/* White Plastic Cap Top */}
              <div className="w-6 h-10 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-800 rounded-t-md border-t border-blue-400" />
              
              {/* Clear Hexagonal Body */}
              <div className="w-5 flex-1 bg-gradient-to-r from-gray-100 via-white to-gray-300 border-x border-gray-400 flex items-center justify-center relative overflow-hidden">
                {/* Ink Refill inside */}
                <div className="w-1.5 h-full bg-blue-900 rounded-full opacity-80" />
                <span className="absolute rotate-90 text-[7px] font-mono tracking-widest text-blue-950 font-black select-none">
                  REYNOLDS
                </span>
              </div>
              
              {/* Metallic Brass Tip Cone */}
              <div className="w-5 h-8 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 clip-cone" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }} />
              {/* Tiny Ballpoint Tip Point */}
              <div className="w-1.5 h-2 bg-slate-900 rounded-full -mt-0.5" />
            </div>
          </div>
        </div>

        {/* Dynamic Commentary Banner */}
        <div className="relative z-10 text-center bg-black/60 border border-amber-500/30 p-2.5 rounded-xl backdrop-blur-md">
          <p className="text-xs font-mono font-bold text-amber-200">{roastComment}</p>
        </div>
      </div>

      {/* Winner Overlay Modal */}
      {winner && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/90 to-slate-950/90 border-2 border-[#00F0FF] text-center space-y-4 shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] mx-auto flex items-center justify-center text-3xl text-slate-950 shadow-lg">
            🏆
          </div>
          <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide">
            {winner === 1 ? `${user.username} WON THE PEN BATTLE!` : gameMode === 'ai' ? 'BOT CHAD WON!' : 'PLAYER 2 WON!'}
          </h3>
          <p className="text-xs text-gray-300 font-mono">
            {winner === 1 ? 'Desk Legend Badge Progress +250 Coins Earned!' : 'Gotta practice that flick angle on the last bench!'}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={resetGame}
              className="cyber-button px-6 py-2.5 rounded-xl font-display text-xs font-black text-slate-950 shadow-lg"
            >
              PLAY REMATCH
            </button>
          </div>
        </div>
      )}

      {/* Interactive Controls & Power Bar */}
      {!winner && (
        <div className="p-5 rounded-2xl glass-panel border-gray-800 bg-[#0e1218]/90 space-y-4">
          {/* Power Meter Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-gray-400">FLIP POWER INTENSITY</span>
              <span className={`font-bold ${power > 60 && power < 85 ? 'text-[#ADFF2F]' : 'text-yellow-400'}`}>
                {power}% {power > 60 && power < 85 ? '(SWEET SPOT 🎯)' : ''}
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-gray-800 p-0.5 relative">
              {/* Sweet spot indicator overlay */}
              <div className="absolute top-0 bottom-0 left-[60%] right-[20%] bg-[#ADFF2F]/20 border-x border-[#ADFF2F]/50 pointer-events-none" />
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-[#00F0FF] to-[#ADFF2F] transition-all"
                style={{ width: `${power}%` }}
              />
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-gray-400 font-mono">
              💡 Hold button to charge power & release to flick pen
            </span>

            <button
              disabled={isFlipping || (gameMode === 'ai' && currentTurn === 2)}
              onMouseDown={handlePowerStart}
              onMouseUp={handlePowerRelease}
              onTouchStart={handlePowerStart}
              onTouchEnd={handlePowerRelease}
              className={`w-full sm:w-auto px-10 py-4 rounded-xl font-display text-sm font-black transition-all flex items-center justify-center gap-2 select-none shadow-xl ${
                isFlipping || (gameMode === 'ai' && currentTurn === 2)
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : isCharging
                  ? 'bg-[#ADFF2F] text-slate-950 scale-105 shadow-[#ADFF2F]/30'
                  : 'cyber-button text-slate-950'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isCharging ? 'RELEASE TO FLIP!' : 'HOLD & FLIP PEN 🖊️'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
