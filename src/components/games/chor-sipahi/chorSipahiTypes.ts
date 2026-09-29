export type ChorSipahiRole = 'raja' | 'mantri' | 'sipahi' | 'chor';

export type GamePhase =
  | 'lobby'
  | 'role_reveal'
  | 'discussion'
  | 'sipahi_guess'
  | 'result_reveal'
  | 'game_over';

export interface RoleConfig {
  id: ChorSipahiRole;
  name: string;
  hindiName: string;
  icon: string;
  points: number;
  color: string;
  bgGradient: string;
  borderColor: string;
  description: string;
  objective: string;
}

export const ROLE_DEFINITIONS: Record<ChorSipahiRole, RoleConfig> = {
  raja: {
    id: 'raja',
    name: 'Raja',
    hindiName: 'राजा (King)',
    icon: '👑',
    points: 1000,
    color: '#FFD700',
    bgGradient: 'from-amber-500/20 via-yellow-500/10 to-amber-900/30',
    borderColor: '#FFD700',
    description: 'You are the supreme ruler of the court! Your identity is revealed to everyone.',
    objective: 'Order the Sipahi to catch the thief without revealing secret clues!'
  },
  mantri: {
    id: 'mantri',
    name: 'Mantri',
    hindiName: 'मंत्री (Minister)',
    icon: '🧠',
    points: 800,
    color: '#00F0FF',
    bgGradient: 'from-cyan-500/20 via-blue-500/10 to-cyan-900/30',
    borderColor: '#00F0FF',
    description: 'You are the wise royal advisor! Your identity is strictly hidden.',
    objective: 'Act confident and avoid being wrongfully accused as the Chor by the Sipahi.'
  },
  sipahi: {
    id: 'sipahi',
    name: 'Sipahi',
    hindiName: 'सिपाही (Soldier/Police)',
    icon: '👮',
    points: 500,
    color: '#ADFF2F',
    bgGradient: 'from-lime-500/20 via-emerald-500/10 to-green-900/30',
    borderColor: '#ADFF2F',
    description: 'You are the royal law enforcer! Your identity is hidden until the interrogation.',
    objective: 'Listen to the banter, read the suspects, and arrest the real Chor!'
  },
  chor: {
    id: 'chor',
    name: 'Chor',
    hindiName: 'चोर (Thief)',
    icon: '🥷',
    points: 0,
    color: '#FF0055',
    bgGradient: 'from-red-500/20 via-pink-500/10 to-red-950/40',
    borderColor: '#FF0055',
    description: 'You are the cunning thief in the shadows! Your identity is strictly confidential.',
    objective: 'Bluff hard, pretend to be the Mantri, and escape the Sipahi’s arrest!'
  }
};

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isBot: boolean;
  isReady: boolean;
  role?: ChorSipahiRole;
  roundScore: number;
  totalScore: number;
  stats: {
    roundsPlayed: number;
    timesRaja: number;
    timesMantri: number;
    timesSipahi: number;
    timesChor: number;
    correctGuesses: number;
    wrongGuesses: number;
    escapesAsChor: number;
  };
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  roleHint?: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface RoundResult {
  roundNumber: number;
  rajaId: string;
  mantriId: string;
  sipahiId: string;
  chorId: string;
  guessedPlayerId: string;
  isCorrectGuess: boolean;
  scores: Record<string, number>;
  timestamp: number;
}

export interface GameRoomState {
  roomCode: string;
  roomName: string;
  isPrivate: boolean;
  phase: GamePhase;
  roundNumber: number;
  maxRounds: number;
  timeRemaining: number;
  players: Player[];
  hostId: string;
  activeSipahiId?: string;
  activeRajaId?: string;
  selectedSuspectId?: string;
  lastRoundResult?: RoundResult;
  history: RoundResult[];
  chatMessages: ChatMessage[];
}
