import { RoomPlayer } from '@/types/multiplayer';

export interface ActionValidationResult {
  valid: boolean;
  error?: string;
}

export interface ActionResult<TState = any> {
  nextState: TState;
  nextTurn: string | null;
  winnerId: string | null;
  winnerUsername?: string | null;
  isFinished: boolean;
  events?: { type: string; data: any }[];
}

export interface GameAdapter<TState = any, TAction = any> {
  gameId: string;
  gameTitle: string;
  minPlayers: number;
  maxPlayers: number;

  /**
   * Generates the initial authoritative server state when a match starts
   */
  getInitialState: (players: RoomPlayer[], settings?: Record<string, any>) => TState;

  /**
   * Validates if a proposed player move is legal according to rules and turn order
   */
  validateAction: (
    state: TState,
    action: TAction,
    playerId: string,
    currentTurn: string | null,
    players: RoomPlayer[]
  ) => ActionValidationResult;

  /**
   * Authoritatively applies a valid move, updates state, calculates winners/ties, and advances turn
   */
  applyAction: (
    state: TState,
    action: TAction,
    playerId: string,
    players: RoomPlayer[]
  ) => ActionResult<TState>;

  /**
   * Optionally handles turn timeout if a player exceeds their timer
   */
  handleTurnTimeout?: (
    state: TState,
    currentTurn: string | null,
    players: RoomPlayer[]
  ) => ActionResult<TState>;
}
