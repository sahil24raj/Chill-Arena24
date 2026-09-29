/**
 * Chill Arena - Production-Grade Multiplayer Type Definitions
 * Typed contracts for rooms, players, authoritative game states, and real-time events.
 */

export type RoomStatus =
  | 'WAITING'
  | 'READY'
  | 'STARTING'
  | 'PLAYING'
  | 'PAUSED'
  | 'FINISHED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PlayerConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export type PlayerRole = 'host' | 'player' | 'spectator';

export interface RoomPlayer {
  id: string; // Unique session player ID (e.g., usr_xxx or socket/guest id)
  userId: string;
  username: string;
  displayName?: string;
  avatar: string;
  role: PlayerRole;
  isHost: boolean;
  isReady: boolean;
  connectionStatus: PlayerConnectionStatus;
  score: number;
  joinedAt: number;
  lastSeenAt: number;
  customData?: Record<string, any>;
}

export interface RoomSettings {
  isPrivate: boolean;
  turnTimeLimitSec: number;
  roundsToWin?: number;
  allowSpectators?: boolean;
  maxPlayers?: number;
  [key: string]: any;
}

export interface MultiplayerRoomState<TGameState = Record<string, any>> {
  roomId: string;
  roomCode: string; // 6-character clean uppercase room code (e.g. X7K92P)
  gameId: string;
  gameTitle: string;
  hostId: string;
  hostUsername: string;
  players: RoomPlayer[];
  maxPlayers: number;
  minPlayers: number;
  status: RoomStatus;
  stateVersion: number; // Monotonically increasing version to eliminate desync
  currentTurnPlayerId: string | null;
  winnerPlayerId: string | null;
  winnerUsername?: string | null;
  countdown: number | null; // 3, 2, 1, 0 for synchronized game start
  gameState: TGameState;
  settings: RoomSettings;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
}

export type MultiplayerErrorCode =
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'GAME_ALREADY_STARTED'
  | 'ROOM_EXPIRED'
  | 'INVALID_ROOM_CODE'
  | 'ALREADY_JOINED'
  | 'UNAUTHORIZED'
  | 'NOT_YOUR_TURN'
  | 'INVALID_MOVE'
  | 'NOT_ENOUGH_PLAYERS'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export interface MultiplayerApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: MultiplayerErrorCode;
}

export interface PlayerActionPayload {
  playerId: string;
  actionType: string;
  actionData: Record<string, any>;
  clientTimestamp: number;
  expectedVersion?: number;
}

export type MultiplayerEventType =
  | 'ROOM_CREATED'
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'PLAYER_READY'
  | 'GAME_STARTING'
  | 'GAME_STARTED'
  | 'PLAYER_MOVE'
  | 'GAME_STATE_UPDATED'
  | 'TURN_CHANGED'
  | 'PLAYER_DISCONNECTED'
  | 'PLAYER_RECONNECTED'
  | 'GAME_FINISHED'
  | 'ROOM_CLOSED'
  | 'HOST_TRANSFERRED'
  | 'CHAT_MESSAGE'
  | 'ROAST_SENT';

export interface MultiplayerEvent<TData = any> {
  id: string;
  roomId: string;
  type: MultiplayerEventType;
  senderId: string;
  senderName: string;
  data: TData;
  stateVersion: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  isRoast?: boolean;
}
