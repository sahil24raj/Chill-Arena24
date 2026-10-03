/**
 * Chill Arena - Real-time Authoritative Multiplayer Service
 * Powered by Firebase Firestore realtime listeners, atomic transactions, REST fallbacks, and GameAdapters.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  deleteDoc,
  DocumentSnapshot
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import {
  MultiplayerRoomState,
  RoomPlayer,
  RoomStatus,
  RoomSettings,
  MultiplayerApiResponse,
  PlayerActionPayload,
  ChatMessage
} from '@/types/multiplayer';
import { UserProfile } from '@/types';
import { generateRoomCode, normalizeRoomCode, isValidRoomCode } from './roomCodeGenerator';
import { getGameAdapter } from './adapters';
import { GAMES_CATALOG } from '@/store/useAppStore';
import { BOT_NAME_PRESETS, AIDifficulty } from '@/types/gameMode';

const ROOM_EXPIRATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 mins
const DISCONNECT_GRACE_PERIOD_MS = 30 * 1000; // 30 sec reconnection window

/**
 * Deeply cleans an object so that all undefined values become null,
 * which prevents Firestore from throwing "Unsupported field value: undefined".
 */
export function cleanForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanForFirestore(item)) as any;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      } else {
        cleaned[key] = null;
      }
    }
    return cleaned as any;
  }
  return obj;
}

const withTimeout = <T>(promise: Promise<T>, timeoutMs = 2000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), timeoutMs))
  ]);
};

// In-memory store for instant client/server sync and local fallback
const memoryRooms: Map<string, MultiplayerRoomState> = new Map();
const memoryListeners: Map<string, Set<(room: MultiplayerRoomState) => void>> = new Map();

const notifyMemoryListeners = (room: MultiplayerRoomState) => {
  const listeners = memoryListeners.get(room.roomCode);
  if (listeners) {
    listeners.forEach((fn) => fn(room));
  }
};

/**
 * Creates a new multiplayer room.
 */
export const createRoomOnServer = async (
  gameId: string,
  hostUser: Partial<UserProfile>,
  settings?: Partial<RoomSettings>
): Promise<MultiplayerApiResponse<MultiplayerRoomState>> => {
  try {
    const db = getFirebaseDb();
    const game = GAMES_CATALOG.find((g) => g.id === gameId) || GAMES_CATALOG[0];
    const adapter = getGameAdapter(game.id, game.title);

    let roomCode = generateRoomCode(6);
    const now = Date.now();

    // Check collision in Firestore (with timeout guard)
    if (db) {
      try {
        let attempts = 0;
        while (attempts < 3) {
          const checkDoc = await withTimeout(getDoc(doc(db, 'rooms', roomCode)), 1500);
          if (!checkDoc.exists()) break;
          roomCode = generateRoomCode(6);
          attempts++;
        }
      } catch (e) {
        console.warn('Firestore room check note:', e);
      }
    }

    const hostPlayerId = hostUser.id || `usr_${Date.now()}`;
    const hostPlayer: RoomPlayer = {
      id: hostPlayerId,
      userId: hostUser.uid || hostUser.id || hostPlayerId,
      username: hostUser.username || hostUser.displayName || 'Player 1',
      displayName: hostUser.displayName || hostUser.username || 'Player 1',
      avatar: hostUser.avatar || '👑',
      role: 'host',
      isHost: true,
      isReady: true,
      connectionStatus: 'CONNECTED',
      score: 0,
      joinedAt: now,
      lastSeenAt: now
    };

    const roomSettings: RoomSettings = {
      isPrivate: settings?.isPrivate ?? false,
      turnTimeLimitSec: settings?.turnTimeLimitSec ?? 45,
      roundsToWin: settings?.roundsToWin ?? 2,
      maxPlayers: settings?.maxPlayers ?? adapter.maxPlayers,
      ...settings
    };

    const initialGameState = adapter.getInitialState([hostPlayer], roomSettings);

    const newRoom: MultiplayerRoomState = {
      roomId: `room_${roomCode}_${now}`,
      roomCode,
      gameId: game.id,
      gameTitle: game.title,
      hostId: hostPlayerId,
      hostUsername: hostPlayer.username,
      players: [hostPlayer],
      maxPlayers: roomSettings.maxPlayers || adapter.maxPlayers,
      minPlayers: adapter.minPlayers,
      status: 'WAITING',
      stateVersion: 1,
      currentTurnPlayerId: hostPlayerId,
      winnerPlayerId: null,
      winnerUsername: null,
      countdown: null,
      gameState: initialGameState,
      settings: roomSettings,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + ROOM_EXPIRATION_MS
    };

    const cleanedRoom = cleanForFirestore(newRoom);

    if (db) {
      try {
        await withTimeout(setDoc(doc(db, 'rooms', roomCode), cleanedRoom), 2000);
      } catch (err) {
        console.warn('Firestore setDoc failed, saving to memory:', err);
      }
    }

    memoryRooms.set(roomCode, cleanedRoom);
    notifyMemoryListeners(cleanedRoom);
    return { success: true, data: cleanedRoom };
  } catch (error: any) {
    console.error('Failed to create room:', error);
    return {
      success: false,
      error: error.message || 'Failed to initialize multiplayer room.',
      code: 'INTERNAL_ERROR'
    };
  }
};

/**
 * Retrieves a room's state by room code.
 */
export const getRoomByCode = async (
  rawCode: string
): Promise<MultiplayerApiResponse<MultiplayerRoomState>> => {
  try {
    const code = normalizeRoomCode(rawCode);
    if (!isValidRoomCode(code)) {
      return { success: false, error: 'Invalid room code format.', code: 'INVALID_ROOM_CODE' };
    }

    const db = getFirebaseDb();
    let room: MultiplayerRoomState | null = null;

    if (db) {
      try {
        const snap = await withTimeout(getDoc(doc(db, 'rooms', code)), 2000);
        if (snap.exists()) {
          room = snap.data() as MultiplayerRoomState;
        }
      } catch (err) {
        console.warn('Firestore getDoc error, checking memory:', err);
      }
    }

    if (!room) {
      room = memoryRooms.get(code) || null;
    }

    if (!room) {
      return { success: false, error: 'Room not found or has been closed.', code: 'ROOM_NOT_FOUND' };
    }

    // Check expiration
    if (Date.now() > room.expiresAt || room.status === 'EXPIRED') {
      return { success: false, error: 'This game room has expired.', code: 'ROOM_EXPIRED' };
    }

    return { success: true, data: room };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error fetching room.', code: 'INTERNAL_ERROR' };
  }
};

/**
 * Joins an existing multiplayer room.
 */
export const joinRoomOnServer = async (
  rawCode: string,
  joiningUser: Partial<UserProfile>
): Promise<MultiplayerApiResponse<MultiplayerRoomState>> => {
  try {
    const code = normalizeRoomCode(rawCode);
    if (!isValidRoomCode(code)) {
      return { success: false, error: 'Invalid room code.', code: 'INVALID_ROOM_CODE' };
    }

    const db = getFirebaseDb();
    const playerId = joiningUser.id || `usr_${Date.now()}`;
    const now = Date.now();

    if (db) {
      try {
        const roomRef = doc(db, 'rooms', code);
        const result = await runTransaction(db, async (transaction) => {
          const snap = await transaction.get(roomRef);
          if (!snap.exists()) {
            throw new Error('ROOM_NOT_FOUND');
          }

          const current = snap.data() as MultiplayerRoomState;

          if (Date.now() > current.expiresAt || current.status === 'EXPIRED') {
            throw new Error('ROOM_EXPIRED');
          }

          if (current.status === 'FINISHED' || current.status === 'CANCELLED') {
            throw new Error('ROOM_NOT_FOUND');
          }

          const existingPlayerIndex = current.players.findIndex(
            (p) => p.id === playerId || p.userId === (joiningUser.uid || joiningUser.id)
          );

          let updatedPlayers = [...current.players];

          if (existingPlayerIndex >= 0) {
            // Player reconnecting / refresh
            updatedPlayers[existingPlayerIndex] = {
              ...updatedPlayers[existingPlayerIndex],
              connectionStatus: 'CONNECTED',
              lastSeenAt: now
            };
          } else {
            // New player joining
            if (current.players.length >= current.maxPlayers) {
              throw new Error('ROOM_FULL');
            }

            const newPlayer: RoomPlayer = {
              id: playerId,
              userId: joiningUser.uid || joiningUser.id || playerId,
              username: joiningUser.username || joiningUser.displayName || `Player ${current.players.length + 1}`,
              displayName: joiningUser.displayName || joiningUser.username || `Player ${current.players.length + 1}`,
              avatar: joiningUser.avatar || '🎮',
              role: 'player',
              isHost: false,
              isReady: true,
              connectionStatus: 'CONNECTED',
              score: 0,
              joinedAt: now,
              lastSeenAt: now
            };

            updatedPlayers.push(newPlayer);
          }

          const isReady = updatedPlayers.length >= current.minPlayers;
          const updatedStatus: RoomStatus =
            current.status === 'WAITING' && isReady ? 'READY' : current.status;

          const updatedRoom: MultiplayerRoomState = {
            ...current,
            players: updatedPlayers,
            status: updatedStatus,
            stateVersion: current.stateVersion + 1,
            updatedAt: now
          };

          const cleaned = cleanForFirestore(updatedRoom);
          transaction.set(roomRef, cleaned);
          return cleaned;
        });

        memoryRooms.set(code, result);
        notifyMemoryListeners(result);
        return { success: true, data: result };
      } catch (txErr: any) {
        if (txErr.message === 'ROOM_NOT_FOUND') {
          return { success: false, error: 'Room not found.', code: 'ROOM_NOT_FOUND' };
        }
        if (txErr.message === 'ROOM_FULL') {
          return { success: false, error: 'Room is already full.', code: 'ROOM_FULL' };
        }
        if (txErr.message === 'ROOM_EXPIRED') {
          return { success: false, error: 'Room has expired.', code: 'ROOM_EXPIRED' };
        }
        console.warn('Transaction join failed, attempting memory join:', txErr);
      }
    }

    // Memory Fallback
    const memoryRoom = memoryRooms.get(code);
    if (!memoryRoom) {
      return { success: false, error: 'Room not found.', code: 'ROOM_NOT_FOUND' };
    }

    if (memoryRoom.players.length >= memoryRoom.maxPlayers && !memoryRoom.players.some((p) => p.id === playerId)) {
      return { success: false, error: 'Room is already full.', code: 'ROOM_FULL' };
    }

    const existingIdx = memoryRoom.players.findIndex((p) => p.id === playerId);
    let players = [...memoryRoom.players];

    if (existingIdx >= 0) {
      players[existingIdx] = { ...players[existingIdx], connectionStatus: 'CONNECTED', lastSeenAt: now };
    } else {
      players.push({
        id: playerId,
        userId: joiningUser.uid || joiningUser.id || playerId,
        username: joiningUser.username || joiningUser.displayName || `Player ${players.length + 1}`,
        displayName: joiningUser.displayName || joiningUser.username || `Player ${players.length + 1}`,
        avatar: joiningUser.avatar || '🎮',
        role: 'player',
        isHost: false,
        isReady: true,
        connectionStatus: 'CONNECTED',
        score: 0,
        joinedAt: now,
        lastSeenAt: now
      });
    }

    const updatedMemoryRoom: MultiplayerRoomState = {
      ...memoryRoom,
      players,
      status: players.length >= memoryRoom.minPlayers && memoryRoom.status === 'WAITING' ? 'READY' : memoryRoom.status,
      stateVersion: memoryRoom.stateVersion + 1,
      updatedAt: now
    };

    const cleaned = cleanForFirestore(updatedMemoryRoom);
    memoryRooms.set(code, cleaned);
    notifyMemoryListeners(cleaned);
    return { success: true, data: cleaned };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to join room.', code: 'INTERNAL_ERROR' };
  }
};

/**
 * Starts a match (Host only) with synchronized countdown.
 */
export const startMatchOnServer = async (
  rawCode: string,
  hostPlayerId: string
): Promise<MultiplayerApiResponse<MultiplayerRoomState>> => {
  try {
    const code = normalizeRoomCode(rawCode);
    const getRes = await getRoomByCode(code);
    if (!getRes.success || !getRes.data) {
      return getRes;
    }

    const room = getRes.data;
    if (room.hostId !== hostPlayerId) {
      return { success: false, error: 'Only the room host can start the game!', code: 'UNAUTHORIZED' };
    }

    const now = Date.now();
    let finalPlayers = [...room.players];

    // Smart Bot Auto-Fill: If auto-fill enabled or slots are below minPlayers, add bots
    const autoFillEnabled = room.settings.botFillMode !== 'none';
    if (autoFillEnabled && finalPlayers.length < room.maxPlayers) {
      const needed = Math.max(
        room.minPlayers - finalPlayers.length,
        room.settings.botFillMode === 'auto' ? room.maxPlayers - finalPlayers.length : 0
      );
      const botDiff: AIDifficulty = room.settings.botDifficulty || 'medium';

      for (let i = 0; i < needed; i++) {
        const botPreset = BOT_NAME_PRESETS[(finalPlayers.length + i) % BOT_NAME_PRESETS.length];
        finalPlayers.push({
          id: `bot_${Date.now()}_${i + 1}`,
          userId: `bot_${Date.now()}_${i + 1}`,
          username: `${botPreset.name} (${botDiff.toUpperCase()})`,
          displayName: `${botPreset.name} (${botDiff.toUpperCase()})`,
          avatar: botPreset.avatar,
          role: 'player',
          isHost: false,
          isReady: true,
          connectionStatus: 'CONNECTED',
          score: 0,
          joinedAt: now,
          lastSeenAt: now,
          isBot: true,
          botDifficulty: botDiff,
        });
      }
    }

    if (finalPlayers.length < room.minPlayers) {
      return {
        success: false,
        error: `Need at least ${room.minPlayers} players to start.`,
        code: 'NOT_ENOUGH_PLAYERS'
      };
    }

    const adapter = getGameAdapter(room.gameId, room.gameTitle);
    const initialGameState = adapter.getInitialState(finalPlayers, room.settings);

    const updatedRoom: MultiplayerRoomState = {
      ...room,
      players: finalPlayers,
      status: 'PLAYING',
      countdown: 0,
      gameState: initialGameState,
      currentTurnPlayerId: finalPlayers[0]?.id || null,
      winnerPlayerId: null,
      winnerUsername: null,
      stateVersion: room.stateVersion + 1,
      updatedAt: now
    };

    const cleaned = cleanForFirestore(updatedRoom);

    const db = getFirebaseDb();
    if (db) {
      try {
        await setDoc(doc(db, 'rooms', code), cleaned);
      } catch (err) {
        console.warn('Firestore setDoc start failed:', err);
      }
    }

    memoryRooms.set(code, cleaned);
    notifyMemoryListeners(cleaned);
    return { success: true, data: cleaned };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to start match.', code: 'INTERNAL_ERROR' };
  }
};

/**
 * Manually adds an AI bot to an empty slot in the lobby.
 */
export const addBotToRoomOnServer = async (
  rawCode: string,
  hostPlayerId: string,
  difficulty: AIDifficulty = 'medium'
): Promise<MultiplayerApiResponse<MultiplayerRoomState>> => {
  try {
    const code = normalizeRoomCode(rawCode);
    const getRes = await getRoomByCode(code);
    if (!getRes.success || !getRes.data) return getRes;

    const room = getRes.data;
    if (room.hostId !== hostPlayerId) {
      return { success: false, error: 'Only the room host can add bots!', code: 'UNAUTHORIZED' };
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: 'Room is already full!', code: 'ROOM_FULL' };
    }

    const now = Date.now();
    const botPreset = BOT_NAME_PRESETS[room.players.length % BOT_NAME_PRESETS.length];
    const newBot: RoomPlayer = {
      id: `bot_${now}_${Math.random().toString(36).substring(2, 6)}`,
      userId: `bot_${now}`,
      username: `${botPreset.name} (${difficulty.toUpperCase()})`,
      displayName: `${botPreset.name} (${difficulty.toUpperCase()})`,
      avatar: botPreset.avatar,
      role: 'player',
      isHost: false,
      isReady: true,
      connectionStatus: 'CONNECTED',
      score: 0,
      joinedAt: now,
      lastSeenAt: now,
      isBot: true,
      botDifficulty: difficulty,
    };

    const updatedPlayers = [...room.players, newBot];
    const updatedRoom: MultiplayerRoomState = {
      ...room,
      players: updatedPlayers,
      status: updatedPlayers.length >= room.minPlayers && room.status === 'WAITING' ? 'READY' : room.status,
      stateVersion: room.stateVersion + 1,
      updatedAt: now,
    };

    const cleaned = cleanForFirestore(updatedRoom);
    const db = getFirebaseDb();
    if (db) {
      try {
        await setDoc(doc(db, 'rooms', code), cleaned);
      } catch (err) {
        console.warn('Firestore setDoc addBot failed:', err);
      }
    }

    memoryRooms.set(code, cleaned);
    notifyMemoryListeners(cleaned);
    return { success: true, data: cleaned };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add bot.', code: 'INTERNAL_ERROR' };
  }
};

/**
 * Removes a player or bot from the lobby (Host only).
 */
export const removePlayerOrBotFromServer = async (
  rawCode: string,
  hostPlayerId: string,
  targetPlayerId: string
): Promise<MultiplayerApiResponse<MultiplayerRoomState>> => {
  try {
    const code = normalizeRoomCode(rawCode);
    const getRes = await getRoomByCode(code);
    if (!getRes.success || !getRes.data) return getRes;

    const room = getRes.data;
    if (room.hostId !== hostPlayerId && hostPlayerId !== targetPlayerId) {
      return { success: false, error: 'Unauthorized to remove player.', code: 'UNAUTHORIZED' };
    }

    const updatedPlayers = room.players.filter((p) => p.id !== targetPlayerId);
    const now = Date.now();

    const updatedRoom: MultiplayerRoomState = {
      ...room,
      players: updatedPlayers,
      status: updatedPlayers.length >= room.minPlayers ? 'READY' : 'WAITING',
      stateVersion: room.stateVersion + 1,
      updatedAt: now,
    };

    const cleaned = cleanForFirestore(updatedRoom);
    const db = getFirebaseDb();
    if (db) {
      try {
        await setDoc(doc(db, 'rooms', code), cleaned);
      } catch (err) {
        console.warn('Firestore setDoc removePlayer failed:', err);
      }
    }

    memoryRooms.set(code, cleaned);
    notifyMemoryListeners(cleaned);
    return { success: true, data: cleaned };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove player.', code: 'INTERNAL_ERROR' };
  }
};

/**
 * Submits an authoritative gameplay action validated through the game adapter.
 */
export const submitPlayerActionOnServer = async (
  rawCode: string,
  payload: PlayerActionPayload
): Promise<MultiplayerApiResponse<MultiplayerRoomState>> => {
  try {
    const code = normalizeRoomCode(rawCode);
    const getRes = await getRoomByCode(code);
    if (!getRes.success || !getRes.data) {
      return getRes;
    }

    const room = getRes.data;
    if (room.status !== 'PLAYING') {
      return { success: false, error: 'Game is not currently active.', code: 'GAME_ALREADY_STARTED' };
    }

    // Stale state version rejection
    if (payload.expectedVersion && payload.expectedVersion < room.stateVersion) {
      console.warn(`Stale action rejected: client=${payload.expectedVersion}, server=${room.stateVersion}`);
      return { success: true, data: room }; // Return latest authoritative state
    }

    const adapter = getGameAdapter(room.gameId, room.gameTitle);
    const actionObj = { type: payload.actionType, ...payload.actionData };

    const validation = adapter.validateAction(
      room.gameState,
      actionObj,
      payload.playerId,
      room.currentTurnPlayerId,
      room.players
    );

    if (!validation.valid) {
      return { success: false, error: validation.error || 'Invalid move submitted.', code: 'INVALID_MOVE' };
    }

    const result = adapter.applyAction(room.gameState, actionObj, payload.playerId, room.players);
    const now = Date.now();

    const updatedRoom: MultiplayerRoomState = {
      ...room,
      gameState: result.nextState,
      currentTurnPlayerId: result.nextTurn || null,
      winnerPlayerId: result.winnerId || null,
      winnerUsername: result.winnerUsername || (result.winnerId ? room.players.find((p) => p.id === result.winnerId)?.username : null) || null,
      status: result.isFinished ? 'FINISHED' : 'PLAYING',
      stateVersion: room.stateVersion + 1,
      updatedAt: now
    };

    const cleaned = cleanForFirestore(updatedRoom);

    const db = getFirebaseDb();
    if (db) {
      try {
        await setDoc(doc(db, 'rooms', code), cleaned);
      } catch (err) {
        console.warn('Firestore action setDoc failed:', err);
      }
    }

    memoryRooms.set(code, cleaned);
    notifyMemoryListeners(cleaned);
    return { success: true, data: cleaned };
  } catch (error: any) {
    return { success: false, error: error.message || 'Action execution error.', code: 'INTERNAL_ERROR' };
  }
};

/**
 * Removes a player from a room or handles host reassignment / room closure.
 */
export const leaveRoomOnServer = async (
  rawCode: string,
  playerId: string
): Promise<MultiplayerApiResponse<MultiplayerRoomState | null>> => {
  try {
    const code = normalizeRoomCode(rawCode);
    const getRes = await getRoomByCode(code);
    if (!getRes.success || !getRes.data) {
      return { success: true, data: null };
    }

    const room = getRes.data;
    const remainingPlayers = room.players.filter((p) => p.id !== playerId);
    const now = Date.now();

    if (remainingPlayers.length === 0) {
      // Last player left - cancel room
      const db = getFirebaseDb();
      if (db) {
        try {
          await deleteDoc(doc(db, 'rooms', code));
        } catch {}
      }
      memoryRooms.delete(code);
      return { success: true, data: null };
    }

    // If host left, transfer host role
    let newHostId = room.hostId;
    let newHostUsername = room.hostUsername;
    if (room.hostId === playerId && remainingPlayers.length > 0) {
      remainingPlayers[0].isHost = true;
      remainingPlayers[0].role = 'host';
      newHostId = remainingPlayers[0].id;
      newHostUsername = remainingPlayers[0].username;
    }

    const updatedRoom: MultiplayerRoomState = {
      ...room,
      players: remainingPlayers,
      hostId: newHostId,
      hostUsername: newHostUsername,
      status: remainingPlayers.length < room.minPlayers && room.status === 'READY' ? 'WAITING' : room.status,
      stateVersion: room.stateVersion + 1,
      updatedAt: now
    };

    const cleaned = cleanForFirestore(updatedRoom);

    const db = getFirebaseDb();
    if (db) {
      try {
        await setDoc(doc(db, 'rooms', code), cleaned);
      } catch (err) {
        console.warn('Firestore leave update failed:', err);
      }
    }

    memoryRooms.set(code, cleaned);
    notifyMemoryListeners(cleaned);
    return { success: true, data: cleaned };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error leaving room.' };
  }
};

/**
 * Subscribes to real-time room updates via Firestore onSnapshot + HTTP polling fallback.
 */
export const subscribeToRoomUpdates = (
  rawCode: string,
  onUpdate: (room: MultiplayerRoomState) => void,
  onError?: (error: any) => void
): (() => void) => {
  const code = normalizeRoomCode(rawCode);
  const db = getFirebaseDb();

  // Register in memory listener
  if (!memoryListeners.has(code)) {
    memoryListeners.set(code, new Set());
  }
  const setRef = memoryListeners.get(code)!;
  setRef.add(onUpdate);

  // If room already in memory, emit immediately
  const cached = memoryRooms.get(code);
  if (cached) onUpdate(cached);

  let unsubscribeFirestore: (() => void) | null = null;
  let pollingInterval: NodeJS.Timeout | null = null;

  if (db) {
    try {
      const roomRef = doc(db, 'rooms', code);
      unsubscribeFirestore = onSnapshot(
        roomRef,
        (snapshot: DocumentSnapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as MultiplayerRoomState;
            memoryRooms.set(code, data);
            onUpdate(data);
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot warning (activating polling fallback):', error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Firestore onSnapshot init note:', err);
    }
  }

  // Backup HTTP polling to guarantee real-time synchronization
  pollingInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          memoryRooms.set(code, json.data);
          onUpdate(json.data);
        }
      }
    } catch {}
  }, 2500);

  return () => {
    setRef.delete(onUpdate);
    if (setRef.size === 0) memoryListeners.delete(code);
    if (unsubscribeFirestore) unsubscribeFirestore();
    if (pollingInterval) clearInterval(pollingInterval);
  };
};

/**
 * Presence heartbeat to keep player connection active.
 */
export const sendPlayerHeartbeat = async (rawCode: string, playerId: string): Promise<void> => {
  const code = normalizeRoomCode(rawCode);
  const db = getFirebaseDb();
  const now = Date.now();

  const memRoom = memoryRooms.get(code);
  if (memRoom) {
    const pIdx = memRoom.players.findIndex((p) => p.id === playerId);
    if (pIdx >= 0) {
      memRoom.players[pIdx].lastSeenAt = now;
      memRoom.players[pIdx].connectionStatus = 'CONNECTED';
    }
  }

  if (db) {
    try {
      const roomRef = doc(db, 'rooms', code);
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        const data = snap.data() as MultiplayerRoomState;
        const pIdx = data.players.findIndex((p) => p.id === playerId);
        if (pIdx >= 0) {
          data.players[pIdx].lastSeenAt = now;
          data.players[pIdx].connectionStatus = 'CONNECTED';
          await updateDoc(roomRef, {
            players: cleanForFirestore(data.players),
            updatedAt: now
          });
        }
      }
    } catch {
      // ignore
    }
  }
};
