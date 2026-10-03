'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameLifecycleWrapper } from '@/lib/game-engine/GameLifecycleWrapper';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import { GameStatus } from '@/lib/game-engine/types';
import { UniversalGameModeSelector } from '@/components/game-shell/UniversalGameModeSelector';
import { UniversalMatchEndModal, MatchStatItem } from '@/components/game-shell/UniversalMatchEndModal';
import { GameModeSelection, GameModeType, AIDifficulty, PlayerSetup } from '@/types/gameMode';
import confetti from 'canvas-confetti';
import { Bot, User, Trophy, Sparkles, Users, Globe } from 'lucide-react';

type CellValue = 'X' | 'O' | null;

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export const TicTacToeCanvas: React.FC = () => {
  const { user, submitGameScore, openMultiplayerModal } = useAppStore();

  // Mode Selection State
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [currentMode, setCurrentMode] = useState<GameModeType>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { id: user.id || 'p1', name: user.displayName || user.username || 'You', avatar: user.avatar || '❌', isAI: false },
    { id: 'ai-bot', name: 'AI Bot (MED)', avatar: '🤖', isAI: true },
  ]);

  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isPlayer1Turn, setIsPlayer1Turn] = useState(true);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [player1Wins, setPlayer1Wins] = useState(0);
  const [player2Wins, setPlayer2Wins] = useState(0);

  // Match End Modal State
  const [showEndModal, setShowEndModal] = useState(false);
  const [matchWinnerTitle, setMatchWinnerTitle] = useState('');
  const [matchWinnerSubtitle, setMatchWinnerSubtitle] = useState('');
  const [isMatchVictory, setIsMatchVictory] = useState(true);
  const [isMatchDraw, setIsMatchDraw] = useState(false);
  const [matchStats, setMatchStats] = useState<MatchStatItem[]>([]);

  useEffect(() => {
    const stored = user.stats.highScores?.['tic-tac-toe'] || 0;
    setHighScore(stored);
  }, [user.stats.highScores]);

  const activePlayer = isPlayer1Turn ? players[0] : players[1];
  const activeSymbol: CellValue = isPlayer1Turn ? 'X' : 'O';

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

  const handleStartGame = (mode?: GameModeType, diff?: AIDifficulty, customPlayers?: PlayerSetup[]) => {
    if (mode) setCurrentMode(mode);
    if (diff) setAiDifficulty(diff);
    if (customPlayers) setPlayers(customPlayers);

    setShowEndModal(false);
    setStatus('PLAYING');
    setScore(0);
    setCombo(0);
    setBoard(Array(9).fill(null));
    setIsPlayer1Turn(true);
    setWinningLine(null);
    setRoundNumber(1);
    setPlayer1Wins(0);
    setPlayer2Wins(0);
    GameSessionManager.startSession('tic-tac-toe', user);
  };

  const handleModeSelection = (selection: GameModeSelection) => {
    setShowModeSelector(false);
    if (selection.mode === 'online') {
      return;
    }
    handleStartGame(selection.mode, selection.difficulty, selection.players);
  };

  // Minimax Algorithm for unbeatable Hard AI
  const minimax = (
    currentBoard: CellValue[],
    depth: number,
    isMaximizing: boolean,
    aiSymbol: 'O',
    humanSymbol: 'X'
  ): { score: number; index?: number } => {
    const winnerRes = checkWinner(currentBoard);
    if (winnerRes?.winner === aiSymbol) return { score: 10 - depth };
    if (winnerRes?.winner === humanSymbol) return { score: depth - 10 };
    if (winnerRes?.winner === 'TIE') return { score: 0 };

    const availableMoves: number[] = [];
    currentBoard.forEach((val, idx) => {
      if (val === null) availableMoves.push(idx);
    });

    if (isMaximizing) {
      let bestScore = -Infinity;
      let bestMove = availableMoves[0];
      for (const move of availableMoves) {
        currentBoard[move] = aiSymbol;
        const result = minimax(currentBoard, depth + 1, false, aiSymbol, humanSymbol);
        currentBoard[move] = null;
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
      }
      return { score: bestScore, index: bestMove };
    } else {
      let bestScore = Infinity;
      let bestMove = availableMoves[0];
      for (const move of availableMoves) {
        currentBoard[move] = humanSymbol;
        const result = minimax(currentBoard, depth + 1, true, aiSymbol, humanSymbol);
        currentBoard[move] = null;
        if (result.score < bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
      }
      return { score: bestScore, index: bestMove };
    }
  };

  // AI Move Execution
  useEffect(() => {
    if (status === 'PLAYING' && currentMode === 'ai' && !isPlayer1Turn && !winningLine) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayer1Turn, status, winningLine, board, currentMode]);

  const makeAIMove = () => {
    const openIndices = board.map((val, idx) => (val === null ? idx : null)).filter((v) => v !== null) as number[];
    if (openIndices.length === 0) return;

    if (aiDifficulty === 'hard') {
      const best = minimax([...board], 0, true, 'O', 'X');
      const chosen = best.index !== undefined ? best.index : openIndices[0];
      commitMove(chosen, 'O');
      return;
    }

    if (aiDifficulty === 'medium') {
      // 1. Can AI win right now?
      for (const idx of openIndices) {
        const testBoard = [...board];
        testBoard[idx] = 'O';
        if (checkWinner(testBoard)?.winner === 'O') {
          commitMove(idx, 'O');
          return;
        }
      }
      // 2. Block player immediate win
      for (const idx of openIndices) {
        const testBoard = [...board];
        testBoard[idx] = 'X';
        if (checkWinner(testBoard)?.winner === 'X') {
          commitMove(idx, 'O');
          return;
        }
      }
      // 3. Take center if open
      if (!board[4]) {
        commitMove(4, 'O');
        return;
      }
      // 4. Random open
      const chosen = openIndices[Math.floor(Math.random() * openIndices.length)];
      commitMove(chosen, 'O');
      return;
    }

    // Easy AI: 60% random mistake, 40% center/corner
    if (Math.random() < 0.6) {
      const chosen = openIndices[Math.floor(Math.random() * openIndices.length)];
      commitMove(chosen, 'O');
    } else {
      if (!board[4]) {
        commitMove(4, 'O');
      } else {
        const chosen = openIndices[Math.floor(Math.random() * openIndices.length)];
        commitMove(chosen, 'O');
      }
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
      setIsPlayer1Turn(symbol === 'O');
    }
  };

  const handleCellClick = (idx: number) => {
    if (status !== 'PLAYING' || board[idx] || winningLine) return;
    if (currentMode === 'ai' && !isPlayer1Turn) return; // Prevent clicking on AI turn

    GameSessionManager.recordAction();
    commitMove(idx, activeSymbol);
  };

  const handleRoundFinish = (winner: 'X' | 'O' | 'TIE', line: number[] | null) => {
    if (line) setWinningLine(line);

    let roundScore = 0;
    let nextP1Wins = player1Wins;
    let nextP2Wins = player2Wins;
    let nextCombo = combo;

    if (winner === 'X') {
      soundFx.playCorrect();
      soundFx.playVictory();
      nextCombo += 1;
      roundScore = 100 + nextCombo * 30;
      nextP1Wins += 1;
      confetti({ particleCount: 40, spread: 60 });
    } else if (winner === 'O') {
      soundFx.playWrong();
      nextCombo = 0;
      nextP2Wins += 1;
    } else {
      soundFx.playHit();
      roundScore = 25;
    }

    setCombo(nextCombo);
    setPlayer1Wins(nextP1Wins);
    setPlayer2Wins(nextP2Wins);
    const newScore = score + roundScore;
    setScore(newScore);

    // Next round or tournament finish (Best of 3)
    setTimeout(async () => {
      if (roundNumber >= 3 || nextP1Wins >= 2 || nextP2Wins >= 2) {
        const isP1Win = nextP1Wins > nextP2Wins;
        const isTie = nextP1Wins === nextP2Wins;

        setStatus('GAMEOVER');
        let title = '';
        let subtitle = '';

        if (isP1Win) {
          title = `🏆 ${players[0].name} Wins Tournament!`;
          subtitle = `Dominated the grid with ${nextP1Wins}-${nextP2Wins} set victories!`;
        } else if (isTie) {
          title = `🤝 Tournament Tied!`;
          subtitle = `Evenly matched grid masters! Final sets: ${nextP1Wins}-${nextP2Wins}.`;
        } else {
          title = `🏆 ${players[1].name} Wins Tournament!`;
          subtitle = `Clinched match victory with ${nextP2Wins}-${nextP1Wins} sets!`;
        }

        setMatchWinnerTitle(title);
        setMatchWinnerSubtitle(subtitle);
        setIsMatchVictory(isP1Win);
        setIsMatchDraw(isTie);

        const statsList: MatchStatItem[] = [
          { label: `${players[0].name} Sets`, value: `${nextP1Wins} Won`, highlight: true },
          { label: `${players[1].name} Sets`, value: `${nextP2Wins} Won`, highlight: true },
          { label: 'Rounds Played', value: roundNumber },
          { label: 'Mode', value: currentMode === 'ai' ? `VS AI (${aiDifficulty.toUpperCase()})` : 'Pass & Play' },
          { label: 'Total Score', value: newScore },
        ];
        setMatchStats(statsList);
        setShowEndModal(true);

        if (newScore > highScore) {
          setHighScore(newScore);
        }
        await GameSessionManager.finishSession(newScore, isP1Win, user, highScore);
        await submitGameScore('tic-tac-toe', newScore, isP1Win);
      } else {
        // Reset for next set
        setRoundNumber((prev) => prev + 1);
        setBoard(Array(9).fill(null));
        setWinningLine(null);
        setIsPlayer1Turn(true);
      }
    }, 1400);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between select-none relative overflow-hidden">
      {/* Universal Mode Selector Modal */}
      <UniversalGameModeSelector
        gameTitle="Neon Tic-Tac-Toe ❌⭕"
        gameId="tic-tac-toe"
        user={user}
        isOpen={showModeSelector}
        onClose={() => setShowModeSelector(false)}
        onSelectMode={handleModeSelection}
        supportsAI={true}
        supportsPassAndPlay={true}
        supportsOnline={true}
        maxPassAndPlayPlayers={2}
      />

      {/* Universal Match End Modal */}
      <UniversalMatchEndModal
        isOpen={showEndModal}
        gameTitle="Neon Tic-Tac-Toe ❌⭕"
        gameId="tic-tac-toe"
        winnerTitle={matchWinnerTitle}
        winnerSubtitle={matchWinnerSubtitle}
        isVictory={isMatchVictory}
        isDraw={isMatchDraw}
        stats={matchStats}
        onPlayAgain={() => handleStartGame()}
        onChangeMode={() => {
          setShowEndModal(false);
          setShowModeSelector(true);
        }}
      />

      <GameLifecycleWrapper
        gameTitle="Super Tic-Tac-Toe: Best of 3"
        gameId="tic-tac-toe"
        category="Mind Strategy"
        instructions={[
          'Best-of-3 strategic grid duel.',
          'Align 3 identical symbols in a row (horizontal, vertical, or diagonal) to win each round.',
          'First to claim 2 rounds wins the match champion badge!',
        ]}
        controls={[
          { key: 'CLICK / TAP CELL', action: 'Place Symbol' },
          { key: 'ESC', action: 'Pause / Exit Fullscreen' },
        ]}
        status={status}
        score={score}
        highScore={highScore}
        combo={combo}
        onStart={() => handleStartGame()}
        onPause={() => setStatus('PAUSED')}
        onResume={() => setStatus('PLAYING')}
        onRestart={() => handleStartGame()}
        currentMode={currentMode}
        onSelectMode={(m) => {
          if (m !== 'online') {
            handleStartGame(m, aiDifficulty);
          }
        }}
        aiDifficulty={aiDifficulty}
        onSelectDifficulty={(d) => {
          setAiDifficulty(d);
          handleStartGame(currentMode, d);
        }}
        players={players}
        onOpenPassPlayConfig={() => setShowModeSelector(true)}
        onChangeMode={() => setShowModeSelector(true)}
        modeBadge={
          <span className="px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-[#00F0FF] text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
            {currentMode === 'ai' ? (
              <>
                <Bot className="w-3 h-3" />
                <span>VS AI ({aiDifficulty})</span>
              </>
            ) : currentMode === 'pass-and-play' ? (
              <>
                <Users className="w-3 h-3 text-purple-400" />
                <span className="text-purple-300">Pass & Play</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3 text-lime-400" />
                <span className="text-lime-300">Online Room</span>
              </>
            )}
          </span>
        }
        activePlayerInfo={
          <span className="text-[10px] font-mono text-gray-300 flex items-center gap-1">
            <span>Turn:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <span>{activePlayer.avatar}</span>
              <span>{activePlayer.name} ({activeSymbol})</span>
            </span>
          </span>
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 select-none max-w-lg mx-auto">
          {/* Top Scoreboard */}
          <div className="flex items-center justify-between w-full max-w-sm px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-mono shadow-lg">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="text-base">{players[0].avatar}</span>
              <span className="font-bold">{players[0].name} (X): {player1Wins}</span>
            </div>
            <span className="text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded-lg border border-yellow-400/30">
              ROUND {roundNumber} / 3
            </span>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="font-bold">{players[1].name} (O): {player2Wins}</span>
              <span className="text-base">{players[1].avatar}</span>
            </div>
          </div>

          {/* 3x3 Tic Tac Toe Grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-[min(75vw,290px)] h-[min(75vw,290px)] sm:w-[350px] sm:h-[350px] md:w-[380px] md:h-[380px] my-auto transition-all duration-300">
            {board.map((cell, idx) => {
              const isWinningCell = winningLine?.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  disabled={cell !== null || (currentMode === 'ai' && !isPlayer1Turn) || winningLine !== null}
                  className={`rounded-2xl font-black text-3xl sm:text-5xl md:text-6xl flex items-center justify-center transition-all border-2 shadow-xl cursor-pointer ${
                    isWinningCell
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-105 shadow-emerald-500/50'
                      : cell === 'X'
                      ? 'bg-slate-900 border-cyan-400 text-[#00F0FF]'
                      : cell === 'O'
                      ? 'bg-slate-900 border-rose-400 text-rose-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-900 active:scale-95'
                  }`}
                >
                  {cell}
                </button>
              );
            })}
          </div>

          {/* Bottom Turn Status */}
          <div className="text-xs font-mono text-cyan-300 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 shadow-md flex items-center gap-2">
            {currentMode === 'ai' && !isPlayer1Turn ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>🤖 AI Bot ({aiDifficulty.toUpperCase()}) is calculating move...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  👉 {activePlayer.name}'s Turn (Place {activeSymbol})
                </span>
              </>
            )}
          </div>
        </div>
      </GameLifecycleWrapper>
    </div>
  );
};
