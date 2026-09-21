import {
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
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
      message = 'Domain not authorized in Firebase Console. Add this domain / localhost in Firebase Console > Authentication > Settings > Authorized Domains.';
      isConfigIssue = true;
      break;
    case 'auth/operation-not-allowed':
      message = 'Google Sign-in is not enabled in Firebase. Enable Google provider in Firebase Console > Authentication > Sign-in method.';
      isConfigIssue = true;
      break;
    case 'auth/popup-blocked':
      message = 'Sign-in pop-up was blocked by your browser. Please allow pop-ups for this site or try Guest / Anonymous login.';
      break;
    case 'auth/popup-closed-by-user':
      message = 'Sign-in window was closed before completing authentication.';
      break;
    case 'auth/cancelled-popup-request':
      message = 'Another sign-in request was initiated. Please try again.';
      break;
    case 'auth/network-request-failed':
      message = 'Network error connecting to Google Auth servers. Please check your internet connection.';
      break;
    case 'auth/invalid-api-key':
      message = 'Invalid Firebase API key. Please check your NEXT_PUBLIC_FIREBASE_API_KEY in .env.local.';
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
    username: fbUser.displayName || currentProfile?.username || `MemeGamer_${fbUser.uid.slice(-4)}`,
    avatar: currentProfile?.avatar || '🚀',
    authType: authType,
    isCloudSynced: true,
    xp: currentProfile?.xp || 2840,
    level: currentProfile?.level || 7,
    coins: currentProfile?.coins || 4850,
    streak: (currentProfile?.streak || 1),
    lastLoginDate: new Date().toISOString(),
    badges: currentProfile?.badges || [
      { id: 'b1', name: 'Meme Pioneer', description: 'Joined MemeVerse on Launch Day', icon: '🔥', category: 'legend' },
      { id: 'b_google', name: 'Cloud Connected', description: 'Firebase Authenticated Account', icon: '🌐', category: 'social' }
    ],
    unlockedSkins: currentProfile?.unlockedSkins || ['default', 'gold_crown', 'neon_visor'],
    equippedSkin: currentProfile?.equippedSkin || 'neon_visor',
    stats: currentProfile?.stats || {
      gamesPlayed: 0,
      totalWins: 0,
      winRate: 0,
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
 * Generates an instant verified demo user profile when live keys aren't ready.
 */
export const generateDemoProfile = (
  currentProfile?: Partial<UserProfile>,
  authType: 'google' | 'guest' | 'discord' = 'google'
): UserProfile => {
  const timestamp = Date.now();
  return {
    id: `usr_cloud_${timestamp.toString().slice(-4)}`,
    uid: `cloud_uid_${timestamp}`,
    username: currentProfile?.username || (authType === 'google' ? 'Google_MemeMaster' : 'Guest_Player69'),
    avatar: currentProfile?.avatar || '🚀',
    authType: authType === 'discord' ? 'guest' : authType,
    email: authType === 'google' ? (currentProfile?.email || 'mememaster@gmail.com') : undefined,
    isCloudSynced: true,
    xp: currentProfile?.xp || 3200,
    level: currentProfile?.level || 8,
    coins: currentProfile?.coins || 5200,
    streak: (currentProfile?.streak || 5) + 1,
    lastLoginDate: new Date().toISOString(),
    badges: currentProfile?.badges || [
      { id: 'b1', name: 'Meme Pioneer', description: 'Joined MemeVerse on Launch Day', icon: '🔥', category: 'legend' },
      { id: 'b_google', name: 'Cloud Verified', description: 'Connected Cloud Account & Cloud Save', icon: '🌐', category: 'social' }
    ],
    unlockedSkins: currentProfile?.unlockedSkins || ['default', 'gold_crown', 'neon_visor'],
    equippedSkin: currentProfile?.equippedSkin || 'neon_visor',
    stats: currentProfile?.stats || {
      gamesPlayed: 75,
      totalWins: 54,
      winRate: 72,
      highScores: {
        'modi-run': 2100,
        'cid-escape': 1450,
        'chai-tapri': 3100,
        'gully-cricket': 165
      },
      roastsWon: 28,
      sixesHit: 42,
      chaiServed: 140,
      penFlipsLanded: 50,
      eraserHits: 38
    }
  };
};

/**
 * Sign In with Google Popup (with isolated Firestore sync & smart fallbacks)
 */
export const signInWithGoogle = async (
  currentProfile?: Partial<UserProfile>
): Promise<AuthResult> => {
  const auth = getFirebaseAuth();
  const googleProvider = getGoogleProvider();

  // If Firebase keys aren't configured, provide instant simulated cloud account
  if (!isFirebaseConfigured() || !auth || !googleProvider) {
    const demoUser = generateDemoProfile(currentProfile, 'google');
    return { success: true, user: demoUser, isFallback: true };
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
 * Sign In Anonymously with Firebase Auth
 */
export const signInAnonymouslyWithFirebase = async (
  currentProfile?: Partial<UserProfile>
): Promise<AuthResult> => {
  const auth = getFirebaseAuth();

  if (!isFirebaseConfigured() || !auth) {
    const demoUser = generateDemoProfile(currentProfile, 'guest');
    return { success: true, user: demoUser, isFallback: true };
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
 * Fetch Top Scores from Firestore Leaderboard
 */
export const fetchCloudLeaderboard = async (limitCount = 20): Promise<LeaderboardEntry[]> => {
  const db = getFirebaseDb();
  if (!isFirebaseConfigured() || !db) {
    return [];
  }

  try {
    const q = query(
      collection(db, 'leaderboards'),
      orderBy('score', 'desc'),
      limit(limitCount)
    );

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
        wins: data.wins || 0,
        xp: data.xp || 0,
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
 * Listen for live Leaderboard changes in Real-time
 */
export const subscribeToCloudLeaderboard = (
  callback: (entries: LeaderboardEntry[]) => void,
  limitCount = 15
) => {
  const db = getFirebaseDb();
  if (!isFirebaseConfigured() || !db) {
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'leaderboards'),
      orderBy('score', 'desc'),
      limit(limitCount)
    );

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
            wins: data.wins || 0,
            xp: data.xp || 0,
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

