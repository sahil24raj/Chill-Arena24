'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { RotateCcw, Users, Bot, Zap, Sparkles, Trophy, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TicTacToeProps {
  mode?: 'local' | 'ai' | 'solo';
}

type CellValue = 'X' | 'O' | null;

export const TicTacToeCanvas: React.FC<TicTacToeProps> = ({ mode: initialMode = 'local' }) => {
  const { user, addCoins, addXP, updateHighScore, recordGameWin } = useAppStore();

  const [gameMode, setGameMode] = useState<'local' | 'ai' | 'solo'>(initialMode);
  const [theme, setTheme] = useState<'cyber' | 'notebook'>('cyber');
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [winner, setWinner] = useState<'X' | 'O' | 'TIE' | null>(null);
  const [matchWinner, setMatchWinner] = useState<string | null>(null);

  const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  // AI Turn automation (Minimax/Smart Move)
  useEffect(() => {
    if (gameMode === 'ai' && !isXNext && !winner && !matchWinner) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameMode, winner, matchWinner, board]);

  const checkWinner = (currentBoard: CellValue[]) => {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], combo };
      }
    }
    if (currentBoard.every((cell) => cell !== null)) {
      return { winner: 'TIE' as const, combo: null };
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || matchWinner || (gameMode === 'ai' && !isXNext)) return;

    soundFx.playClick();
    const nextBoard = [...board];
    nextBoard[index] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);

    const result = checkWinner(nextBoard);
    if (result) {
      handleSetEnd(result.winner, result.combo);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const makeAIMove = () => {
    // 1. Can AI Win?
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const testBoard = [...board];
        testBoard[i] = 'O';
        if (checkWinner(testBoard)?.winner === 'O') {
          executeMove(i);
          return;
        }
      }
    }

    // 2. Can AI Block Player?
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const testBoard = [...board];
        testBoard[i] = 'X';
        if (checkWinner(testBoard)?.winner === 'X') {
          executeMove(i);
          return;
        }
      }
    }

    // 3. Take Center or Random
    if (!board[4]) {
      executeMove(4);
      return;
    }

    const available = board.map((val, idx) => (val === null ? idx : null)).filter((val) => val !== null) as number[];
    if (available.length > 0) {
      const randomIdx = available[Math.floor(Math.random() * available.length)];
      executeMove(randomIdx);
    }
  };

  const executeMove = (idx: number) => {
    soundFx.playClick();
    const nextBoard = [...board];
    nextBoard[idx] = 'O';
    setBoard(nextBoard);

    const result = checkWinner(nextBoard);
    if (result) {
      handleSetEnd(result.winner, result.combo);
    } else {
      setIsXNext(true);
    }
  };

  const handleSetEnd = (setWinnerVal: 'X' | 'O' | 'TIE', combo: number[] | null) => {
    setWinner(setWinnerVal);
    setWinningLine(combo);

    if (setWinnerVal === 'X') {
      soundFx.playLevelUp();
      const nextP1 = p1Wins + 1;
      setP1Wins(nextP1);
      if (nextP1 >= 2) {
        handleMatchEnd(`${user.username} (X) Won Best-of-3 Series! 👑`);
      }
    } else if (setWinnerVal === 'O') {
      soundFx.playGameOver();
      const nextP2 = p2Wins + 1;
      setP2Wins(nextP2);
      if (nextP2 >= 2) {
        handleMatchEnd(gameMode === 'ai' ? 'Bot_Chad (O) Won Series!' : 'Player 2 (O) Won Series!');
      }
    } else {
      soundFx.playHit();
    }
  };

  const handleMatchEnd = (msg: string) => {
    setMatchWinner(msg);
    soundFx.playLevelUp();
    confetti({ particleCount: 100, spread: 70 });

    const isWin = msg.includes('X') || (user?.username ? msg.includes(user.username) : false);
    const finalScore = isWin ? 100 : 25;
    useAppStore.getState().submitGameScore('tic-tac-toe', finalScore, isWin);
  };

  const resetSet = () => {
    soundFx.playClick();
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  const resetMatch = () => {
    resetSet();
    setP1Wins(0);
    setP2Wins(0);
    setMatchWinner(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border-[#00F0FF]/20 bg-[#0d1117]/90">
        <div className="flex items-center gap-2 font-display">
          <span className="text-2xl">❌⭕</span>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              NEON & NOTEBOOK TIC-TAC-TOE <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-[#00F0FF] border border-cyan-500/30">BEST OF 3</span>
            </h2>
            <p className="text-[11px] text-gray-400 font-sans">Align 3 in a row. First to win 2 rounds claims champion status.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'cyber' ? 'notebook' : 'cyber')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-gray-800 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5"
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span>Theme: {theme === 'cyber' ? 'Neon Cyber' : 'Notebook Paper'}</span>
          </button>

          {[
            { id: 'local', label: '👥 1v1 Local', icon: Users },
            { id: 'ai', label: '🤖 vs Smart AI', icon: Bot }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                soundFx.playClick();
                setGameMode(m.id as any);
                resetMatch();
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
            onClick={resetMatch}
            className="p-2 rounded-lg bg-slate-900 border border-gray-800 text-gray-400 hover:text-white hover:border-[#00F0FF]/40 transition-colors"
            title="Restart Match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Series Sets Scoreboard */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-2xl glass-panel border ${
          isXNext && !winner && !matchWinner ? 'border-[#00F0FF] bg-[#00F0FF]/10' : 'border-gray-800 bg-[#0d1117]/80'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-white block">{user.username} (X)</span>
              <span className="text-[10px] text-[#00F0FF] font-mono">Series: {p1Wins}/2 Sets Won</span>
            </div>
            <span className="text-3xl font-black text-[#00F0FF] font-display">{p1Wins}</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl glass-panel border ${
          !isXNext && !winner && !matchWinner ? 'border-pink-500 bg-pink-500/10' : 'border-gray-800 bg-[#0d1117]/80'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-white block">
                {gameMode === 'ai' ? 'Bot_Chad (O)' : 'Player 2 (O)'}
              </span>
              <span className="text-[10px] text-pink-400 font-mono">Series: {p2Wins}/2 Sets Won</span>
            </div>
            <span className="text-3xl font-black text-pink-400 font-display">{p2Wins}</span>
          </div>
        </div>
      </div>

      {/* Grid Canvas Arena */}
      <div className={`relative w-full max-w-md mx-auto p-6 rounded-3xl border shadow-2xl transition-colors ${
        theme === 'cyber'
          ? 'bg-gradient-to-b from-[#0e121a] to-[#080a0f] border-cyan-500/30'
          : 'bg-[#fefce8] border-amber-300'
      }`}>
        {/* 3x3 Interactive Grid */}
        <div className="grid grid-cols-3 gap-3 aspect-square">
          {board.map((cell, idx) => {
            const isWinningCell = winningLine?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={cell !== null || winner !== null || matchWinner !== null}
                className={`rounded-2xl flex items-center justify-center font-display font-black text-4xl transition-all shadow-inner select-none ${
                  theme === 'cyber'
                    ? `border ${
                        isWinningCell
                          ? 'border-[#ADFF2F] bg-[#ADFF2F]/20 text-[#ADFF2F] scale-105 shadow-lg shadow-[#ADFF2F]/30 animate-pulse'
                          : cell === 'X'
                          ? 'border-[#00F0FF]/50 bg-[#00F0FF]/10 text-[#00F0FF]'
                          : cell === 'O'
                          ? 'border-pink-500/50 bg-pink-500/10 text-pink-400'
                          : 'border-gray-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-cyan-500/40 text-transparent'
                      }`
                    : `border-2 ${
                        isWinningCell
                          ? 'border-emerald-600 bg-emerald-100 text-emerald-800 scale-105'
                          : cell === 'X'
                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                          : cell === 'O'
                          ? 'border-red-500 bg-red-50 text-red-800'
                          : 'border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-transparent'
                      }`
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>

        {/* Set Round Status Banner */}
        {winner && !matchWinner && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-center space-y-2">
            <span className="text-xs font-mono font-bold text-[#00F0FF] block">
              {winner === 'TIE' ? 'ROUND TIED! 🤝' : `ROUND WON BY ${winner}! 🎉`}
            </span>
            <button
              onClick={resetSet}
              className="cyber-button px-5 py-1.5 rounded-lg text-xs font-black text-slate-950 font-display"
            >
              NEXT ROUND ⚔️
            </button>
          </div>
        )}
      </div>

      {/* Series Championship Banner */}
      {matchWinner && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/90 to-purple-950/90 border-2 border-[#00F0FF] text-center space-y-4 shadow-2xl animate-fadeIn">
          <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide">
            🏆 {matchWinner}
          </h3>
          <p className="text-xs text-gray-300 font-mono">
            Best of 3 series complete! Series Score: P1 ({p1Wins}) vs P2 ({p2Wins})
          </p>
          <button
            onClick={resetMatch}
            className="cyber-button px-6 py-2.5 rounded-xl font-display text-xs font-black text-slate-950 shadow-lg"
          >
            START NEW SERIES
          </button>
        </div>
      )}
    </div>
  );
};
