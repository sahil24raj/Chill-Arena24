export type GameModeType = 'ai' | 'pass-and-play' | 'online';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface PlayerSetup {
  id: string;
  name: string;
  avatar: string;
  isAI?: boolean;
}

export interface GameModeSelection {
  mode: GameModeType;
  difficulty: AIDifficulty;
  players: PlayerSetup[];
  onlineRoomCode?: string;
  isOnlineHost?: boolean;
}

export const DEFAULT_AVATARS = [
  '🚀', '👑', '⚡', '🔥', '🏏', '🥷', '🦁', '🦊',
  '🎯', '⭐', '💎', '🎮', '💀', '🤖', '🐱', '🍕'
];
