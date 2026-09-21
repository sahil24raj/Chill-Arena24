import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, GameItem, DailyChallenge, MultiplayerRoom, RecentMatch } from '@/types';
import { soundFx } from '@/lib/audio';
import {
  signInWithGoogle,
  signInWithGoogleRedirect,
  checkRedirectResult,
  signInAnonymouslyWithFirebase,
  generateDemoProfile,
  logoutFromFirebase,
  syncUserProfileToCloud,
  saveScoreToCloudLeaderboard,
  subscribeToAuth
} from '@/lib/firebaseService';

export type Game = GameItem;
export type { GameItem };

const INITIAL_USER: UserProfile = {
  id: 'usr_memelord',
  username: 'Sigma_Gamer69',
  avatar: '🚀',
  authType: 'guest',
  xp: 2840,
  level: 7,
  coins: 4850,
  streak: 5,
  lastLoginDate: new Date().toISOString(),
  badges: [
    { id: 'b1', name: 'Meme Pioneer', description: 'Joined MemeVerse on Launch Day', icon: '🔥', category: 'legend' },
    { id: 'b2', name: 'School Legend', description: 'Flipped 50 pens on the desk', icon: '🏫', category: 'school' },
    { id: 'b3', name: 'Big Brain', description: 'Solved 25 rapid mind puzzles', icon: '🧠', category: 'mind' },
    { id: 'b4', name: 'Tea Collector', description: 'Served 50+ cutting chais', icon: '☕', category: 'meme' },
    { id: 'b5', name: 'Speed Demon', description: 'Reaction time under 180ms', icon: '⚡', category: 'gaming' }
  ],
  unlockedSkins: ['default', 'gold_crown', 'neon_visor', 'desk_master'],
  equippedSkin: 'neon_visor',
  stats: {
    gamesPlayed: 68,
    totalWins: 49,
    winRate: 72,
    highScores: {
      'modi-run': 1850,
      'cid-escape': 1120,
      'chai-tapri': 2650,
      'emoji-dodge': 4100,
      'meme-clicker': 42000,
      'gully-cricket': 142,
      'pen-flip': 10,
      'eraser-throw': 18,
      'spin-cricket': 36,
      'word-builder': 24,
      'tic-tac-toe': 12,
      'brain-pot': 850
    },
    roastsWon: 24,
    sixesHit: 38,
    chaiServed: 120,
    penFlipsLanded: 44,
    eraserHits: 32
  }
};

export const INITIAL_CHALLENGES: DailyChallenge[] = [
  {
    id: 'ch-1',
    title: 'Win 3 Matches Today',
    description: 'Score victory in any 3 local or online mini-game matches',
    icon: '🎯',
    rewardXP: 300,
    rewardCoins: 250,
    progress: 2,
    target: 3,
    category: 'general',
    claimed: false
  },
  {
    id: 'ch-2',
    title: 'Pen Flip Desk Master',
    description: 'Land 5 successful TIP flips in School Vibes Pen Flip',
    icon: '🏫',
    rewardXP: 250,
    rewardCoins: 200,
    progress: 3,
    target: 5,
    category: 'school',
    claimed: false
  },
  {
    id: 'ch-3',
    title: 'Mind Pot Rapid Fire',
    description: 'Answer 6 consecutive brain challenges correctly in Brain Pot',
    icon: '🧠',
    rewardXP: 350,
    rewardCoins: 300,
    progress: 4,
    target: 6,
    category: 'mind',
    claimed: false
  },
  {
    id: 'ch-4',
    title: 'Play 5 Meme Games',
    description: 'Survive in Caught Modi, CID Escape, or Tapri Tycoon',
    icon: '🔥',
    rewardXP: 200,
    rewardCoins: 150,
    progress: 5,
    target: 5,
    category: 'meme',
    claimed: false
  }
];

export const INITIAL_RECENT_MATCHES: RecentMatch[] = [
  {
    id: 'm1',
    gameId: 'pen-flip',
    gameTitle: 'Pen Flip 1v1',
    gameIcon: '🖊️',
    player1: { name: 'Sigma_Gamer69', avatar: '🚀', score: 10 },
    player2: { name: 'ChaiBoss_Delhi', avatar: '☕', score: 7 },
    winner: 'Sigma_Gamer69',
    roastQuote: 'Bro got lucky on that final tip flip 💀',
    timeAgo: '1 min ago'
  },
  {
    id: 'm2',
    gameId: 'eraser-throw',
    gameTitle: 'Eraser Throw',
    gameIcon: '✏️',
    player1: { name: 'Backbencher_Raju', avatar: '😎', score: 14 },
    player2: { name: 'Monitor_Pooja', avatar: '📚', score: 9 },
    winner: 'Backbencher_Raju',
    roastQuote: 'ABSOLUTE CINEMA! Hit blackboard right before teacher entered!',
    timeAgo: '4 mins ago'
  },
  {
    id: 'm3',
    gameId: 'spin-cricket',
    gameTitle: 'Spin Cricket Duel',
    gameIcon: '🏏',
    player1: { name: 'GullyKing_Virat', avatar: '🏏', score: 28 },
    player2: { name: 'BoomBoom_Afridi', avatar: '⚡', score: 24 },
    winner: 'GullyKing_Virat',
    roastQuote: 'Last ball six into aunty ki balcony 😂',
    timeAgo: '8 mins ago'
  },
  {
    id: 'm4',
    gameId: 'tic-tac-toe',
    gameTitle: 'Tic-Tac-Toe Duel',
    gameIcon: '❌',
    player1: { name: 'AlphaCoder', avatar: '🤖', score: 2 },
    player2: { name: 'Dank_Lord', avatar: '🗿', score: 1 },
    winner: 'AlphaCoder',
    roastQuote: 'Classic corner fork move. Pure 200 IQ! 🧠',
    timeAgo: '12 mins ago'
  }
];

export const GAMES_CATALOG: GameItem[] = [
  // ================= 1. 🔥 TRENDING MEME GAMES =================
  {
    id: 'modi-run',
    title: 'Caught Modi: Chase & Escape',
    slug: 'caught-modi',
    tagline: 'Run to escape ACP Pradyuman while dodging microphones and flying tomatoes!',
    description: 'Help Narendra Modi dodge media mics, flying tomatoes, and drone cameras while escaping ACP Pradyuman in this epic endless runner chase game!',
    category: '🔥 Trending Meme',
    categoryKey: 'meme',
    thumbnail: '🏃‍♂️',
    bannerImage: '/games/modi-run.jpg',
    playCount: 245000,
    rating: 4.97,
    difficulty: 'Medium',
    duration: '1-3 min',
    multiplayer: true,
    multiplayerModes: ['local', 'ai'],
    isTrending: true,
    isPopular: true,
    isFeatured: true,
    controls: ['Space / Up Arrow / Tap: Jump over obstacles', 'Down Arrow: Slide under microphones'],
    tags: ['Runner', 'Indian Meme', 'Chase', 'Endless', 'Action'],
    rules: ['Survive as long as possible', 'Collect golden mic powerups for 2x multiplier', 'Avoid flying tomatoes']
  },
  {
    id: 'cid-escape',
    title: 'Daya Tod Do Darwaza: CID Escape',
    slug: 'cid-escape',
    tagline: 'Escape ACP Pradyuman while Daya keeps smashing doors down!',
    description: 'Fast-paced escape arcade! Dodge ACP Pradyuman’s magnifying laser eye, jump over Daya’s door smashes, and collect magnifying glass clues to survive!',
    category: '🔥 Trending Meme',
    categoryKey: 'meme',
    thumbnail: '🚪',
    bannerImage: '/games/cid-escape.jpg',
    playCount: 178000,
    rating: 4.85,
    difficulty: 'Hard',
    duration: '1-2 min',
    multiplayer: true,
    multiplayerModes: ['local', 'ai'],
    isTrending: true,
    controls: ['Up / Down Arrows: Dodge & Change Lanes', 'Space: Dash past broken doors'],
    tags: ['Escape', 'CID', 'Memes', 'Arcade'],
    rules: ['Switch lanes to avoid Daya door slams', 'Collect red clues for speed boost']
  },
  {
    id: 'chai-tapri',
    title: 'Chai Tapri Tycoon ☕',
    slug: 'chai-tapri-tycoon',
    tagline: 'Serve Cutting Chai, Samosas, and Bun Maska before customers lose patience!',
    description: 'Run your dream Indian street tea stall! Rapidly brew Cutting Chai, fry hot Samosas, and deal with funny office techies, police officers, and college groups.',
    category: '🔥 Trending Meme',
    categoryKey: 'meme',
    thumbnail: '☕',
    bannerImage: '/games/chai-tapri.jpg',
    playCount: 198000,
    rating: 4.92,
    difficulty: 'Medium',
    duration: '2-4 min',
    multiplayer: true,
    multiplayerModes: ['local', 'ai'],
    isTrending: true,
    isPopular: true,
    controls: ['Mouse / Touch: Click items to prepare & serve fast'],
    tags: ['Tycoon', 'Food', 'India', 'Management', 'Speed'],
    rules: ['Match customer orders quickly', 'Don’t let chai boil over', 'Combo tips give bonus coins']
  },
  {
    id: 'meme-clicker',
    title: 'Dank Meme Clicker 🚀',
    slug: 'dank-meme-clicker',
    tagline: 'Click to generate viral views, hire auto-clicker trolls, and conquer the internet!',
    description: 'Tap away to create viral content! Upgrade your click power from basic text posts to AI-generated brainrot memes and buy global viral server farms.',
    category: '🔥 Trending Meme',
    categoryKey: 'meme',
    thumbnail: '📈',
    bannerImage: '/games/meme-clicker.jpg',
    playCount: 215000,
    rating: 4.9,
    difficulty: 'Easy',
    duration: '30s - Endless',
    multiplayer: true,
    multiplayerModes: ['local', 'ai'],
    isTrending: true,
    isFeatured: true,
    controls: ['Click / Tap: Generate Viral Views & Buy Upgrades'],
    tags: ['Clicker', 'Idle', 'Viral', 'Casual'],
    rules: ['Tap quickly for combo surges', 'Unlock automated troll armies to earn while idle']
  },
  {
    id: 'gully-cricket',
    title: 'Cricket Gully Smash 🏏',
    slug: 'cricket-gully-smash',
    tagline: 'Hit massive sixes across narrow street alleys without breaking windows!',
    description: 'Classic Indian street cricket! Time your shots perfectly to smash balls over rooftops while avoiding aunty’s balcony glass!',
    category: '🔥 Trending Meme',
    categoryKey: 'meme',
    thumbnail: '🏏',
    bannerImage: '/games/gully-cricket.jpg',
    playCount: 164000,
    rating: 4.88,
    difficulty: 'Medium',
    duration: '1-3 min',
    multiplayer: true,
    multiplayerModes: ['local', 'online', 'ai'],
    isPopular: true,
    controls: ['Click / Space: Swing Bat at precise green timing window'],
    tags: ['Cricket', 'Sports', 'Street', 'Indian'],
    rules: ['Green bar = Sixer (+6)', 'Yellow = Four (+4)', 'Red = Out']
  },
  {
    id: 'emoji-dodge',
    title: 'Emoji Dodge: Gen-Z Survival',
    slug: 'emoji-dodge',
    tagline: 'Dodge toxic cringe emojis and catch viral dank memes!',
    description: 'Test your lighting reaction speed! Move your meme avatar to dodge cringe facepalms and toxic comments while collecting rare Pepe and Gigachad multipliers.',
    category: '🔥 Trending Meme',
    categoryKey: 'meme',
    thumbnail: '🗿',
    bannerImage: '/games/emoji-dodge.jpg',
    playCount: 142000,
    rating: 4.79,
    difficulty: 'Hard',
    duration: '30-90 sec',
    multiplayer: true,
    multiplayerModes: ['local', 'ai'],
    isNew: true,
    controls: ['Left / Right Arrows or Mouse: Move Left/Right'],
    tags: ['Reaction', 'Gen-Z', 'Fast', 'Survival'],
    rules: ['Dodge red skull/cringe emojis', 'Catch 🗿 and 🐸 for x3 points']
  },

  // ================= 2. 🏫 SCHOOL VIBES (NOSTALGIA) =================
  {
    id: 'pen-flip',
    title: 'Pen Flip Battle 🖊️',
    slug: 'pen-flip',
    tagline: 'Last bench classic! Flip your Reynolds pen and land on the tip for +1 point.',
    description: 'Relive the high-stakes classroom pen flipping duels! Charge your flip power, launch your virtual ballpen, and land on the TIP for points. First to 10 points takes the classroom crown!',
    category: '🏫 School Vibes',
    categoryKey: 'school',
    thumbnail: '🖊️',
    bannerImage: '/games/pen-flip.jpg',
    playCount: 189000,
    rating: 4.96,
    difficulty: 'Medium',
    duration: '1-2 min',
    multiplayer: true,
    multiplayerModes: ['local', 'online', 'ai'],
    isTrending: true,
    isNew: true,
    isPopular: true,
    controls: ['Click "FLIP PEN" or Press Spacebar', 'Release at optimal power angle'],
    tags: ['School', 'Physics', '1v1 Duel', 'Nostalgia', 'Turn-Based'],
    rules: [
      'TIP SIDE landing = +1 POINT 🎯',
      'BODY SIDE landing = 0 POINT (Flat)',
      'OFF DESK / FAIL = 0 POINT',
      'First player to reach 10 POINTS wins!'
    ]
  },
  {
    id: 'eraser-throw',
    title: 'Eraser & Sharpener Throw ✏️',
    slug: 'eraser-throw',
    tagline: 'Aim your non-dust eraser at the blackboard target before the teacher turns around!',
    description: 'Drag, aim and fling your eraser or sharpener across the classroom desk toward moving target chalkboards! Factor in ceiling fan wind drift and score bullseyes in 30 rapid seconds.',
    category: '🏫 School Vibes',
    categoryKey: 'school',
    thumbnail: '✏️',
    bannerImage: '/games/eraser-throw.jpg',
    playCount: 156000,
    rating: 4.91,
    difficulty: 'Medium',
    duration: '30-45 sec',
    multiplayer: true,
    multiplayerModes: ['local', 'online', 'ai'],
    isTrending: true,
    isNew: true,
    controls: ['Mouse Drag / Touch: Aim trajectory and set power', 'Release to Throw object'],
    tags: ['Aim', 'Throw', 'Classroom', 'Physics', 'Timer'],
    rules: [
      'Hit target blackboard = +1 POINT (Bullseye = +2)',
      'Combo streaks multiply score',
      'Watch out for ceiling fan wind variations!'
    ]
  },
  {
    id: 'spin-cricket',
    title: 'Spin Cricket (Book Cricket) 🏏',
    slug: 'spin-cricket',
    tagline: 'Spin the pencil spinner wheel or flip notebook pages for 4s, 6s and Wickets!',
    description: 'The iconic Indian school notebook book-cricket turned into a thrilling multiplayer spinner! Spin the roulette wheel and hit stop to reveal 1, 2, 3, 4, 6 or OUT. 2 overs, 1v1 highest runs wins!',
    category: '🏫 School Vibes',
    categoryKey: 'school',
    thumbnail: '📖',
    bannerImage: '/games/spin-cricket.jpg',
    playCount: 172000,
    rating: 4.94,
    difficulty: 'Easy',
    duration: '1-3 min',
    multiplayer: true,
    multiplayerModes: ['local', 'online', 'ai'],
    isTrending: true,
    isPopular: true,
    controls: ['Click "SPIN" to start rotating arrow', 'Click "STOP" to lock your shot'],
    tags: ['Cricket', 'Spinner', 'Turn-Based', 'Nostalgia', 'Multiplayer'],
    rules: [
      'Arrow lands on 1, 2, 3 = Single/Double/Triple Runs',
      'Lands on 4 = Boundary Four 🏏',
      'Lands on 6 = Maximum Sixer 🚀',
      'Lands on W = WICKET OUT! 🔴'
    ]
  },
  {
    id: 'paper-ball',
    title: 'Paper Ball Dustbin Throw 🗑️',
    slug: 'paper-ball-throw',
    tagline: 'Crumple rough notebook paper and bank shots into the corner classroom dustbin!',
    description: 'The art of classroom trick shots. Calculate bounce angles against classroom benches and sink paper balls into the dustbin with high combo multipliers.',
    category: '🏫 School Vibes',
    categoryKey: 'school',
    thumbnail: '🗑️',
    bannerImage: '/games/paper-ball.jpg',
    playCount: 118000,
    rating: 4.75,
    difficulty: 'Easy',
    duration: '1 min',
    multiplayer: true,
    multiplayerModes: ['local', 'ai'],
    isNew: true,
    controls: ['Click and drag paper ball back to aim arc'],
    tags: ['Basketball', 'Paper', 'Trickshot', 'School'],
    rules: ['Sink balls into dustbin before timer runs out', 'Bank shots off desks give +2 bonus']
  },

  // ================= 3. 🧠 MIND GAMES (ESPORTS BRAIN ARENA) =================
  {
    id: 'word-builder',
    title: 'Word Builder Scramble 🔠',
    slug: 'word-builder',
    tagline: 'Form valid words from scrambled letter tiles in a 30-second live duel!',
    description: 'Rapid-fire vocabulary esports! Receive 5-7 scrambled letters (e.g. C-A-T-R-E) and craft as many valid English words as possible before the timer expires.',
    category: '🧠 Mind Games',
    categoryKey: 'mind',
    thumbnail: '🔤',
    bannerImage: '/games/word-builder.jpg',
    playCount: 149000,
    rating: 4.89,
    difficulty: 'Medium',
    duration: '30-45 sec',
    multiplayer: true,
    multiplayerModes: ['local', 'online', 'ai'],
    isTrending: true,
    isNew: true,
    controls: ['Click letter tiles or Type on keyboard', 'Press Enter / Submit button'],
    tags: ['Words', 'Brain', 'Duel', 'Puzzle', 'Fast'],
    rules: [
      '3-letter word: +1 point',
      '4-letter word: +2 points',
      '5+ letter word: +4 points',
      'Combo streaks multiply bonus score!'
    ]
  },
  {
    id: 'tic-tac-toe',
    title: 'Neon & Notebook Tic-Tac-Toe ❌⭕',
    slug: 'tic-tac-toe',
    tagline: 'Best-of-3 strategic grid duels with neon animations and classroom doodle themes!',
    description: 'The eternal grid duel reimagined with smooth particle effects and dynamic sound fx. Play local Pass & Play with a friend, challenge room codes, or take on the Smart AI bot in Best-of-3 sets!',
    category: '🧠 Mind Games',
    categoryKey: 'mind',
    thumbnail: '❌',
    bannerImage: '/games/tic-tac-toe.jpg',
    playCount: 204000,
    rating: 4.93,
    difficulty: 'Easy',
    duration: '1-2 min',
    multiplayer: true,
    multiplayerModes: ['local', 'online', 'ai'],
    isTrending: true,
    isPopular: true,
    controls: ['Click on any empty 3x3 cell to place your symbol'],
    tags: ['Strategy', '1v1', 'Classic', 'Multiplayer', 'Quick'],
    rules: [
      'Align 3 in a row horizontally, vertically, or diagonally',
      'First to win 2 sets claims the champion badge'
    ]
  },
  {
    id: 'brain-pot',
    title: 'Brain Pot: Rapid IQ Arena 🧠',
    slug: 'brain-pot',
    tagline: 'Rapid 5-10 second micro challenges: sequences, odd emojis, shell games & patterns!',
    description: 'High-speed cognitive reflex testing! Solve lightning micro-puzzles: "Which shape comes next?", "Spot the odd meme emoji", "Which cup hides the coin?", and "Missing numbers". Fast answers yield massive speed multipliers!',
    category: '🧠 Mind Games',
    categoryKey: 'mind',
    thumbnail: '🧠',
    bannerImage: '/games/brain-pot.jpg',
    playCount: 168000,
    rating: 4.95,
    difficulty: 'Medium',
    duration: '1-2 min',
    multiplayer: true,
    multiplayerModes: ['local', 'online', 'ai'],
    isTrending: true,
    isNew: true,
    controls: ['Click the correct answer option before the countdown bar empties'],
    tags: ['IQ', 'Micro-games', 'Speed', 'Puzzles', 'Brain'],
    rules: [
      'Each question gives 5-8 seconds',
      'Correct answer = Base Points + Speed Bonus',
      'Wrong answer breaks combo streak!'
    ]
  },
  {
    id: 'memory-match',
    title: 'Cyber Memory Matrix 🃏',
    slug: 'memory-match',
    tagline: 'Flip neon tiles and pair up matching Indian meme icons in record time!',
    description: 'Test your photographic recall by flipping holographic cards to reveal matching pairs of Gigachad, Pepe, Cutting Chai, and Reynolds Pens.',
    category: '🧠 Mind Games',
    categoryKey: 'mind',
    thumbnail: '🃏',
    bannerImage: '/games/memory-match.jpg',
    playCount: 129000,
    rating: 4.82,
    difficulty: 'Medium',
    duration: '1-2 min',
    multiplayer: true,
    multiplayerModes: ['local', 'ai'],
    isNew: true,
    controls: ['Click cards to flip and match pairs'],
    tags: ['Memory', 'Cards', 'Focus', 'Puzzle'],
    rules: ['Match all 8 pairs in lowest moves and time']
  }
];

interface AppState {
  user: UserProfile;
  isMuted: boolean;
  activeAuthModal: boolean;
  activeSpinModal: boolean;
  activeMultiplayerModal: boolean;
  selectedMultiplayerGame: GameItem | null;
  recentlyPlayedIds: string[];
  challenges: DailyChallenge[];
  activeRoom: MultiplayerRoom | null;
  recentMatches: RecentMatch[];
  
  // Actions
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openSpinModal: () => void;
  closeSpinModal: () => void;
  openMultiplayerModal: (game?: GameItem) => void;
  closeMultiplayerModal: () => void;
  setUser: (user: Partial<UserProfile>) => void;
  loginWithGoogle: (customDetails?: Partial<UserProfile>) => Promise<{ success: boolean; error?: string; code?: string; isFallback?: boolean }>;
  loginWithGoogleRedirect: () => Promise<void>;
  loginAnonymously: (customDetails?: Partial<UserProfile>) => Promise<{ success: boolean; error?: string; code?: string; isFallback?: boolean }>;
  loginWithDemo: (customDetails?: Partial<UserProfile>, authType?: 'google' | 'guest') => void;
  initAuthListener: () => () => void;
  logout: () => Promise<void>;
  syncCloudData: () => Promise<boolean>;
  addCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  updateHighScore: (gameId: string, score: number) => void;
  recordGameWin: (gameId: string) => void;
  addRecentlyPlayed: (gameId: string) => void;
  claimChallenge: (challengeId: string) => void;
  updateChallengeProgress: (category: 'meme' | 'school' | 'mind' | 'general', amount: number) => void;
  createRoom: (gameId: string, mode?: 'local' | 'online' | 'ai') => MultiplayerRoom;
  joinRoom: (code: string) => boolean;
  leaveRoom: () => void;
  spinDailyReward: () => { coins: number; xp: number; rewardName: string };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: INITIAL_USER,
      isMuted: false,
      activeAuthModal: false,
      activeSpinModal: false,
      activeMultiplayerModal: false,
      selectedMultiplayerGame: null,
      recentlyPlayedIds: ['pen-flip', 'modi-run', 'eraser-throw', 'word-builder'],
      challenges: INITIAL_CHALLENGES,
      activeRoom: null,
      recentMatches: INITIAL_RECENT_MATCHES,

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
      openMultiplayerModal: (game) => set({ activeMultiplayerModal: true, selectedMultiplayerGame: game || GAMES_CATALOG[6] }),
      closeMultiplayerModal: () => set({ activeMultiplayerModal: false, selectedMultiplayerGame: null }),

      setUser: (userUpdate) => {
        const updated = { ...get().user, ...userUpdate };
        set({ user: updated });
        if (updated.isCloudSynced && updated.uid) {
          syncUserProfileToCloud(updated);
        }
      },

      loginWithGoogle: async (customDetails) => {
        const res = await signInWithGoogle({ ...get().user, ...customDetails });
        if (res.success && res.user) {
          set({ user: res.user, activeAuthModal: false });
          soundFx.playLevelUp();
          return { success: true, isFallback: res.isFallback };
        }
        return { success: false, error: res.error || 'Failed to sign in with Google', code: res.code };
      },

      loginWithGoogleRedirect: async () => {
        await signInWithGoogleRedirect();
      },

      loginAnonymously: async (customDetails) => {
        const res = await signInAnonymouslyWithFirebase({ ...get().user, ...customDetails });
        if (res.success && res.user) {
          set({ user: res.user, activeAuthModal: false });
          soundFx.playLevelUp();
          return { success: true, isFallback: res.isFallback };
        }
        return { success: false, error: res.error || 'Failed to connect anonymously', code: res.code };
      },

      loginWithDemo: (customDetails, authType = 'google') => {
        const demoUser = generateDemoProfile({ ...get().user, ...customDetails }, authType);
        set({ user: demoUser, activeAuthModal: false });
        soundFx.playLevelUp();
      },

      initAuthListener: () => {
        // Check for redirect login result on mount
        checkRedirectResult().then((redirectUser) => {
          if (redirectUser) {
            set({ user: redirectUser, activeAuthModal: false });
            soundFx.playLevelUp();
          }
        });

        const unsubscribe = subscribeToAuth((fbUser) => {
          if (fbUser) {
            const currentUser = get().user;
            if (currentUser.uid !== fbUser.uid) {
              set({
                user: {
                  ...currentUser,
                  id: fbUser.uid,
                  uid: fbUser.uid,
                  email: fbUser.email || currentUser.email,
                  photoURL: fbUser.photoURL || currentUser.photoURL,
                  username: currentUser.username.startsWith('Guest_') && fbUser.displayName ? fbUser.displayName : currentUser.username,
                  isCloudSynced: true
                }
              });
            }
          }
        });
        return unsubscribe;
      },


      logout: async () => {
        await logoutFromFirebase();
        set({
          user: {
            ...INITIAL_USER,
            id: `guest_${Date.now().toString().slice(-4)}`,
            username: `Guest_${Math.floor(1000 + Math.random() * 9000)}`,
            authType: 'guest',
            isCloudSynced: false,
            uid: undefined,
            email: undefined,
            photoURL: undefined
          }
        });
        soundFx.playClick();
      },

      syncCloudData: async () => {
        const currentUser = get().user;
        if (!currentUser.uid && currentUser.authType !== 'google') {
          return false;
        }
        const synced = await syncUserProfileToCloud(currentUser);
        if (synced) {
          set((state) => ({ user: { ...state.user, isCloudSynced: true } }));
        }
        return synced;
      },

      addCoins: (amount) => {
        soundFx.playCoin();
        const updatedUser = { ...get().user, coins: get().user.coins + amount };
        set({ user: updatedUser });
        if (updatedUser.isCloudSynced && updatedUser.uid) {
          syncUserProfileToCloud(updatedUser);
        }
      },

      addXP: (amount) => {
        const current = get().user;
        const newXp = current.xp + amount;
        const newLevel = Math.floor(newXp / 500) + 1;
        if (newLevel > current.level) {
          soundFx.playLevelUp();
        }
        const updatedUser = { ...current, xp: newXp, level: newLevel };
        set({ user: updatedUser });
        if (updatedUser.isCloudSynced && updatedUser.uid) {
          syncUserProfileToCloud(updatedUser);
        }
      },

      updateHighScore: (gameId, score) => {
        const currentStats = get().user.stats;
        const prevHigh = currentStats.highScores[gameId] || 0;
        if (score > prevHigh) {
          soundFx.playLevelUp();
          const updatedUser: UserProfile = {
            ...get().user,
            stats: {
              ...get().user.stats,
              highScores: {
                ...get().user.stats.highScores,
                [gameId]: score
              }
            }
          };
          set({ user: updatedUser });
          
          const game = GAMES_CATALOG.find((g) => g.id === gameId);
          saveScoreToCloudLeaderboard(gameId, game?.title || gameId, score, updatedUser);
          if (updatedUser.isCloudSynced && updatedUser.uid) {
            syncUserProfileToCloud(updatedUser);
          }
        }
      },

      recordGameWin: (gameId) => {
        const state = get();
        const gamesPlayed = state.user.stats.gamesPlayed + 1;
        const totalWins = state.user.stats.totalWins + 1;
        const winRate = Math.round((totalWins / gamesPlayed) * 100);

        const updatedUser: UserProfile = {
          ...state.user,
          stats: {
            ...state.user.stats,
            gamesPlayed,
            totalWins,
            winRate
          }
        };

        set({ user: updatedUser });
        if (updatedUser.isCloudSynced && updatedUser.uid) {
          syncUserProfileToCloud(updatedUser);
        }

        // Trigger challenge progress
        get().updateChallengeProgress('general', 1);
        const game = GAMES_CATALOG.find((g) => g.id === gameId);
        if (game?.categoryKey) {
          get().updateChallengeProgress(game.categoryKey, 1);
        }
      },

      addRecentlyPlayed: (gameId) => {
        set((state) => ({
          recentlyPlayedIds: [gameId, ...state.recentlyPlayedIds.filter((id) => id !== gameId)].slice(0, 6)
        }));
      },

      claimChallenge: (challengeId) => {
        const target = get().challenges.find((c) => c.id === challengeId);
        if (target && !target.claimed && target.progress >= target.target) {
          get().addCoins(target.rewardCoins);
          get().addXP(target.rewardXP);
          soundFx.playLevelUp();

          set((state) => ({
            challenges: state.challenges.map((c) =>
              c.id === challengeId ? { ...c, claimed: true } : c
            )
          }));
        }
      },

      updateChallengeProgress: (category, amount) => {
        set((state) => ({
          challenges: state.challenges.map((c) => {
            if (c.claimed) return c;
            if (c.category === category || (c.category === 'general' && category === 'general')) {
              const nextProgress = Math.min(c.target, c.progress + amount);
              return { ...c, progress: nextProgress };
            }
            return c;
          })
        }));
      },

      createRoom: (gameId, mode = 'local') => {
        const game = GAMES_CATALOG.find((g) => g.id === gameId) || GAMES_CATALOG[6];
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '#';
        for (let i = 0; i < 5; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const room: MultiplayerRoom = {
          code,
          gameId: game.id,
          gameTitle: game.title,
          hostName: get().user.username,
          hostAvatar: get().user.avatar,
          guestName: mode === 'ai' ? '🤖 Bot_Chad' : mode === 'local' ? '🎮 Player 2 (Local)' : 'Waiting for Player...',
          guestAvatar: mode === 'ai' ? '🤖' : mode === 'local' ? '🕹️' : '⚪',
          mode,
          status: mode === 'online' ? 'waiting' : 'ready',
          createdAt: new Date().toISOString()
        };

        set({ activeRoom: room });
        return room;
      },

      joinRoom: (code) => {
        const normalized = code.toUpperCase().trim();
        const room: MultiplayerRoom = {
          code: normalized.startsWith('#') ? normalized : `#${normalized}`,
          gameId: 'pen-flip',
          gameTitle: 'Pen Flip Battle 🖊️',
          hostName: 'Alpha_Player1',
          hostAvatar: '👑',
          guestName: get().user.username,
          guestAvatar: get().user.avatar,
          mode: 'online',
          status: 'ready',
          createdAt: new Date().toISOString()
        };
        set({ activeRoom: room });
        return true;
      },

      leaveRoom: () => set({ activeRoom: null }),

      spinDailyReward: () => {
        const rewards = [
          { coins: 150, xp: 75, rewardName: '150 Meme Coins + 75 XP' },
          { coins: 350, xp: 150, rewardName: '350 Meme Coins + 150 XP' },
          { coins: 750, xp: 300, rewardName: '750 Jackpot Coins 🪙' },
          { coins: 100, xp: 250, rewardName: '250 XP Boost 🚀' },
          { coins: 1500, xp: 700, rewardName: '👑 Gigachad Classroom Legend Pack' }
        ];
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        get().addCoins(randomReward.coins);
        get().addXP(randomReward.xp);
        return randomReward;
      }
    }),
    {
      name: 'memeverse-v2-storage'
    }
  )
);
