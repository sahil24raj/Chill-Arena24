import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, GameItem } from '@/types';
import { soundFx } from '@/lib/audio';

const INITIAL_USER: UserProfile = {
  id: 'usr_memelord',
  username: 'Sigma_Gamer69',
  avatar: '🚀',
  authType: 'guest',
  xp: 1450,
  level: 5,
  coins: 2450,
  streak: 3,
  lastLoginDate: new Date().toISOString(),
  badges: [
    { id: 'b1', name: 'Meme Pioneer', description: 'Joined MemeVerse on Launch Day', icon: '🔥', category: 'legend' },
    { id: 'b2', name: 'Tea Collector', description: 'Served 50+ cutting chais', icon: '☕', category: 'meme' },
    { id: 'b3', name: 'Daya Destroyer', description: 'Broke 10 doors in CID Escape', icon: '🚪', category: 'gaming' }
  ],
  unlockedSkins: ['default', 'gold_crown', 'neon_visor'],
  equippedSkin: 'neon_visor',
  stats: {
    gamesPlayed: 42,
    totalWins: 29,
    highScores: {
      'modi-run': 1420,
      'cid-escape': 890,
      'chai-tapri': 2100,
      'emoji-dodge': 3400,
      'meme-clicker': 15000,
      'gully-cricket': 96
    },
    roastsWon: 12,
    sixesHit: 18,
    chaiServed: 64
  }
};

export const GAMES_CATALOG: GameItem[] = [
  {
    id: 'modi-run',
    title: 'Caught Modi: Chase & Escape',
    tagline: 'Run to escape ACP Pradyuman while dodging microphones and flying tomatoes!',
    description: 'Help Narendra Modi dodge media mics and flying tomatoes while escaping ACP Pradyuman in this epic endless runner chase game!',
    category: '🇮🇳 Indian Meme Games',
    thumbnail: '🏃‍♂️👮‍♂️',
    bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    playCount: 184500,
    rating: 4.97,
    isTrending: true,
    isIndianMeme: true,
    isFeatured: true,
    controls: ['Space / Up Arrow / Click: Jump', 'Mobile Tap: Jump'],
    tags: ['Runner', 'Indian', 'Political Meme', 'Action', 'Chase']
  },
  {
    id: 'cid-escape',
    title: 'CID Escape: Daya Tod Do Darwaza',
    tagline: 'Escape ACP Pradyuman while Daya keeps smashing doors down!',
    description: 'Fast-paced escape arcade! Dodge ACP Pradyuman’s magnifying laser eye, jump over Daya’s door smashes, and collect magnifying glass clues to survive!',
    category: '🇮🇳 Indian Meme Games',
    thumbnail: '🚪',
    bannerImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    playCount: 98400,
    rating: 4.8,
    isTrending: true,
    isIndianMeme: true,
    controls: ['Up / Down Arrows: Dodge & Change Lanes', 'Space: Dash'],
    tags: ['Escape', 'CID', 'Memes', 'Arcade']
  },
  {
    id: 'chai-tapri',
    title: 'Chai Tapri Tycoon ☕',
    tagline: 'Serve Cutting Chai, Samosas, and Bun Maska before customers lose patience!',
    description: 'Run your dream Indian street tea stall! Rapidly brew Cutting Chai, fry hot Samosas, and deal with funny office techies, police officers, and college groups.',
    category: '🧠 Puzzle',
    thumbnail: '☕',
    bannerImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    playCount: 112000,
    rating: 4.9,
    isIndianMeme: true,
    isTrending: true,
    controls: ['Mouse / Touch: Click items to prepare & serve'],
    tags: ['Tycoon', 'Food', 'India', 'Management']
  },
  {
    id: 'emoji-dodge',
    title: 'Emoji Dodge: Gen-Z Survival',
    tagline: 'Dodge toxic cringe emojis and catch viral dank memes!',
    description: 'Test your lighting reaction speed! Move your meme avatar to dodge cringe facepalms and toxic comments while collecting rare Pepe and Gigachad multipliers.',
    category: '⚡ Reaction',
    thumbnail: '🗿',
    bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    playCount: 87500,
    rating: 4.7,
    isNew: true,
    controls: ['Left / Right Arrows or Mouse: Move Left/Right'],
    tags: ['Reaction', 'Gen-Z', 'Fast', 'Survival']
  },
  {
    id: 'meme-clicker',
    title: 'Dank Meme Clicker 🚀',
    tagline: 'Click to generate viral views, hire auto-clicker trolls, and conquer the internet!',
    description: 'Tap away to create viral content! Upgrade your click power from basic text posts to AI-generated brainrot memes and buy global viral server farms.',
    category: '😂 Meme Games',
    thumbnail: '📈',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    playCount: 154000,
    rating: 4.9,
    isTrending: true,
    isFeatured: true,
    controls: ['Click / Tap: Generate Viral Views & Buying Upgrades'],
    tags: ['Clicker', 'Idle', 'Viral', 'Casual']
  },
  {
    id: 'gully-cricket',
    title: 'Cricket Gully Smash 🏏',
    tagline: 'Hit massive sixes across narrow street alleys without breaking windows!',
    description: 'Classic Indian street cricket! Time your shots perfectly to smash balls over rooftops while avoiding aunty’s balcony glass!',
    category: '🎯 Skill Games',
    thumbnail: '🏏',
    bannerImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    playCount: 131200,
    rating: 4.8,
    isIndianMeme: true,
    controls: ['Click / Space: Swing Bat at precise timing'],
    tags: ['Cricket', 'Sports', 'Street', 'Indian']
  }
];

interface AppState {
  user: UserProfile;
  isMuted: boolean;
  activeAuthModal: boolean;
  activeSpinModal: boolean;
  recentlyPlayedIds: string[];
  
  // Actions
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openSpinModal: () => void;
  closeSpinModal: () => void;
  setUser: (user: Partial<UserProfile>) => void;
  addCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  updateHighScore: (gameId: string, score: number) => void;
  addRecentlyPlayed: (gameId: string) => void;
  spinDailyReward: () => { coins: number; xp: number; rewardName: string };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: INITIAL_USER,
      isMuted: false,
      activeAuthModal: false,
      activeSpinModal: false,
      recentlyPlayedIds: ['modi-run', 'chai-tapri'],

      setMuted: (muted) => {
        soundFx.isMuted = muted;
        set({ isMuted: muted });
      },
      toggleMute: () => {
        const nextState = !get().isMuted;
        soundFx.isMuted = nextState;
        set({ isMuted: nextState });
      },
      openAuthModal: () => set({ activeAuthModal: true }),
      closeAuthModal: () => set({ activeAuthModal: false }),
      openSpinModal: () => set({ activeSpinModal: true }),
      closeSpinModal: () => set({ activeSpinModal: false }),

      setUser: (userUpdate) =>
        set((state) => ({
          user: { ...state.user, ...userUpdate }
        })),

      addCoins: (amount) => {
        soundFx.playCoin();
        set((state) => ({
          user: { ...state.user, coins: state.user.coins + amount }
        }));
      },

      addXP: (amount) => {
        const current = get().user;
        const newXp = current.xp + amount;
        const newLevel = Math.floor(newXp / 500) + 1;
        if (newLevel > current.level) {
          soundFx.playLevelUp();
        }
        set((state) => ({
          user: { ...state.user, xp: newXp, level: newLevel }
        }));
      },

      updateHighScore: (gameId, score) => {
        const currentStats = get().user.stats;
        const prevHigh = currentStats.highScores[gameId] || 0;
        if (score > prevHigh) {
          soundFx.playLevelUp();
          set((state) => ({
            user: {
              ...state.user,
              stats: {
                ...state.user.stats,
                highScores: {
                  ...state.user.stats.highScores,
                  [gameId]: score
                }
              }
            }
          }));
        }
      },

      addRecentlyPlayed: (gameId) => {
        set((state) => ({
          recentlyPlayedIds: [gameId, ...state.recentlyPlayedIds.filter((id) => id !== gameId)].slice(0, 5)
        }));
      },

      spinDailyReward: () => {
        const rewards = [
          { coins: 100, xp: 50, rewardName: '100 Meme Coins' },
          { coins: 250, xp: 100, rewardName: '250 Meme Coins + 100 XP' },
          { coins: 500, xp: 200, rewardName: '500 Jackpot Coins' },
          { coins: 50, xp: 150, rewardName: '150 XP Boost' },
          { coins: 1000, xp: 500, rewardName: '👑 Gigachad Crown Pack' }
        ];
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        get().addCoins(randomReward.coins);
        get().addXP(randomReward.xp);
        return randomReward;
      }
    }),
    {
      name: 'memeverse-storage-v1'
    }
  )
);
