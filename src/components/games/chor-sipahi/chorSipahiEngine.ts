import {
  ChorSipahiRole,
  Player,
  ROLE_DEFINITIONS,
  RoundResult,
  GameRoomState,
  ChatMessage
} from './chorSipahiTypes';

export const BOT_NAMES = [
  { name: 'Chulbul Pandey', avatar: '🕶️' },
  { name: 'Gabbar Singh', avatar: '🤠' },
  { name: 'Tenali Rama', avatar: '📜' },
  { name: 'Birbal The Wise', avatar: '👳' },
  { name: 'Crime Master Gogo', avatar: '🎭' },
  { name: 'Inspector Daya', avatar: '🚪' },
  { name: 'Munna Bhai', avatar: '🩺' },
  { name: 'Circuit', avatar: '🤝' }
];

export const BOT_BANTER_LINES = {
  raja: [
    '👑 Mera Mantri kaun aur Chor kaun? Sipahi, court me sab ki checking karo!',
    '👑 Maharaj ki jai ho! Sipahi, galat aadmi pakda toh tankha katega!',
    '👑 Insaaf hoga! Sipahi, dhyan se socho aur Chor ko pakdo!'
  ],
  mantri: [
    '🧠 Maharaj! Main aapka imandaar Mantri hoon, sab sach bol raha hoon.',
    '🧠 Sipahi bhai, meri taraf mat dekhna, main to audit kar raha tha! 😇',
    '🧠 Jo zyada chillayega wahi chor niklega, mark my words!',
    '🧠 Trust me bro, main 800 points wala Mantri hoon! 📜'
  ],
  sipahi: [
    '👮 Meri 6th sense bol rahi hai ki Chor yahi aas paas hai...',
    '👮 Koi hilega nahi! Sabke chehre padh raha hoon main!',
    '👮 Kanoon ke haath bohot lambe hain! Sach ugal do!'
  ],
  chor: [
    '🥷 Arre bhai main to bilkul innocent hoon, Mantri ji ki shapat!',
    '🥷 Sach bolu toh mujhe lagta hai wo dusra banda sus hai! 👀',
    '🥷 Main toh chup chap baitha tha, mujhe kyu ghasit rahe ho? 😂',
    '🥷 Sipahi bhai galat fehmi me mat aana, main Mantri hoon pakka!'
  ]
};

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function shuffleRoles(players: Player[], previousRounds: RoundResult[] = []): Player[] {
  if (players.length !== 4) return players;

  const roles: ChorSipahiRole[] = ['raja', 'mantri', 'sipahi', 'chor'];
  
  // Fisher-Yates Shuffle
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  // Avoid exact identical assignments if there was an immediate previous round
  if (previousRounds.length > 0) {
    const last = previousRounds[previousRounds.length - 1];
    if (
      players[0].id === last.rajaId && roles[0] === 'raja' &&
      players[1].id === last.mantriId && roles[1] === 'mantri'
    ) {
      // Rotate 1 position to ensure variation
      roles.push(roles.shift()!);
    }
  }

  return players.map((player, index) => ({
    ...player,
    role: roles[index],
    roundScore: 0
  }));
}

export function calculateRoundScores(
  players: Player[],
  guessedPlayerId: string,
  sipahiPlayer: Player,
  chorPlayer: Player
): { updatedPlayers: Player[]; isCorrect: boolean } {
  const isCorrect = guessedPlayerId === chorPlayer.id;

  const updatedPlayers = players.map((p) => {
    let earnedPoints = 0;
    if (p.role) {
      earnedPoints = ROLE_DEFINITIONS[p.role].points;
    }

    const isSipahi = p.id === sipahiPlayer.id;
    const isChor = p.id === chorPlayer.id;

    return {
      ...p,
      roundScore: earnedPoints,
      totalScore: p.totalScore + earnedPoints,
      stats: {
        ...p.stats,
        roundsPlayed: p.stats.roundsPlayed + 1,
        timesRaja: p.role === 'raja' ? p.stats.timesRaja + 1 : p.stats.timesRaja,
        timesMantri: p.role === 'mantri' ? p.stats.timesMantri + 1 : p.stats.timesMantri,
        timesSipahi: p.role === 'sipahi' ? p.stats.timesSipahi + 1 : p.stats.timesSipahi,
        timesChor: p.role === 'chor' ? p.stats.timesChor + 1 : p.stats.timesChor,
        correctGuesses: isSipahi && isCorrect ? p.stats.correctGuesses + 1 : p.stats.correctGuesses,
        wrongGuesses: isSipahi && !isCorrect ? p.stats.wrongGuesses + 1 : p.stats.wrongGuesses,
        escapesAsChor: isChor && !isCorrect ? p.stats.escapesAsChor + 1 : p.stats.escapesAsChor
      }
    };
  });

  return { updatedPlayers, isCorrect };
}

/**
 * Client-Safe View: Mask hidden roles so other players' roles are not leaked
 */
export function getMaskedGameState(state: GameRoomState, viewingPlayerId: string): GameRoomState {
  if (state.phase === 'result_reveal' || state.phase === 'game_over') {
    return state; // Reveal all
  }

  const maskedPlayers = state.players.map((p) => {
    // Current player always sees their own role
    if (p.id === viewingPlayerId) {
      return p;
    }
    // Raja is publicly announced to all players
    if (p.role === 'raja') {
      return p;
    }
    // All other players' roles are masked
    return {
      ...p,
      role: undefined
    };
  });

  return {
    ...state,
    players: maskedPlayers
  };
}

export function getBotChatMessage(player: Player): string {
  if (!player.role) return 'Namaste dosto! Khel shuru karte hain.';
  const list = BOT_BANTER_LINES[player.role];
  return list[Math.floor(Math.random() * list.length)];
}
