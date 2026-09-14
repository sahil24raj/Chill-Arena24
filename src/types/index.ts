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
    highScores: Record<string, number>;
    roastsWon: number;
    sixesHit: number;
    chaiServed: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'meme' | 'gaming' | 'social' | 'legend';
}

export interface GameItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: GameCategory;
  thumbnail: string;
  bannerImage: string;
  playCount: number;
  rating: number;
  isTrending?: boolean;
  isNew?: boolean;
  isIndianMeme?: boolean;
  isFeatured?: boolean;
  controls: string[];
  tags: string[];
}

export type GameCategory =
  | '😂 Meme Games'
  | '🏃 Endless Runner'
  | '🎮 Arcade'
  | '🧠 Puzzle'
  | '⚡ Reaction'
  | '🎯 Skill Games'
  | '🏆 Multiplayer'
  | '🔥 Trending'
  | '🇮🇳 Indian Meme Games';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  gameId: string;
  country: string;
  badge?: string;
}

export interface Comment {
  id: string;
  gameId: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  userReaction?: string;
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
