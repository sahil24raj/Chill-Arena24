export type GameStatus = 'MENU' | 'INSTRUCTIONS' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export interface GameSessionStartResponse {
  success: boolean;
  sessionId: string;
  sessionToken: string;
  gameId: string;
  startTime: number;
  seed: number;
  error?: string;
}

export interface GameSessionFinishPayload {
  sessionId: string;
  sessionToken: string;
  gameId: string;
  score: number;
  durationMs: number;
  actionsCount: number;
  isWin?: boolean;
  metrics?: Record<string, any>;
  uid?: string;
  username?: string;
}

export interface GameSessionFinishResponse {
  success: boolean;
  validatedScore: number;
  isNewHighScore: boolean;
  xpEarned: number;
  coinsEarned: number;
  rank: string;
  timestamp: string;
  error?: string;
  cheatingDetected?: boolean;
}

export interface AudioSettings {
  muted: boolean;
  masterVolume: number;
  sfxVolume: number;
  bgmVolume: number;
}
