import { GameAdapter, ActionValidationResult, ActionResult } from './types';
import { RoomPlayer } from '@/types/multiplayer';

export type CellValue = 'X' | 'O' | null;

export interface TicTacToeState {
  board: CellValue[];
  symbolMap: Record<string, 'X' | 'O'>; // playerId -> 'X' or 'O'
  rounds: {
    roundNumber: number;
    playerScores: Record<string, number>; // playerId -> round score
    targetWins: number;
  };
  lastMove: {
    index: number;
    symbol: 'X' | 'O';
    playerId: string;
  } | null;
  winningLine: number[] | null;
}

export interface TicTacToeAction {
  type: 'PLACE_SYMBOL';
  index: number;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const TicTacToeAdapter: GameAdapter<TicTacToeState, TicTacToeAction> = {
  gameId: 'tic-tac-toe',
  gameTitle: 'Neon & Notebook Tic-Tac-Toe ❌⭕',
  minPlayers: 2,
  maxPlayers: 2,

  getInitialState: (players: RoomPlayer[], settings?: Record<string, any>): TicTacToeState => {
    const symbolMap: Record<string, 'X' | 'O'> = {};
    if (players[0]) symbolMap[players[0].id] = 'X';
    if (players[1]) symbolMap[players[1].id] = 'O';

    const playerScores: Record<string, number> = {};
    players.forEach((p) => {
      playerScores[p.id] = 0;
    });

    return {
      board: Array(9).fill(null),
      symbolMap,
      rounds: {
        roundNumber: 1,
        playerScores,
        targetWins: settings?.roundsToWin || 2 // Best of 3 sets by default
      },
      lastMove: null,
      winningLine: null
    };
  },

  validateAction: (
    state: TicTacToeState,
    action: TicTacToeAction,
    playerId: string,
    currentTurn: string | null,
    players: RoomPlayer[]
  ): ActionValidationResult => {
    if (action.type !== 'PLACE_SYMBOL') {
      return { valid: false, error: 'Unknown action type' };
    }

    if (currentTurn !== playerId) {
      return { valid: false, error: 'Not your turn!' };
    }

    const { index } = action;
    if (typeof index !== 'number' || index < 0 || index > 8) {
      return { valid: false, error: 'Invalid cell index' };
    }

    if (state.board[index] !== null) {
      return { valid: false, error: 'Cell is already occupied!' };
    }

    if (!state.symbolMap[playerId]) {
      return { valid: false, error: 'Player symbol not assigned' };
    }

    return { valid: true };
  },

  applyAction: (
    state: TicTacToeState,
    action: TicTacToeAction,
    playerId: string,
    players: RoomPlayer[]
  ): ActionResult<TicTacToeState> => {
    const symbol = state.symbolMap[playerId];
    const newBoard = [...state.board];
    newBoard[action.index] = symbol;

    // Check winner on current board
    let winningCombo: number[] | null = null;
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        winningCombo = combo;
        break;
      }
    }

    const isBoardFull = newBoard.every((cell) => cell !== null);
    const otherPlayer = players.find((p) => p.id !== playerId);
    const nextTurn = otherPlayer ? otherPlayer.id : null;

    // If someone won this round
    if (winningCombo) {
      const currentWins = (state.rounds.playerScores[playerId] || 0) + 1;
      const updatedScores = {
        ...state.rounds.playerScores,
        [playerId]: currentWins
      };

      const hasWonMatch = currentWins >= state.rounds.targetWins;

      if (hasWonMatch) {
        return {
          nextState: {
            ...state,
            board: newBoard,
            winningLine: winningCombo,
            lastMove: { index: action.index, symbol, playerId },
            rounds: {
              ...state.rounds,
              playerScores: updatedScores
            }
          },
          nextTurn: null,
          winnerId: playerId,
          winnerUsername: players.find((p) => p.id === playerId)?.username,
          isFinished: true,
          events: [
            { type: 'ROUND_WON', data: { winnerId: playerId, line: winningCombo } },
            { type: 'MATCH_WON', data: { winnerId: playerId } }
          ]
        };
      } else {
        // Next set
        return {
          nextState: {
            ...state,
            board: Array(9).fill(null),
            winningLine: null,
            lastMove: null,
            rounds: {
              roundNumber: state.rounds.roundNumber + 1,
              playerScores: updatedScores,
              targetWins: state.rounds.targetWins
            }
          },
          nextTurn: otherPlayer ? otherPlayer.id : playerId,
          winnerId: null,
          isFinished: false,
          events: [
            { type: 'ROUND_WON', data: { winnerId: playerId, line: winningCombo } },
            { type: 'NEXT_ROUND', data: { roundNumber: state.rounds.roundNumber + 1 } }
          ]
        };
      }
    }

    // Tie round
    if (isBoardFull) {
      return {
        nextState: {
          ...state,
          board: Array(9).fill(null),
          winningLine: null,
          lastMove: null,
          rounds: {
            ...state.rounds,
            roundNumber: state.rounds.roundNumber + 1
          }
        },
        nextTurn: otherPlayer ? otherPlayer.id : playerId,
        winnerId: null,
        isFinished: false,
        events: [{ type: 'ROUND_TIE', data: { roundNumber: state.rounds.roundNumber } }]
      };
    }

    // Regular move
    return {
      nextState: {
        ...state,
        board: newBoard,
        winningLine: null,
        lastMove: { index: action.index, symbol, playerId }
      },
      nextTurn,
      winnerId: null,
      isFinished: false
    };
  }
};
