export type GameCategory =
  | '🔥 Trending Meme'
  | '🏫 School Vibes'
  | '🧠 Mind Games'
  | '⚡ Quick Duels'
  | '😂 Meme Games'
  | '🏃 Endless Runner'
  | '🎯 Skill Games'
  | '🏏 Sports';

export type CategoryKey = 'meme' | 'school' | 'mind' | 'duels' | 'all';

export interface GameItem {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: GameCategory;
  categoryKey: 'meme' | 'school' | 'mind';
  thumbnail: string;
  bannerImage: string;
  playCount: number;
  rating: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  multiplayer: boolean;
  multiplayerModes: ('local' | 'online' | 'ai')[];
  isTrending?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  controls: string[];
  tags: string[];
  rules?: string[];
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  authType: 'guest' | 'google' | 'discord';
  xp: number;
  level: number;
  coins: number;
  streak: number;
  lastLoginDate: string;
  badges: Badge[];
  unlockedSkins: string[];
  equippedSkin: string;
  stats: {
    gamesPlayed: number;
    totalWins: number;
    winRate: number;
    highScores: Record<string, number>;
    roastsWon: number;
    sixesHit: number;
    chaiServed: number;
    penFlipsLanded: number;
    eraserHits: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'meme' | 'gaming' | 'social' | 'legend' | 'school' | 'mind';
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  gameId?: string;
  gameTitle?: string;
  country: string;
  badge?: string;
  wins?: number;
  xp?: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardXP: number;
  rewardCoins: number;
  progress: number;
  target: number;
  category: 'meme' | 'school' | 'mind' | 'general';
  claimed: boolean;
}

export interface MultiplayerRoom {
  code: string;
  gameId: string;
  gameTitle: string;
  hostName: string;
  hostAvatar: string;
  guestName?: string;
  guestAvatar?: string;
  mode: 'local' | 'online' | 'ai';
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  createdAt: string;
}

export interface RecentMatch {
  id: string;
  gameId: string;
  gameTitle: string;
  gameIcon: string;
  player1: { name: string; avatar: string; score: number };
  player2: { name: string; avatar: string; score: number };
  winner: string;
  roastQuote: string;
  timeAgo: string;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'skin' | 'frame' | 'emote' | 'battlepass' | 'coins';
  price: number;
  currency: 'coins' | 'usd';
  image: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
}
