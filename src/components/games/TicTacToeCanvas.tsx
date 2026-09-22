'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus, GameSessionFinishResponse } from '@/lib/game-engine/types';
import confetti from 'canvas-confetti';
import { Bot, User, Trophy, Sparkles } from 'lucide-react';

type CellValue = 'X' | 'O' | null;

export const TicTacToeCanvas: React.FC = () => {
  const { user, submitGameScore } = useAppStore();

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [resultData, setResultData] = useState<GameSessionFinishResponse | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [playerWins, setPlayerWins] = useState(0);
  const [aiWins, setAiWins] = useState(0);

  const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  useEffect(() => {
    const stored = user.stats.highScores?.['tic-tac-toe'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const handleStartGame = async () => {
    await GameSessionManager.startSession('tic-tac-toe', user);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinningLine(null);
    setRoundNumber(1);
    setPlayerWins(0);
    setAiWins(0);
    setResultData(null);
  };

  const handlePause = () => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
    }
  };

  const handleResume = () => {
    if (status === 'PAUSED') {
      setStatus('PLAYING');
    }
  };

  const handleRestart = () => {
    handleStartGame();
  };

  const checkWinner = (b: CellValue[]) => {
    for (const combo of WINNING_COMBOS) {
      const [x, y, z] = combo;
      if (b[x] && b[x] === b[y] && b[x] === b[z]) {
        return { winner: b[x], line: combo };
      }
    }
    if (b.every((cell) => cell !== null)) {
      return { winner: 'TIE' as const, line: null };
    }
    return null;
  };

  // AI Move (Minimax with blocking)
  useEffect(() => {
    if (status === 'PLAYING' && !isPlayerTurn && !winningLine) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, status, winningLine, board]);

  const makeAIMove = () => {
    // 1. Can AI win now?
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const testBoard = [...board];
        testBoard[i] = 'O';
        if (checkWinner(testBoard)?.winner === 'O') {
          commitMove(i, 'O');
          return;
        }
      }
    }

    // 2. Block player immediate win
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const testBoard = [...board];
        testBoard[i] = 'X';
        if (checkWinner(testBoard)?.winner === 'X') {
          commitMove(i, 'O');
          return;
        }
      }
    }

    // 3. Take center if open
    if (!board[4]) {
      commitMove(4, 'O');
      return;
    }

    // 4. Random open corner or side
    const openIndices = board.map((val, idx) => (val === null ? idx : null)).filter((v) => v !== null) as number[];
    if (openIndices.length > 0) {
      const chosen = openIndices[Math.floor(Math.random() * openIndices.length)];
      commitMove(chosen, 'O');
    }
  };

  const commitMove = (idx: number, symbol: 'X' | 'O') => {
    soundFx.playClick();
    const nextBoard = [...board];
    nextBoard[idx] = symbol;
    setBoard(nextBoard);

    const res = checkWinner(nextBoard);
    if (res) {
      handleRoundFinish(res.winner, res.line);
    } else {
      setIsPlayerTurn(symbol === 'O');
    }
  };

  const handleCellClick = (idx: number) => {
    if (status !== 'PLAYING' || !isPlayerTurn || board[idx] || winningLine) return;
    GameSessionManager.recordAction();
    commitMove(idx, 'X');
  };

  const handleRoundFinish = (winner: 'X' | 'O' | 'TIE', line: number[] | null) => {
    if (line) setWinningLine(line);

    let roundScore = 0;
    let nextPlayerWins = playerWins;
    let nextAiWins = aiWins;
    let nextCombo = combo;

    if (winner === 'X') {
      soundFx.playCorrect();
      soundFx.playVictory();
      nextCombo += 1;
      roundScore = 100 + nextCombo * 30;
      nextPlayerWins += 1;
      confetti({ particleCount: 40, spread: 60 });
    } else if (winner === 'O') {
      soundFx.playWrong();
      nextCombo = 0;
      nextAiWins += 1;
    } else {
      soundFx.playHit();
      roundScore = 25;
    }

    setCombo(nextCombo);
    setPlayerWins(nextPlayerWins);
    setAiWins(nextAiWins);
    const newScore = score + roundScore;
    setScore(newScore);

    // Next round or match over (Best of 3)
    setTimeout(async () => {
      if (roundNumber >= 3 || nextPlayerWins >= 2 || nextAiWins >= 2) {
        const isMatchWin = nextPlayerWins > nextAiWins;
        soundFx.playGameOver();
        setStatus(isMatchWin ? 'VICTORY' : 'GAMEOVER');

        const finalScore = newScore + (isMatchWin ? 150 : 0);
        setScore(finalScore);

        const res = await GameSessionManager.finishSession(finalScore, isMatchWin, user, highScore);
        setResultData(res);
        await submitGameScore('tic-tac-toe', finalScore, isMatchWin);

        if (finalScore > highScore) {
          setHighScore(finalScore);
          confetti({ particleCount: 60, spread: 70 });
        }
      } else {
        // Reset for next round
        setRoundNumber((prev) => prev + 1);
        setBoard(Array(9).fill(null));
        setWinningLine(null);
        setIsPlayerTurn(true);
      }
    }, 1400);
  };

  return (
    <GameLifecycleWrapper
      gameTitle="Super Tic Tac Toe: AI Duel"
      gameId="tic-tac-toe"
      category="Mind Strategy"
      instructions={[
        'Play a Best-of-3 tactical Tic-Tac-Toe duel against the smart AI bot.',
        'Align 3 in a row (Horizontal, Vertical, or Diagonal) to win each set.',
        'Winning 2 out of 3 rounds awards tournament victory and leaderboard points!',
      ]}
      controls={[
        { key: 'CLICK / TAP CELL', action: 'Place X Mark' },
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
      <div className="w-full h-full flex flex-col items-center justify-between p-6 select-none">
        {/* Top Scoreboard */}
        <div className="flex items-center justify-between w-full max-w-sm px-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-400">
            <User className="w-4 h-4" />
            <span>YOU (X): {playerWins}</span>
          </div>
          <span className="text-yellow-400 font-bold">ROUND {roundNumber} / 3</span>
          <div className="flex items-center gap-2 text-rose-400">
            <span>AI (O): {aiWins}</span>
            <Bot className="w-4 h-4" />
          </div>
        </div>

        {/* 3x3 Tic Tac Toe Grid */}
        <div className="grid grid-cols-3 gap-3 w-64 h-64 my-auto">
          {board.map((cell, idx) => {
            const isWinningCell = winningLine?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={cell !== null || !isPlayerTurn || winningLine !== null}
                className={`rounded-2xl font-black text-4xl flex items-center justify-center transition-all border-2 shadow-xl cursor-pointer ${
                  isWinningCell
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-105 shadow-emerald-500/50'
                    : cell === 'X'
                    ? 'bg-slate-900 border-cyan-400 text-[#00F0FF]'
                    : cell === 'O'
                    ? 'bg-slate-900 border-rose-400 text-rose-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>

        {/* Bottom Turn Status */}
        <div className="text-xs font-mono text-gray-400">
          {isPlayerTurn ? '👉 YOUR TURN (Place X)' : '🤖 AI BOT IS THINKING...'}
        </div>
      </div>
    </GameLifecycleWrapper>
  );
};
