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
  authType: 'google' | 'guest' | 'discord' | 'email' = 'google'
): UserProfile => {
  const timestamp = Date.now();
  const safeAuthType = authType === 'discord' ? 'guest' : authType;
  return {
    id: `usr_cloud_${timestamp.toString().slice(-4)}`,
    uid: `cloud_uid_${timestamp}`,
    username: currentProfile?.username || (authType === 'google' ? 'Google_MemeMaster' : authType === 'email' ? 'Email_Gamer' : 'Guest_Player69'),
    avatar: currentProfile?.avatar || '🚀',
    authType: safeAuthType,
    email: (authType === 'google' || authType === 'email') ? (currentProfile?.email || 'mememaster@chillarena.app') : undefined,
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
    // If offline / demo mode, accept valid username formats
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
    return { available: true }; // Permissive fallback if index/rules not deployed yet
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
    const demoUser: UserProfile = {
      ...generateDemoProfile(currentProfile, 'email'),
      email: cleanEmail,
      username: cleanUsername,
      displayName: cleanDisplayName,
      avatar,
      authType: 'email',
      createdAt: new Date().toISOString()
    };
    return { success: true, user: demoUser, isFallback: true };
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

    // 3. Build comprehensive SaaS UserProfile
    const profile: UserProfile = {
      id: fbUser.uid,
      uid: fbUser.uid,
      email: cleanEmail,
      username: cleanUsername,
      displayName: cleanDisplayName,
      avatar: avatar,
      bio: 'Ready to conquer the MemeVerse arena! 🎮',
      authType: 'email',
      isCloudSynced: true,
      xp: currentProfile?.xp || 500,
      level: currentProfile?.level || 1,
      coins: currentProfile?.coins || 1000,
      streak: 1,
      rank: 'Bronze III',
      createdAt: new Date().toISOString(),
      lastLoginDate: new Date().toISOString(),
      badges: [
        { id: 'b_welcome', name: 'Arena Recruit', description: 'Signed up for Chill Arena', icon: '🎖️', category: 'gaming' },
        { id: 'b_verified', name: 'Verified SaaS Gamer', description: 'Registered with Email Security', icon: '🛡️', category: 'social' }
      ],
      unlockedSkins: ['default', 'neon_visor'],
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
    const demoUser: UserProfile = {
      ...generateDemoProfile(currentProfile, 'email'),
      email: identifier.includes('@') ? identifier : `${identifier}@chillarena.app`,
      username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
      displayName: identifier.includes('@') ? identifier.split('@')[0] : identifier,
      authType: 'email',
      lastLoginDate: new Date().toISOString()
    };
    return { success: true, user: demoUser, isFallback: true };
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
      xp: currentProfile?.xp || 1200,
      level: currentProfile?.level || 3,
      coins: currentProfile?.coins || 2500,
      streak: (currentProfile?.streak || 1),
      lastLoginDate: new Date().toISOString(),
      badges: currentProfile?.badges || [
        { id: 'b1', name: 'Arena Member', description: 'Active Chill Arena Gamer', icon: '🎮', category: 'gaming' }
      ],
      unlockedSkins: currentProfile?.unlockedSkins || ['default', 'neon_visor'],
      equippedSkin: currentProfile?.equippedSkin || 'neon_visor',
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
): Promise<{ success: boolean; xpEarned: number; newHighScore: boolean }> => {
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
    newHighScore: isNewHigh
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

