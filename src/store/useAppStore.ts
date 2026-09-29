import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, GameItem, DailyChallenge, MultiplayerRoom, RecentMatch } from '@/types';
import { soundFx } from '@/lib/audio';
import {
  signInWithGoogle,
  signInWithGoogleRedirect,
  checkRedirectResult,
  signInAnonymouslyWithFirebase,
  signUpWithEmail,
  signInWithEmail,
  sendPasswordReset,
  updateUserProfileData,
  submitGameScoreSecure,
  logoutFromFirebase,
  syncUserProfileToCloud,
  saveScoreToCloudLeaderboard,
  subscribeToAuth
} from '@/lib/firebaseService';

export type Game = GameItem;
export type { GameItem };

export const getOrCreateDeviceId = (): string => {
  if (typeof window === 'undefined') return 'usr_guest_srv';
  try {
    let id = localStorage.getItem('chill_arena_device_user_id');
    if (!id || id === 'usr_guest') {
      id = `usr_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36)}`;
      localStorage.setItem('chill_arena_device_user_id', id);
    }
    return id;
  } catch {
    return `usr_${Math.random().toString(36).substring(2, 8)}`;
  }
};

const INITIAL_USER: UserProfile = {
  id: typeof window !== 'undefined' ? getOrCreateDeviceId() : 'usr_guest',
  username: typeof window !== 'undefined' ? `Gamer_${getOrCreateDeviceId().slice(-4).toUpperCase()}` : 'Gamer',
  avatar: '🚀',
  authType: 'guest',
  xp: 0,
  level: 1,
  coins: 0,
  streak: 0,
  lastLoginDate: new Date().toISOString(),
  badges: [],
  unlockedSkins: ['default'],
  equippedSkin: 'default',
  stats: {
    gamesPlayed: 0,
    totalWins: 0,
    totalLosses: 0,
    winRate: 0,
    totalScore: 0,
    bestScore: 0,
    highScores: {},
    roastsWon: 0,
    sixesHit: 0,
    chaiServed: 0,
    penFlipsLanded: 0,
    eraserHits: 0
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
    progress: 0,
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
    progress: 0,
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
    progress: 0,
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
    progress: 0,
    target: 5,
    category: 'meme',
    claimed: false
  }
];

export const INITIAL_RECENT_MATCHES: RecentMatch[] = [];

export const GAMES_CATALOG: GameItem[] = [
  {
    id: 'word-builder',
    title: 'Word Builder Pro 🔠',
    slug: 'word-builder',
    tagline: 'Unscramble letters, find target words, and unlock complete anagram solutions!',
    description: 'Professional vocabulary puzzle game! Form valid English words from scrambled letter tiles, discover target words across crossword slots, and view complete solutions with definitions.',
    category: '🧠 Mind Games',
    categoryKey: 'mind',
    thumbnail: '🔤',
    bannerImage: '/games/word-builder.jpg',
    playCount: 189000,
    rating: 4.96,
    difficulty: 'Medium',
    duration: '1-2 min',
    multiplayer: true,
    multiplayerModes: ['local', 'online', 'ai'],
    isTrending: true,
    isNew: true,
    isPopular: true,
    isFeatured: true,
    controls: ['Click letter tiles or Type on keyboard', 'Press Enter to Submit', 'Spacebar to Shuffle'],
    tags: ['Words', 'Brain', 'Vocabulary', 'Puzzle', 'Anagrams'],
    rules: [
      '3-letter word: +150 points',
      '4-letter word: +200 points',
      '5+ letter word: +300 points',
      'Target word completion unlocks Level Clear bonus!',
      'Reveal Solutions panel anytime to view full anagram dictionary.'
    ]
  },
  {
    id: 'tic-tac-toe',
    title: 'Neon & Notebook Tic-Tac-Toe ❌⭕',
    slug: 'tic-tac-toe',
    tagline: 'Best-of-3 strategic grid duels with neon animations and smart AI bot!',
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
    isFeatured: true,
    controls: ['Click on any empty 3x3 cell to place your symbol'],
    tags: ['Strategy', '1v1', 'Classic', 'Multiplayer', 'Quick'],
    rules: [
      'Align 3 in a row horizontally, vertically, or diagonally',
      'First to win 2 sets claims the champion badge'
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
    isFeatured: true,
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
    isFeatured: true,
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
    isFeatured: true,
    controls: ['Click the correct answer option before the countdown bar empties'],
    tags: ['IQ', 'Micro-games', 'Speed', 'Puzzles', 'Brain'],
    rules: [
      'Each question gives 5-8 seconds',
      'Correct answer = Base Points + Speed Bonus',
      'Wrong answer breaks combo streak!'
    ]
  },
  {
    id: 'chor-sipahi',
    title: 'Chor Sipahi (Raja Mantri) 👑🥷',
    slug: 'chor-sipahi',
    tagline: '4-Player Indian Party Game! Raja orders, Mantri hides, Sipahi investigates, Chor bluffs!',
    description: 'The iconic 4-player childhood parlor game of chits, deduction and psychological bluffs! Roles: Raja (1000 pts), Mantri (800 pts), Sipahi (500 pts), and Chor (0 pts). The Sipahi must interrogate the suspects and catch the hidden Chor!',
    category: '🏫 School Vibes',
    categoryKey: 'school',
    thumbnail: '🥷',
    bannerImage: '/games/chor-sipahi.jpg',
    playCount: 245000,
    rating: 4.98,
    difficulty: 'Easy',
    duration: '2-4 min',
    multiplayer: true,
    multiplayerModes: ['local', 'online', 'ai'],
    isTrending: true,
    isNew: true,
    isPopular: true,
    isFeatured: true,
    controls: ['Click to Reveal Role', 'Real-Time Chat & Roasts', 'Select Suspect Card & Confirm Arrest'],
    tags: ['4-Player', 'Social Deduction', 'School Vibes', 'Party Game', 'Raja Mantri'],
    rules: [
      '👑 Raja (1000 pts): Publicly known king who commands the court.',
      '🧠 Mantri (800 pts): Secret minister who must act natural to avoid wrongful arrest.',
      '👮 Sipahi (500 pts): The royal cop whose mission is to find and arrest the Chor.',
      '🥷 Chor (0 pts): Master thief trying to deceive the Sipahi and escape!',
      'Sipahi inspects the 3 suspect players and submits a final guess.',
      'All 4 chits are revealed at the end of the round with cumulative leaderboard scores.'
    ]
  },
  {
    id: 'eraser-throw',
    title: 'Last Bench Eraser Throw 🎯',
    slug: 'eraser-throw',
    tagline: 'Aim your Apsara eraser, account for wind & hit the dustbin without getting caught by teacher!',
    description: 'Relive classic classroom mischief! Drag and aim your eraser with trajectory physics, compensate for varying wind speeds, and throw when the teacher is writing on the blackboard. Score direct bullseyes for combo streaks!',
    category: '🏫 School Vibes',
    categoryKey: 'school',
    thumbnail: '🎯',
    bannerImage: '/games/eraser-throw.jpg',
    playCount: 164000,
    rating: 4.92,
    difficulty: 'Medium',
    duration: '1-2 min',
    multiplayer: true,
    multiplayerModes: ['local', 'online', 'ai'],
    isTrending: true,
    isPopular: true,
    isFeatured: true,
    controls: ['Click & Drag eraser to set power and trajectory angle', 'Release when Teacher is looking away', 'Spacebar to Quick Throw'],
    tags: ['Physics', 'Target', 'Classroom', 'Nostalgia', 'School'],
    rules: [
      'Pull back on eraser to charge power arc',
      'Account for real-time wind speed meters',
      'DO NOT throw when Teacher is watching (Red Eye Alert)',
      'Direct hit in target bin: +50 to +100 points + Combo multiplier!'
    ]
  },
  {
    id: 'modi-run',
    title: 'Mitron Rush / Modi Run 🏃💨',
    slug: 'modi-run',
    tagline: 'Endless runner with speech mics, podiums, chai boosts & iconic desi soundbites!',
    description: 'Fast-paced side-scrolling endless runner! Jump over mics, press podiums, avoid flying tomatoes, collect golden chai coins, and build immense speed combos across Indian cityscapes with dynamic sound effects.',
    category: '☕ Desi Meme Vibes',
    categoryKey: 'meme',
    thumbnail: '🏃',
    bannerImage: '/games/modi-run.jpg',
    playCount: 220000,
    rating: 4.95,
    difficulty: 'Medium',
    duration: '1-3 min',
    multiplayer: false,
    isTrending: true,
    isPopular: true,
    isFeatured: true,
    controls: ['Press Spacebar, Up Arrow, or Tap Screen to Jump', 'Double Jump for high obstacle clearance'],
    tags: ['Runner', 'Endless', 'Meme', 'Reflex', 'Desi'],
    rules: [
      'Jump over podiums and sound mics',
      'Collect golden coins to fill Combo Meter',
      'Speed increases every 100 meters',
      'Survive as long as possible to top the global leaderboard!'
    ]
  },
  {
    id: 'cid-escape',
    title: 'CID Daya Door Smash 🚪💥',
    slug: 'cid-escape',
    tagline: '"Daya, Darwaza Tod Do!" Switch lanes, kick open heavy metal doors & capture suspects!',
    description: 'High-octane action runner inspired by legendary Indian detective drama! Switch across 3 tactical lanes, trigger Daya smash power kicks to bust through locked doors, dodge ACP whistles, and crack the crime syndicate case.',
    category: '☕ Desi Meme Vibes',
    categoryKey: 'meme',
    thumbnail: '🚪',
    bannerImage: '/games/cid-escape.jpg',
    playCount: 198000,
    rating: 4.94,
    difficulty: 'Medium',
    duration: '1-2 min',
    multiplayer: false,
    isTrending: true,
    isPopular: true,
    isFeatured: true,
    controls: ['Up / Down Arrows or W/S to Switch Lanes', 'Spacebar or Smash Button to Kick Doors'],
    tags: ['Action', 'CID', 'Desi Meme', 'Lanes', 'Reflex'],
    rules: [
      'Shift lanes to line up with targets and avoid obstacles',
      'Hit SMASH when approaching locked doors for extra points',
      'Collect evidence files to fill Daya rage meter',
      'Clear maximum distance to solve the case!'
    ]
  },
  {
    id: 'chai-tapri',
    title: 'Chai Tapri Tycoon ☕',
    slug: 'chai-tapri',
    tagline: 'Brew cutting chai, crisp samosas & bun maska in peak office rush hour!',
    description: 'Hyper-engaging time management simulation! Tap and serve eager customers ordering hot cutting chai, crispy samosas, and buttered bun maska before their patience runs out. Build lightning customer combos and become the ultimate Tapri Tycoon!',
    category: '☕ Desi Meme Vibes',
    categoryKey: 'meme',
    thumbnail: '☕',
    bannerImage: '/games/chai-tapri.jpg',
    playCount: 185000,
    rating: 4.93,
    difficulty: 'Medium',
    duration: '45 sec',
    multiplayer: false,
    isTrending: true,
    isPopular: true,
    isFeatured: true,
    controls: ['Click Chai, Samosa, or Bun Maska buttons or Press 1 / 2 / 3 on keyboard'],
    tags: ['Tycoon', 'Cooking', 'Time Management', 'Desi', 'Speed'],
    rules: [
      'Match customer orders with corresponding recipe buttons',
      'Serve quickly before the patience bar depletes',
      'Consecutive correct deliveries trigger 2x, 3x, 4x Rush Combos',
      'Serve as many orders as possible within 45 seconds!'
    ]
  },
  {
    id: 'gully-cricket',
    title: 'Gully Cricket Box League 🏏🔥',
    slug: 'gully-cricket',
    tagline: 'Timing-based street batting! One-tip-one-hand, car windows are OUT, smash 6s over terrace!',
    description: 'Authentic Indian street gully cricket experience! Watch the bowler run in, judge the trajectory and bounce, then time your swing for crisp 4s and monster 6s. Beware: hitting uncle’s car window or getting caught one-tip is immediate OUT!',
    category: '🏫 School Vibes',
    categoryKey: 'school',
    thumbnail: '🏏',
    bannerImage: '/games/gully-cricket.jpg',
    playCount: 215000,
    rating: 4.97,
    difficulty: 'Hard',
    duration: '1-2 min',
    multiplayer: true,
    multiplayerModes: ['local', 'online', 'ai'],
    isTrending: true,
    isPopular: true,
    isFeatured: true,
    controls: ['Click "HIT SHOT" or Press Spacebar at the exact sweet spot moment'],
    tags: ['Cricket', 'Sports', 'Timing', 'Gully', 'Indian'],
    rules: [
      '1 Over Challenge (6 Balls)',
      'PERFECT timing: +6 Runs (Terrace Sixer!)',
      'GOOD timing: +4 Runs (Street Boundary)',
      'EARLY / LATE timing: 1-2 Runs or Catch Out',
      'Score 18+ runs to achieve victory status!'
    ]
  },
  {
    id: 'emoji-dodge',
    title: 'Meme Emoji Dodge & Survive 🎭⚡',
    slug: 'emoji-dodge',
    tagline: 'Dodge rain of cringe emojis, collect dank meme gems & activate protective gigachad shields!',
    description: 'Fast-paced survival arcade! Control your player avatar to dodge descending cringe emojis (clowns, skulls, broken hearts) while snatching golden dank meme trophies and invincibility shields across the arena.',
    category: '☕ Desi Meme Vibes',
    categoryKey: 'meme',
    thumbnail: '🎭',
    bannerImage: '/games/emoji-dodge.jpg',
    playCount: 158000,
    rating: 4.89,
    difficulty: 'Easy',
    duration: '1-2 min',
    multiplayer: false,
    isTrending: false,
    isPopular: true,
    isFeatured: false,
    controls: ['Arrow Keys or A/D to Move Left & Right', 'Touch / Drag on Mobile'],
    tags: ['Arcade', 'Dodge', 'Meme', 'Emojis', 'Casual'],
    rules: [
      'Avoid red cringe emojis (Lose game on contact without shield)',
      'Snatch golden dank emojis for +25 points and combo streak',
      'Collect 🛡️ shields for 5 seconds of total invulnerability'
    ]
  },
  {
    id: 'meme-clicker',
    title: 'Viral Indian Meme Clicker 🚀',
    slug: 'meme-clicker',
    tagline: 'Click to generate meme clout, hire auto-roasters & unlock viral internet empire!',
    description: 'Addictive idle clicker with viral Indian pop-culture references! Click the central meme generator to create clout points, buy auto-roaster bot upgrades, trigger critical clicks, and unlock meme empire achievements.',
    category: '☕ Desi Meme Vibes',
    categoryKey: 'meme',
    thumbnail: '🚀',
    bannerImage: '/games/meme-clicker.jpg',
    playCount: 176000,
    rating: 4.91,
    difficulty: 'Easy',
    duration: 'Casual',
    multiplayer: false,
    isTrending: false,
    isPopular: true,
    isFeatured: false,
    controls: ['Click central Meme button or Press Spacebar', 'Purchase power-up upgrades from side shop'],
    tags: ['Clicker', 'Idle', 'Meme', 'Upgrades', 'Casual'],
    rules: [
      'Each click gives Clout points',
      'Critical hits yield 5x bonus points with sparkle bursts',
      'Hire Auto-Bots to generate passive clout every second',
      'Submit your final clout score to rank on global leaderboards!'
    ]
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
  loginWithEmail: (emailOrUsername: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; code?: string }>;
  registerWithEmail: (params: { email: string; password: string; username: string; displayName?: string; avatar?: string }) => Promise<{ success: boolean; error?: string; code?: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfileData: (updates: { avatar?: string; displayName?: string; bio?: string }) => Promise<{ success: boolean; error?: string }>;
  submitGameScore: (gameId: string, score: number, isWin?: boolean) => Promise<{ success: boolean; xpEarned: number; newHighScore: boolean; coinsEarned?: number }>;
  loginAnonymously: (customDetails?: Partial<UserProfile>) => Promise<{ success: boolean; error?: string; code?: string; isFallback?: boolean }>;
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
  spinDailyReward: () => { coins: number; xp: number; rewardName: string; alreadyClaimed?: boolean };
  buyShopItem: (item: { id: string; name: string; priceCoins: number; skinKey?: string }) => { success: boolean; error?: string };
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
      recentlyPlayedIds: [],
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
      openMultiplayerModal: (game) => set({ activeMultiplayerModal: true, selectedMultiplayerGame: game || GAMES_CATALOG[0] }),
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

      loginWithEmail: async (emailOrUsername, password, rememberMe = true) => {
        const res = await signInWithEmail(emailOrUsername, password, rememberMe, get().user);
        if (res.success && res.user) {
          set({ user: res.user, activeAuthModal: false });
          soundFx.playLevelUp();
          return { success: true };
        }
        return { success: false, error: res.error || 'Login failed', code: res.code };
      },

      registerWithEmail: async (params) => {
        const res = await signUpWithEmail(params, get().user);
        if (res.success && res.user) {
          set({ user: res.user, activeAuthModal: false });
          soundFx.playLevelUp();
          return { success: true };
        }
        return { success: false, error: res.error || 'Registration failed', code: res.code };
      },

      sendPasswordResetEmail: async (email) => {
        return await sendPasswordReset(email);
      },

      updateProfileData: async (updates) => {
        const currentUser = get().user;
        const uid = currentUser.uid || currentUser.id;
        
        // Optimistically update local store with safe editable fields
        const localUpdates: Partial<UserProfile> = {};
        if (updates.avatar) localUpdates.avatar = updates.avatar;
        if (updates.displayName) localUpdates.displayName = updates.displayName;
        if (updates.bio !== undefined) localUpdates.bio = updates.bio;

        set({ user: { ...currentUser, ...localUpdates } });
        soundFx.playClick();

        const res = await updateUserProfileData(uid, updates);
        return res;
      },

      submitGameScore: async (gameId, score, isWin = true) => {
        const currentUser = get().user;
        const game = GAMES_CATALOG.find((g) => g.id === gameId);
        const gameTitle = game?.title || gameId;

        const res = await submitGameScoreSecure(gameId, gameTitle, score, currentUser);
        
        if (res.success) {
          const validatedScore = Math.max(0, Math.floor(score));
          const currentStats = currentUser.stats;
          const gamesPlayed = (currentStats.gamesPlayed || 0) + 1;
          const totalWins = (currentStats.totalWins || 0) + (isWin ? 1 : 0);
          const totalLosses = (currentStats.totalLosses || 0) + (isWin ? 0 : 1);
          const winRate = Math.round((totalWins / gamesPlayed) * 100);
          const totalScore = (currentStats.totalScore || 0) + validatedScore;
          const bestScore = Math.max(currentStats.bestScore || 0, validatedScore);
          const highScores = {
            ...currentStats.highScores,
            [gameId]: Math.max(currentStats.highScores[gameId] || 0, validatedScore)
          };

          const newXp = currentUser.xp + res.xpEarned;
          const newLevel = Math.floor(newXp / 500) + 1;
          const newCoins = currentUser.coins + (res.coinsEarned || 25);

          // Calculate real Rank based on total Score
          let rank: string = 'Bronze II';
          if (gamesPlayed === 0) rank = 'Unranked';
          else if (totalScore >= 10000) rank = 'Grandmaster';
          else if (totalScore >= 5000) rank = 'Diamond I';
          else if (totalScore >= 2500) rank = 'Platinum II';
          else if (totalScore >= 1000) rank = 'Gold III';
          else if (totalScore >= 500) rank = 'Silver I';
          else rank = 'Bronze II';

          // Check dynamic achievements
          const existingBadgeIds = new Set((currentUser.badges || []).map((b) => b.id));
          const newBadges = [...(currentUser.badges || [])];

          if (gamesPlayed >= 1 && !existingBadgeIds.has('b_first_game')) {
            newBadges.push({
              id: 'b_first_game',
              name: 'First Step',
              description: 'Completed your first game in Chill Arena',
              icon: '🎮',
              unlockedAt: new Date().toISOString(),
              category: 'gaming'
            });
          }
          if (totalWins >= 1 && !existingBadgeIds.has('b_first_win')) {
            newBadges.push({
              id: 'b_first_win',
              name: 'First Victory',
              description: 'Won your first match in the Arena',
              icon: '🏆',
              unlockedAt: new Date().toISOString(),
              category: 'gaming'
            });
          }
          if (bestScore >= 500 && !existingBadgeIds.has('b_high_score')) {
            newBadges.push({
              id: 'b_high_score',
              name: 'Score Master',
              description: 'Achieved a single game score of 500+',
              icon: '🔥',
              unlockedAt: new Date().toISOString(),
              category: 'legend'
            });
          }
          if (totalWins >= 10 && !existingBadgeIds.has('b_ten_wins')) {
            newBadges.push({
              id: 'b_ten_wins',
              name: 'Arena Champion',
              description: 'Achieved 10 victories in Chill Arena',
              icon: '👑',
              unlockedAt: new Date().toISOString(),
              category: 'legend'
            });
          }

          // Build Real Match History Record
          const newMatchRecord: RecentMatch = {
            id: `match_${Date.now()}`,
            gameId,
            gameTitle,
            gameIcon: game?.thumbnail || '🎮',
            player1: {
              name: currentUser.displayName || currentUser.username,
              avatar: currentUser.avatar,
              score: validatedScore
            },
            player2: {
              name: 'AI Challenger',
              avatar: '🤖',
              score: Math.max(0, validatedScore - 15)
            },
            winner: isWin ? (currentUser.displayName || currentUser.username) : 'AI Challenger',
            roastQuote: isWin ? 'Victory secured in the Arena!' : 'Hard luck! Keep training!',
            timeAgo: 'Just now'
          };

          const updatedUser: UserProfile = {
            ...currentUser,
            xp: newXp,
            level: newLevel,
            coins: newCoins,
            rank,
            badges: newBadges,
            stats: {
              ...currentStats,
              gamesPlayed,
              totalWins,
              totalLosses,
              winRate,
              totalScore,
              bestScore,
              highScores
            }
          };

          set((state) => ({
            user: updatedUser,
            recentMatches: [newMatchRecord, ...state.recentMatches].slice(0, 10)
          }));

          // Trigger Challenge Progress
          get().updateChallengeProgress('general', 1);
          if (game?.categoryKey) {
            get().updateChallengeProgress(game.categoryKey, 1);
          }

          if (updatedUser.isCloudSynced && updatedUser.uid) {
            syncUserProfileToCloud(updatedUser);
            saveScoreToCloudLeaderboard(gameId, gameTitle, validatedScore, updatedUser);
          }
        }
        return res;
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
        const game = GAMES_CATALOG.find((g) => g.id === gameId) || GAMES_CATALOG[0];
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
          hostName: 'Room Host',
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
        const user = get().user;
        const todayStr = new Date().toISOString().slice(0, 10);
        
        if (user.badges?.some((b) => b.id === `spin_${todayStr}`)) {
          return { coins: 0, xp: 0, rewardName: 'Already claimed today! Next spin at 00:00 UTC.', alreadyClaimed: true };
        }

        const rewards = [
          { coins: 150, xp: 75, rewardName: '150 Coins + 75 XP' },
          { coins: 350, xp: 150, rewardName: '350 Coins + 150 XP' },
          { coins: 750, xp: 300, rewardName: '750 Bonus Coins 🪙' },
          { coins: 100, xp: 250, rewardName: '250 XP Boost 🚀' },
          { coins: 1000, xp: 500, rewardName: '1000 Coins + 500 XP Grand Prize' }
        ];
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        
        const updatedUser: UserProfile = {
          ...user,
          coins: user.coins + randomReward.coins,
          xp: user.xp + randomReward.xp,
          badges: [
            ...user.badges.filter((b) => !b.id.startsWith('spin_')),
            {
              id: `spin_${todayStr}`,
              name: 'Daily Spinner',
              description: `Claimed daily wheel bonus on ${todayStr}`,
              icon: '🎁',
              unlockedAt: new Date().toISOString(),
              category: 'social'
            }
          ]
        };

        set({ user: updatedUser });
        if (updatedUser.isCloudSynced && updatedUser.uid) {
          syncUserProfileToCloud(updatedUser);
        }

        return randomReward;
      },

      buyShopItem: (item: { id: string; name: string; priceCoins: number; skinKey?: string }) => {
        const user = get().user;
        if (user.coins < item.priceCoins) {
          return {
            success: false,
            error: `Need ${item.priceCoins} Meme Coins! You currently have ${user.coins} coins.`
          };
        }

        const newUnlockedSkins = item.skinKey && !user.unlockedSkins.includes(item.skinKey)
          ? [...user.unlockedSkins, item.skinKey]
          : user.unlockedSkins;

        const updatedUser: UserProfile = {
          ...user,
          coins: user.coins - item.priceCoins,
          unlockedSkins: newUnlockedSkins,
          equippedSkin: item.skinKey || user.equippedSkin
        };

        set({ user: updatedUser });
        soundFx.playLevelUp();
        if (updatedUser.isCloudSynced && updatedUser.uid) {
          syncUserProfileToCloud(updatedUser);
        }
        return { success: true };
      }
    }),
    {
      name: 'memeverse-v2-storage',
      onRehydrateStorage: () => (state) => {
        if (state && (!state.user.id || state.user.id === 'usr_guest') && !state.user.uid) {
          const deviceId = getOrCreateDeviceId();
          state.user.id = deviceId;
          if (state.user.username === 'Gamer') {
            state.user.username = `Gamer_${deviceId.slice(-4).toUpperCase()}`;
          }
        }
      }
    }
  )
);

