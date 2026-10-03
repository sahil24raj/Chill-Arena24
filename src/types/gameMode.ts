export type GameModeType = 'ai' | 'pass-and-play' | 'online';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface PlayerSetup {
  id: string;
  name: string;
  avatar: string;
  isAI?: boolean;
  aiDifficulty?: AIDifficulty;
  teamId?: string;
  score?: number;
  isEliminated?: boolean;
}

export interface GameModeSelection {
  mode: GameModeType;
  difficulty: AIDifficulty;
  players: PlayerSetup[];
  onlineRoomCode?: string;
  isOnlineHost?: boolean;
  botFillMode?: 'manual' | 'auto' | 'none';
}

export const DEFAULT_AVATARS = [
  '🚀', '👑', '⚡', '🔥', '🏏', '🥷', '🦁', '🦊',
  '🎯', '⭐', '💎', '🎮', '💀', '🤖', '🐱', '🍕'
];

export const BOT_NAME_PRESETS = [
  { name: 'AlphaBot', avatar: '🤖' },
  { name: 'CyberBlade', avatar: '⚡' },
  { name: 'NeonSage', avatar: '🧠' },
  { name: 'VortexAI', avatar: '🌀' },
  { name: 'PixelSamurai', avatar: '🥷' },
  { name: 'GrandMaster AI', avatar: '👑' },
  { name: 'QuantumStrike', avatar: '🚀' },
  { name: 'ShadowByte', avatar: '💀' }
];
