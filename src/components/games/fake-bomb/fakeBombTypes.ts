import { FakeBombPuzzleConfig, ClueCard } from '@/lib/game-engine/fakeBombPuzzles';

export type PlayerRole = 'operator' | 'gremlin';

export type GamePhase =
  | 'mode_select'
  | 'lobby'
  | 'countdown'
  | 'playing'
  | 'round_success'
  | 'round_fail'
  | 'voting'
  | 'vote_reveal'
  | 'match_over';

export interface FakeBombPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isAi: boolean;
  role: PlayerRole;
  clue?: ClueCard;
  suspicionScore: number;
  ready: boolean;
  votedFor?: string;
  votesReceived: number;
  tag?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
  isSystem?: boolean;
  badge?: string;
}

export interface DuckPopEffect {
  id: string;
  x: number;
  y: number;
  emoji: string;
  label?: string;
}

export interface RoundScoreBreakdown {
  round: number;
  cleared: boolean;
  sequencePoints: number;
  timeBonus: number;
  perfectBonus: number;
  gremlinBonus: number;
  gremlinPenalty: number;
  totalRoundPoints: number;
}
