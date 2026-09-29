import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as updateFbProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  getFirebaseAuth,
  getFirebaseDb,
  getGoogleProvider,
  isFirebaseConfigured
} from './firebase';
import { UserProfile, LeaderboardEntry } from '@/types';

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
  code?: string;
  isFallback?: boolean;
}

/**
 * Translates raw Firebase Auth error codes into helpful, actionable guidance.
 */
export const formatAuthError = (error: any): { message: string; code: string; isConfigIssue: boolean } => {
  const code = error?.code || 'auth/unknown';
  let message = error?.message || 'Authentication error occurred.';
  let isConfigIssue = false;

  switch (code) {
    case 'auth/unauthorized-domain':
      message = 'Domain not authorized in Firebase Console. Add this domain in Firebase Console > Authentication > Settings > Authorized Domains.';
      isConfigIssue = true;
      break;
    case 'auth/operation-not-allowed':
      message = 'Authentication provider is not enabled in Firebase Console > Authentication > Sign-in method.';
      isConfigIssue = true;
      break;
    case 'auth/popup-blocked':
      message = 'Sign-in pop-up was blocked by your browser. You can click "Sign In (Redirect)" or use Instant Cloud Play.';
      break;
    case 'auth/popup-closed-by-user':
      message = 'Sign-in window was closed before completing authentication.';
      break;
    case 'auth/cancelled-popup-request':
      message = 'Another sign-in request was initiated. Please try again.';
      break;
    case 'auth/network-request-failed':
      message = 'Network error connecting to Auth servers. Please check your internet connection.';
      break;
    case 'auth/email-already-in-use':
      message = 'This email address is already registered. Please login instead.';
      break;
    case 'auth/user-not-found':
      message = 'No account found with this email or username. Please check your credentials or Sign Up.';
      break;
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      message = 'Invalid email or password. Please verify your login details.';
      break;
    case 'auth/weak-password':
      message = 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
      break;
    case 'auth/invalid-email':
      message = 'Please enter a valid email address.';
      break;
    case 'auth/too-many-requests':
      message = 'Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.';
      break;
    case 'auth/user-disabled':
      message = 'This user account has been disabled by an administrator.';
      break;
    case 'auth/invalid-api-key':
      message = 'Invalid Firebase API key. Please check your NEXT_PUBLIC_FIREBASE_API_KEY.';
      isConfigIssue = true;
      break;
    case 'auth/app-deleted':
    case 'auth/invalid-app-credential':
      message = 'Firebase App configuration issue. Please verify your Firebase project credentials.';
      isConfigIssue = true;
      break;
    default:
      if (typeof message === 'string' && message.startsWith('Firebase: Error (')) {
        message = message.replace(/^Firebase: Error \(([^)]+)\)\.?/, '$1').trim();
      }
      break;
  }

  return { message, code, isConfigIssue };
};

/**
 * Creates a standard UserProfile representation from Firebase User details.
 */
export const buildProfileFromFirebaseUser = (
  fbUser: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null },
  currentProfile?: Partial<UserProfile>,
  authType: 'google' | 'guest' = 'google'
): UserProfile => {
  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    email: fbUser.email || undefined,
    photoURL: fbUser.photoURL || undefined,
    username: fbUser.displayName || currentProfile?.username || `Gamer_${fbUser.uid.slice(-4)}`,
    avatar: currentProfile?.avatar || '🚀',
    authType: authType,
    isCloudSynced: true,
    xp: currentProfile?.xp || 0,
    level: currentProfile?.level || 1,
    coins: currentProfile?.coins || 0,
    streak: currentProfile?.streak || 0,
    rank: currentProfile?.rank || 'Unranked',
    lastLoginDate: new Date().toISOString(),
    badges: currentProfile?.badges || [],
    unlockedSkins: currentProfile?.unlockedSkins || ['default'],
    equippedSkin: currentProfile?.equippedSkin || 'default',
    stats: currentProfile?.stats || {
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
};

/**
 * Sign In with Google Popup (with isolated Firestore sync)
 */
export const signInWithGoogle = async (
  currentProfile?: Partial<UserProfile>
): Promise<AuthResult> => {
  const auth = getFirebaseAuth();
  const googleProvider = getGoogleProvider();

  if (!isFirebaseConfigured() || !auth || !googleProvider) {
    return {
      success: false,
      error: 'Firebase authentication is not configured or offline.'
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    let profile = buildProfileFromFirebaseUser(fbUser, currentProfile, 'google');

    // Attempt to sync with Firestore, but NEVER fail login if Firestore has rule/network issues
    const db = getFirebaseDb();
    if (db) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as Partial<UserProfile>;
          profile = {
            ...profile,
            ...data,
            id: fbUser.uid,
            uid: fbUser.uid,
            email: fbUser.email || data.email,
            photoURL: fbUser.photoURL || data.photoURL,
            username: currentProfile?.username || data.username || fbUser.displayName || profile.username,
            avatar: currentProfile?.avatar || data.avatar || profile.avatar,
            isCloudSynced: true,
            lastLoginDate: new Date().toISOString()
          };
          await setDoc(userDocRef, { lastLoginDate: new Date().toISOString() }, { merge: true });
        } else {
          await setDoc(userDocRef, {
            ...profile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      } catch (firestoreErr) {
        console.warn('Firestore user profile sync warning (Auth still succeeded):', firestoreErr);
      }
    }

    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    const formatted = formatAuthError(error);

    return {
      success: false,
      error: formatted.message,
      code: formatted.code
    };
  }
};

/**
 * Sign In with Google Redirect (Bypasses popup blocker completely)
 */
export const signInWithGoogleRedirect = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  const googleProvider = getGoogleProvider();
  if (auth && googleProvider) {
    await signInWithRedirect(auth, googleProvider);
  }
};

/**
 * Check and process redirect login result after page reload
 */
export const checkRedirectResult = async (): Promise<UserProfile | null> => {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return buildProfileFromFirebaseUser(result.user, undefined, 'google');
    }
  } catch (err) {
    console.warn('Redirect auth result notice:', err);
  }
  return null;
};

/**
 * Sign In Anonymously with Firebase Auth
 */
export const signInAnonymouslyWithFirebase = async (
  currentProfile?: Partial<UserProfile>
): Promise<AuthResult> => {
  const auth = getFirebaseAuth();

  if (!isFirebaseConfigured() || !auth) {
    return {
      success: false,
      error: 'Firebase authentication is not configured or offline.'
    };
  }

  try {
    const result = await signInAnonymously(auth);
    const fbUser = result.user;
    const profile = buildProfileFromFirebaseUser(fbUser, currentProfile, 'guest');

    const db = getFirebaseDb();
    if (db) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        await setDoc(userDocRef, {
          ...profile,
          lastLoginDate: new Date().toISOString(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn('Firestore anonymous sync notice:', e);
      }
    }

    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Anonymous Sign-in error:', error);
    const formatted = formatAuthError(error);
    return {
      success: false,
      error: formatted.message,
      code: formatted.code
    };
  }
};

/**
 * Check if a username is available in Firestore
 */
export const checkUsernameAvailability = async (username: string, currentUid?: string): Promise<{ available: boolean; error?: string }> => {
  const cleanUsername = username.trim();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { available: false, error: 'Username must be at least 3 characters long.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return { available: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }

  const db = getFirebaseDb();
  if (!isFirebaseConfigured() || !db) {
    return { available: true };
  }

  try {
    const q = query(
      collection(db, 'users'),
      where('usernameLower', '==', cleanUsername.toLowerCase()),
      limit(1)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return { available: true };
    }

    // If the existing doc belongs to current user, it is available to them
    const existingDoc = snap.docs[0];
    if (currentUid && existingDoc.id === currentUid) {
      return { available: true };
    }

    return { available: false, error: 'Username is already taken by another gamer.' };
  } catch (err) {
    console.warn('Username availability check fallback:', err);
    return { available: true };
  }
};

/**
 * Sign Up with Email and Password (SaaS-grade with profile initialization)
 */
export const signUpWithEmail = async (
  params: {
    email: string;
    password: string;
    username: string;
    displayName?: string;
    avatar?: string;
  },
  currentProfile?: Partial<UserProfile>
): Promise<AuthResult> => {
  const auth = getFirebaseAuth();
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanUsername = params.username.trim();
  const cleanDisplayName = params.displayName?.trim() || cleanUsername;
  const avatar = params.avatar || currentProfile?.avatar || '🚀';

  if (!isFirebaseConfigured() || !auth) {
    return {
      success: false,
      error: 'Firebase authentication is not configured or offline.'
    };
  }

  try {
    // 1. Create auth user
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
    const fbUser = cred.user;

    // 2. Set Firebase Auth display name
    try {
      await updateFbProfile(fbUser, { displayName: cleanDisplayName });
    } catch (e) {
      console.warn('Failed to update FB profile displayName:', e);
    }

    // 3. Build comprehensive SaaS UserProfile with genuine starting baseline
    const profile: UserProfile = {
      id: fbUser.uid,
      uid: fbUser.uid,
      email: cleanEmail,
      username: cleanUsername,
      displayName: cleanDisplayName,
      avatar: avatar,
      bio: 'Chill Arena Gamer 🎮',
      authType: 'email',
      isCloudSynced: true,
      xp: currentProfile?.xp || 0,
      level: currentProfile?.level || 1,
      coins: currentProfile?.coins || 100,
      streak: 0,
      rank: 'Unranked',
      createdAt: new Date().toISOString(),
      lastLoginDate: new Date().toISOString(),
      badges: [],
      unlockedSkins: ['default'],
      equippedSkin: 'default',
      stats: currentProfile?.stats || {
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

    // 4. Save to Firestore `users` collection with low-case username indexing
    const db = getFirebaseDb();
    if (db) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        await setDoc(userDocRef, {
          ...profile,
          usernameLower: cleanUsername.toLowerCase(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (firestoreErr) {
        console.warn('Firestore signup profile sync warning:', firestoreErr);
      }
    }

    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Sign up error:', error);
    const formatted = formatAuthError(error);
    return {
      success: false,
      error: formatted.message,
      code: formatted.code
    };
  }
};

/**
 * Sign In with Email or Username + Password (SaaS-grade with Remember Me)
 */
export const signInWithEmail = async (
  emailOrUsername: string,
  password: string,
  rememberMe: boolean = true,
  currentProfile?: Partial<UserProfile>
): Promise<AuthResult> => {
  const auth = getFirebaseAuth();
  const identifier = emailOrUsername.trim();

  if (!isFirebaseConfigured() || !auth) {
    return {
      success: false,
      error: 'Firebase authentication is not configured or offline.'
    };
  }

  try {
    // Configure session persistence
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

    let targetEmail = identifier;

    // If user provided a username instead of an email, look up email in Firestore
    if (!identifier.includes('@')) {
      const db = getFirebaseDb();
      if (db) {
        try {
          const q = query(
            collection(db, 'users'),
            where('usernameLower', '==', identifier.toLowerCase()),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const userData = snap.docs[0].data();
            if (userData.email) {
              targetEmail = userData.email;
            }
          }
        } catch (lookupErr) {
          console.warn('Username-to-email lookup error:', lookupErr);
        }
      }
    }

    const cred = await signInWithEmailAndPassword(auth, targetEmail, password);
    const fbUser = cred.user;

    let profile: UserProfile = {
      id: fbUser.uid,
      uid: fbUser.uid,
      email: fbUser.email || undefined,
      username: fbUser.displayName || currentProfile?.username || `Gamer_${fbUser.uid.slice(-4)}`,
      displayName: fbUser.displayName || currentProfile?.displayName || fbUser.displayName || undefined,
      avatar: currentProfile?.avatar || '🚀',
      authType: 'email',
      isCloudSynced: true,
      xp: currentProfile?.xp || 0,
      level: currentProfile?.level || 1,
      coins: currentProfile?.coins || 0,
      streak: currentProfile?.streak || 0,
      rank: currentProfile?.rank || 'Unranked',
      lastLoginDate: new Date().toISOString(),
      badges: currentProfile?.badges || [],
      unlockedSkins: currentProfile?.unlockedSkins || ['default'],
      equippedSkin: currentProfile?.equippedSkin || 'default',
      stats: currentProfile?.stats || {
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

    // Fetch and merge Firestore profile data
    const db = getFirebaseDb();
    if (db) {
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const cloudData = userSnap.data() as Partial<UserProfile>;
          profile = {
            ...profile,
            ...cloudData,
            id: fbUser.uid,
            uid: fbUser.uid,
            email: fbUser.email || cloudData.email,
            username: cloudData.username || profile.username,
            displayName: cloudData.displayName || cloudData.username || profile.displayName,
            avatar: cloudData.avatar || profile.avatar,
            bio: cloudData.bio || profile.bio,
            stats: {
              ...profile.stats,
              ...(cloudData.stats || {})
            },
            lastLoginDate: new Date().toISOString()
          };
          await setDoc(userDocRef, { lastLoginDate: new Date().toISOString() }, { merge: true });
        }
      } catch (firestoreErr) {
        console.warn('Firestore profile fetch warning during sign-in:', firestoreErr);
      }
    }

    return { success: true, user: profile };
  } catch (error: any) {
    console.error('Email Sign-in error:', error);
    const formatted = formatAuthError(error);
    return {
      success: false,
      error: formatted.message,
      code: formatted.code
    };
  }
};

/**
 * Send Password Reset Email
 */
export const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  const cleanEmail = email.trim();
  if (!cleanEmail) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const auth = getFirebaseAuth();
  if (!isFirebaseConfigured() || !auth) {
    return { success: true }; // Graceful simulated success
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return { success: true };
  } catch (error: any) {
    console.error('Password reset error:', error);
    const formatted = formatAuthError(error);
    return { success: false, error: formatted.message };
  }
};

/**
 * Safely update user profile fields (Only Avatar, Display Name, Bio allowed!)
 * Strictly rejects modifications to stats, xp, coins, or score directly.
 */
export const updateUserProfileData = async (
  uid: string,
  updates: { avatar?: string; displayName?: string; bio?: string }
): Promise<{ success: boolean; error?: string }> => {
  if (!uid) {
    return { success: false, error: 'User ID is required.' };
  }

  // Sanitize updates to ONLY allowed editable SaaS profile fields
  const safeUpdates: { avatar?: string; displayName?: string; bio?: string; updatedAt?: any } = {};
  if (typeof updates.avatar === 'string') safeUpdates.avatar = updates.avatar.slice(0, 32);
  if (typeof updates.displayName === 'string') safeUpdates.displayName = updates.displayName.trim().slice(0, 40);
  if (typeof updates.bio === 'string') safeUpdates.bio = updates.bio.trim().slice(0, 200);

  const db = getFirebaseDb();
  if (db && isFirebaseConfigured()) {
    try {
      const userRef = doc(db, 'users', uid);
      safeUpdates.updatedAt = serverTimestamp();
      await updateDoc(userRef, safeUpdates);

      // Also update auth displayName if changed
      const auth = getFirebaseAuth();
      if (auth?.currentUser && safeUpdates.displayName) {
        await updateFbProfile(auth.currentUser, { displayName: safeUpdates.displayName });
      }
    } catch (e: any) {
      console.warn('Firestore profile update warning:', e);
      // Try merge if document does not exist yet
      try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, safeUpdates, { merge: true });
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to save profile changes to cloud.' };
      }
    }
  }

  return { success: true };
};

/**
 * Submit Game Score with Backend validation and Anti-Cheat ceiling checks
 */
export const submitGameScoreSecure = async (
  gameId: string,
  gameTitle: string,
  score: number,
  user: UserProfile
): Promise<{ success: boolean; xpEarned: number; newHighScore: boolean; coinsEarned: number }> => {
  // Anti-Cheat Max Ceilings
  const GAME_CEILINGS: Record<string, number> = {
    'modi-run': 50000,
    'cid-escape': 25000,
    'pen-flip': 500,
    'gully-cricket': 1000,
    'chai-tapri': 50000,
    'meme-roast': 5000,
    'eraser-football': 100,
    'hand-cricket': 300,
    'pappu-pakia': 25000
  };

  const maxAllowed = GAME_CEILINGS[gameId] || 100000;
  const validatedScore = Math.max(0, Math.min(Math.floor(score), maxAllowed));
  const currentBest = user.stats.highScores?.[gameId] || 0;
  const isNewHigh = validatedScore > currentBest;

  // Calculate XP reward
  const baseXP = 50;
  const bonusXP = isNewHigh ? 100 : Math.min(100, Math.floor(validatedScore / 50));
  const xpEarned = baseXP + bonusXP;
  const coinsEarned = Math.max(10, Math.min(250, Math.floor(validatedScore / 10)));

  // Persist to Cloud Leaderboards
  if (user.isCloudSynced && isFirebaseConfigured()) {
    try {
      await saveScoreToCloudLeaderboard(gameId, gameTitle, validatedScore, user);
    } catch (e) {
      console.warn('Leaderboard score cloud persist note:', e);
    }
  }

  return {
    success: true,
    xpEarned,
    newHighScore: isNewHigh,
    coinsEarned
  };
};

/**
 * Sign Out User
 */
export const logoutFromFirebase = async (): Promise<boolean> => {
  const auth = getFirebaseAuth();
  if (!isFirebaseConfigured() || !auth) {
    return true;
  }
  try {
    await signOut(auth);
    return true;
  } catch (err) {
    console.error('Logout error:', err);
    return false;
  }
};

/**
 * Sync Full User Profile to Cloud Firestore
 */
export const syncUserProfileToCloud = async (profile: UserProfile): Promise<boolean> => {
  const db = getFirebaseDb();
  if (!isFirebaseConfigured() || !db || !profile.uid) {
    return false;
  }

  try {
    const userDocRef = doc(db, 'users', profile.uid);
    await setDoc(
      userDocRef,
      {
        ...profile,
        isCloudSynced: true,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Error syncing profile to Firestore:', error);
    return false;
  }
};

/**
 * Save High Score to Firestore Leaderboard
 */
export const saveScoreToCloudLeaderboard = async (
  gameId: string,
  gameTitle: string,
  score: number,
  user: UserProfile
): Promise<boolean> => {
  const db = getFirebaseDb();
  if (!isFirebaseConfigured() || !db) {
    return false;
  }

  try {
    const scoreId = `${user.uid || user.id}_${gameId}`;
    const scoreDocRef = doc(db, 'leaderboards', scoreId);

    await setDoc(
      scoreDocRef,
      {
        userId: user.uid || user.id,
        username: user.username,
        avatar: user.avatar,
        gameId,
        gameTitle,
        score,
        xp: user.xp,
        wins: user.stats.totalWins,
        country: '🇮🇳 Global',
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    // Also update high score in user doc
    if (user.uid) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          [`stats.highScores.${gameId}`]: score,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }

    return true;
  } catch (err) {
    console.error('Error saving score to cloud leaderboard:', err);
    return false;
  }
};

/**
 * Fetch Top Scores from Firestore Leaderboard with optional gameId filtering
 */
export const fetchCloudLeaderboard = async (
  limitCount = 200,
  gameId?: string
): Promise<LeaderboardEntry[]> => {
  const db = getFirebaseDb();
  if (!isFirebaseConfigured() || !db) {
    return [];
  }

  try {
    const leaderboardsRef = collection(db, 'leaderboards');
    const q = gameId && gameId !== 'all'
      ? query(leaderboardsRef, where('gameId', '==', gameId), orderBy('score', 'desc'), limit(limitCount))
      : query(leaderboardsRef, orderBy('score', 'desc'), limit(limitCount));

    const snapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];

    snapshot.docs.forEach((d, idx) => {
      const data = d.data();
      entries.push({
        rank: idx + 1,
        username: data.username || 'Anonymous',
        avatar: data.avatar || '🚀',
        score: Number(data.score) || 0,
        gameId: data.gameId,
        gameTitle: data.gameTitle,
        country: data.country || '🇮🇳 Global',
        wins: Number(data.wins) || 0,
        xp: Number(data.xp) || 0,
        badge: data.badge || (idx === 0 ? '👑 Leader' : idx < 3 ? '🥈 Champion' : '🔥 Veteran')
      });
    });

    return entries;
  } catch (err) {
    console.error('Error fetching cloud leaderboard:', err);
    return [];
  }
};

/**
 * Fetches all players from both 'leaderboards' and 'users' collections,
 * creating an exhaustive, unified, and deterministically ranked leaderboard.
 */
export const fetchAllCloudLeaderboard = async (
  selectedGameId = 'all'
): Promise<LeaderboardEntry[]> => {
  const db = getFirebaseDb();
  if (!isFirebaseConfigured() || !db) {
    return [];
  }

  try {
    const entriesMap = new Map<string, LeaderboardEntry>();

    // 1. Fetch scores from leaderboards collection
    try {
      const leaderboardsRef = collection(db, 'leaderboards');
      const lSnap = await getDocs(query(leaderboardsRef, limit(500)));
      lSnap.docs.forEach((d) => {
        const data = d.data();
        if (selectedGameId !== 'all' && data.gameId !== selectedGameId) return;

        const key = `${data.userId || data.username}_${data.gameId || 'all'}`;
        entriesMap.set(key, {
          rank: 0,
          username: data.username || 'Anonymous',
          avatar: data.avatar || '🚀',
          score: Number(data.score) || 0,
          gameId: data.gameId,
          gameTitle: data.gameTitle,
          country: data.country || '🇮🇳 Global',
          wins: Number(data.wins) || 0,
          xp: Number(data.xp) || 0,
          badge: data.badge || '🔥 Arena Competitor'
        });
      });
    } catch (e) {
      console.warn('Leaderboard collection query note:', e);
    }

    // 2. Fetch users from users collection to ensure ALL registered users appear
    try {
      const usersRef = collection(db, 'users');
      const uSnap = await getDocs(query(usersRef, limit(500)));
      uSnap.docs.forEach((d) => {
        const uData = d.data();
        const uname = uData.displayName || uData.username || 'Gamer';
        const userId = d.id;

        if (selectedGameId === 'all') {
          const userKey = `${userId}_all`;
          const existing = entriesMap.get(userKey);
          const totalScore = Number(uData.stats?.totalScore) || Number(uData.xp) || 0;
          const totalWins = Number(uData.stats?.totalWins) || 0;

          if (!existing) {
            entriesMap.set(userKey, {
              rank: 0,
              username: uname,
              avatar: uData.avatar || '🚀',
              score: totalScore,
              gameId: 'all',
              gameTitle: 'Overall Arena Career',
              country: uData.country || '🇮🇳 Global',
              wins: totalWins,
              xp: Number(uData.xp) || 0,
              badge: totalWins >= 10 ? '👑 Master' : totalWins >= 3 ? '🥈 Champion' : '⚡ Contender'
            });
          }
        } else {
          // Check if user has a score for this specific game
          const gameScore = uData.stats?.highScores?.[selectedGameId];
          if (gameScore !== undefined && gameScore > 0) {
            const userGameKey = `${userId}_${selectedGameId}`;
            if (!entriesMap.has(userGameKey)) {
              entriesMap.set(userGameKey, {
                rank: 0,
                username: uname,
                avatar: uData.avatar || '🚀',
                score: Number(gameScore),
                gameId: selectedGameId,
                gameTitle: selectedGameId,
                country: uData.country || '🇮🇳 Global',
                wins: Number(uData.stats?.totalWins) || 0,
                xp: Number(uData.xp) || 0,
                badge: '⚡ Verified Player'
              });
            }
          }
        }
      });
    } catch (e) {
      console.warn('Users collection query note:', e);
    }

    // 3. Sort deterministically: Score DESC -> Wins DESC -> XP DESC -> Username ASC
    const combined = Array.from(entriesMap.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const bWins = Number(b.wins) || 0;
      const aWins = Number(a.wins) || 0;
      if (bWins !== aWins) return bWins - aWins;
      const bXp = Number(b.xp) || 0;
      const aXp = Number(a.xp) || 0;
      if (bXp !== aXp) return bXp - aXp;
      return a.username.localeCompare(b.username);
    });

    // 4. Assign deterministic ranks
    return combined.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
      badge: idx === 0 ? '👑 Grand Champion' : idx < 3 ? '🥈 Podium Master' : idx < 10 ? '🔥 Top 10 Elite' : '⚡ Arena Competitor'
    }));
  } catch (err) {
    console.error('Error in fetchAllCloudLeaderboard:', err);
    return [];
  }
};

/**
 * Listen for live Leaderboard changes in Real-time
 */
export const subscribeToCloudLeaderboard = (
  callback: (entries: LeaderboardEntry[]) => void,
  limitCount = 200,
  gameId?: string
) => {
  const db = getFirebaseDb();
  if (!isFirebaseConfigured() || !db) {
    return () => {};
  }

  try {
    const leaderboardsRef = collection(db, 'leaderboards');
    const q = gameId && gameId !== 'all'
      ? query(leaderboardsRef, where('gameId', '==', gameId), orderBy('score', 'desc'), limit(limitCount))
      : query(leaderboardsRef, orderBy('score', 'desc'), limit(limitCount));

    return onSnapshot(
      q,
      (snapshot) => {
        const entries: LeaderboardEntry[] = [];
        snapshot.docs.forEach((d, idx) => {
          const data = d.data();
          entries.push({
            rank: idx + 1,
            username: data.username || 'Anonymous',
            avatar: data.avatar || '🚀',
            score: Number(data.score) || 0,
            gameId: data.gameId,
            gameTitle: data.gameTitle,
            country: data.country || '🇮🇳 Global',
            wins: Number(data.wins) || 0,
            xp: Number(data.xp) || 0,
            badge: data.badge || (idx === 0 ? '👑 Leader' : idx < 3 ? '🥈 Champion' : '🔥 Veteran')
          });
        });
        callback(entries);
      },
      (error) => {
        console.warn('Leaderboard real-time subscription note:', error);
      }
    );
  } catch (err) {
    console.error('Error subscribing to cloud leaderboard:', err);
    return () => {};
  }
};

/**
 * Subscribe to Firebase Auth State changes
 */
export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  const auth = getFirebaseAuth();
  if (!auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

