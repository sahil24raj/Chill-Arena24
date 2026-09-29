import { GameAdapter, ActionValidationResult, ActionResult } from './types';
import { RoomPlayer } from '@/types/multiplayer';

export interface SpinCricketState {
  currentInnings: 1 | 2;
  battingPlayerId: string;
  bowlingPlayerId: string;
  innings1: {
    runs: number;
    wickets: number;
    ballsBowled: number;
    timeline: string[];
  };
  innings2: {
    runs: number;
    wickets: number;
    ballsBowled: number;
    timeline: string[];
    target: number;
  };
  maxOvers: number;
  maxBalls: number;
  maxWickets: number;
  lastOutcome: string | null;
}

export interface SpinCricketAction {
  type: 'SPIN_RESULT';
  outcome: '1' | '2' | '3' | '4' | '6' | 'OUT' | 'DOT';
}

export const SpinCricketAdapter: GameAdapter<SpinCricketState, SpinCricketAction> = {
  gameId: 'spin-cricket',
  gameTitle: 'Spin Cricket (Book Cricket) 🏏',
  minPlayers: 2,
  maxPlayers: 2,

  getInitialState: (players: RoomPlayer[], settings?: Record<string, any>): SpinCricketState => {
    const p1 = players[0]?.id || 'p1';
    const p2 = players[1]?.id || 'p2';

    return {
      currentInnings: 1,
      battingPlayerId: p1,
      bowlingPlayerId: p2,
      innings1: {
        runs: 0,
        wickets: 0,
        ballsBowled: 0,
        timeline: []
      },
      innings2: {
        runs: 0,
        wickets: 0,
        ballsBowled: 0,
        timeline: [],
        target: 0
      },
      maxOvers: 2,
      maxBalls: 12,
      maxWickets: 3,
      lastOutcome: null
    };
  },

  validateAction: (
    state: SpinCricketState,
    action: SpinCricketAction,
    playerId: string,
    currentTurn: string | null
  ): ActionValidationResult => {
    if (action.type !== 'SPIN_RESULT') {
      return { valid: false, error: 'Unknown action' };
    }
    if (playerId !== state.battingPlayerId) {
      return { valid: false, error: 'Only the current batter can spin!' };
    }
    return { valid: true };
  },

  applyAction: (
    state: SpinCricketState,
    action: SpinCricketAction,
    playerId: string,
    players: RoomPlayer[]
  ): ActionResult<SpinCricketState> => {
    const outcome = action.outcome;
    const isOut = outcome === 'OUT';
    const runMap: Record<string, number> = { '1': 1, '2': 2, '3': 3, '4': 4, '6': 6, 'DOT': 0, 'OUT': 0 };
    const runsAdded = runMap[outcome] || 0;

    if (state.currentInnings === 1) {
      const balls = state.innings1.ballsBowled + 1;
      const runs = state.innings1.runs + runsAdded;
      const wickets = state.innings1.wickets + (isOut ? 1 : 0);
      const timeline = [...state.innings1.timeline, outcome];

      const inningsOver = wickets >= state.maxWickets || balls >= state.maxBalls;

      if (inningsOver) {
        // Swap innings
        const nextBattingId = state.bowlingPlayerId;
        const nextBowlingId = state.battingPlayerId;
        const target = runs + 1;

        return {
          nextState: {
            ...state,
            currentInnings: 2,
            battingPlayerId: nextBattingId,
            bowlingPlayerId: nextBowlingId,
            innings1: { runs, wickets, ballsBowled: balls, timeline },
            innings2: { ...state.innings2, target },
            lastOutcome: outcome
          },
          nextTurn: nextBattingId,
          winnerId: null,
          isFinished: false,
          events: [{ type: 'INNINGS_BREAK', data: { target, runsScored: runs } }]
        };
      } else {
        return {
          nextState: {
            ...state,
            innings1: { runs, wickets, ballsBowled: balls, timeline },
            lastOutcome: outcome
          },
          nextTurn: state.battingPlayerId,
          winnerId: null,
          isFinished: false
        };
      }
    } else {
      // Innings 2 (Chase)
      const balls = state.innings2.ballsBowled + 1;
      const runs = state.innings2.runs + runsAdded;
      const wickets = state.innings2.wickets + (isOut ? 1 : 0);
      const timeline = [...state.innings2.timeline, outcome];

      const target = state.innings2.target;
      const chaseWon = runs >= target;
      const allOutOrOversUp = wickets >= state.maxWickets || balls >= state.maxBalls;

      if (chaseWon) {
        // Batter won
        const winnerId = state.battingPlayerId;
        return {
          nextState: {
            ...state,
            innings2: { ...state.innings2, runs, wickets, ballsBowled: balls, timeline },
            lastOutcome: outcome
          },
          nextTurn: null,
          winnerId,
          winnerUsername: players.find((p) => p.id === winnerId)?.username,
          isFinished: true,
          events: [{ type: 'MATCH_WON', data: { winnerId } }]
        };
      } else if (allOutOrOversUp) {
        let winnerId: string | null = null;
        if (runs === target - 1) {
          // Tie
          winnerId = null;
        } else {
          winnerId = state.bowlingPlayerId; // Defended successfully
        }

        return {
          nextState: {
            ...state,
            innings2: { ...state.innings2, runs, wickets, ballsBowled: balls, timeline },
            lastOutcome: outcome
          },
          nextTurn: null,
          winnerId,
          winnerUsername: winnerId ? players.find((p) => p.id === winnerId)?.username : null,
          isFinished: true,
          events: [{ type: 'MATCH_WON', data: { winnerId } }]
        };
      }

      return {
        nextState: {
          ...state,
          innings2: { ...state.innings2, runs, wickets, ballsBowled: balls, timeline },
          lastOutcome: outcome
        },
        nextTurn: state.battingPlayerId,
        winnerId: null,
        isFinished: false
      };
    }
  }
};
