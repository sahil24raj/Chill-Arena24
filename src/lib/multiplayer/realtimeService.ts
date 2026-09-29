/**
 * Chill Arena - Real-time Authoritative Multiplayer Service
 * Powered by Firebase Firestore realtime listeners, atomic transactions, and GameAdapters.
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

const ROOM_EXPIRATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 mins
const DISCONNECT_GRACE_PERIOD_MS = 30 * 1000; // 30 sec reconnection window

// In-memory fallback store for offline / local simulation when Firebase is unreachable
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

    // Check collision in Firestore
    if (db) {
      try {
        let attempts = 0;
        while (attempts < 5) {
          const checkDoc = await getDoc(doc(db, 'rooms', roomCode));
          if (!checkDoc.exists()) break;
          roomCode = generateRoomCode(6);
          attempts++;
        }
      } catch (e) {
        console.warn('Firestore room check notice (continuing):', e);
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

    if (db) {
      try {
        await setDoc(doc(db, 'rooms', roomCode), newRoom);
      } catch (err) {
        console.warn('Firestore setDoc failed, saving to memory fallback:', err);
        memoryRooms.set(roomCode, newRoom);
      }
    } else {
      memoryRooms.set(roomCode, newRoom);
    }

    notifyMemoryListeners(newRoom);
    return { success: true, data: newRoom };
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
        const snap = await getDoc(doc(db, 'rooms', code));
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
            // Player reconnecting
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

          transaction.set(roomRef, updatedRoom);
          return updatedRoom;
        });

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

    memoryRooms.set(code, updatedMemoryRoom);
    notifyMemoryListeners(updatedMemoryRoom);
    return { success: true, data: updatedMemoryRoom };
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

    if (room.players.length < room.minPlayers) {
      return {
        success: false,
        error: `Need at least ${room.minPlayers} players to start.`,
        code: 'NOT_ENOUGH_PLAYERS'
      };
    }

    const adapter = getGameAdapter(room.gameId, room.gameTitle);
    const initialGameState = adapter.getInitialState(room.players, room.settings);
    const now = Date.now();

    const updatedRoom: MultiplayerRoomState = {
      ...room,
      status: 'PLAYING',
      countdown: 0,
      gameState: initialGameState,
      currentTurnPlayerId: room.players[0]?.id || null,
      winnerPlayerId: null,
      winnerUsername: null,
      stateVersion: room.stateVersion + 1,
      updatedAt: now
    };

    const db = getFirebaseDb();
    if (db) {
      try {
        await updateDoc(doc(db, 'rooms', code), {
          status: 'PLAYING',
          countdown: 0,
          gameState: initialGameState,
          currentTurnPlayerId: room.players[0]?.id || null,
          winnerPlayerId: null,
          winnerUsername: null,
          stateVersion: room.stateVersion + 1,
          updatedAt: now
        });
      } catch (err) {
        console.warn('Firestore updateDoc start failed:', err);
      }
    }

    memoryRooms.set(code, updatedRoom);
    notifyMemoryListeners(updatedRoom);
    return { success: true, data: updatedRoom };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to start match.', code: 'INTERNAL_ERROR' };
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
      currentTurnPlayerId: result.nextTurn,
      winnerPlayerId: result.winnerId,
      winnerUsername: result.winnerUsername || (result.winnerId ? room.players.find((p) => p.id === result.winnerId)?.username : null),
      status: result.isFinished ? 'FINISHED' : 'PLAYING',
      stateVersion: room.stateVersion + 1,
      updatedAt: now
    };

    const db = getFirebaseDb();
    if (db) {
      try {
        await updateDoc(doc(db, 'rooms', code), {
          gameState: result.nextState,
          currentTurnPlayerId: result.nextTurn,
          winnerPlayerId: result.winnerId,
          winnerUsername: updatedRoom.winnerUsername,
          status: result.isFinished ? 'FINISHED' : 'PLAYING',
          stateVersion: room.stateVersion + 1,
          updatedAt: now
        });
      } catch (err) {
        console.warn('Firestore action update failed:', err);
      }
    }

    memoryRooms.set(code, updatedRoom);
    notifyMemoryListeners(updatedRoom);
    return { success: true, data: updatedRoom };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to submit move.', code: 'INTERNAL_ERROR' };
  }
};

/**
 * Leaves a multiplayer room, with automatic host reassignment.
 */
export const leaveRoomOnServer = async (
  rawCode: string,
  playerId: string
): Promise<MultiplayerApiResponse<MultiplayerRoomState | null>> => {
  try {
    const code = normalizeRoomCode(rawCode);
    const getRes = await getRoomByCode(code);
    if (!getRes.success || !getRes.data) return { success: true, data: null };

    const room = getRes.data;
    const remainingPlayers = room.players.filter((p) => p.id !== playerId);
    const now = Date.now();

    if (remainingPlayers.length === 0) {
      // Room closed
      const db = getFirebaseDb();
      if (db) {
        try {
          await deleteDoc(doc(db, 'rooms', code));
        } catch {
          // ignore
        }
      }
      memoryRooms.delete(code);
      return { success: true, data: null };
    }

    let newHostId = room.hostId;
    let newHostUsername = room.hostUsername;

    if (room.hostId === playerId) {
      // Host reassignment to next connected player
      const nextHost = remainingPlayers[0];
      nextHost.isHost = true;
      nextHost.role = 'host';
      newHostId = nextHost.id;
      newHostUsername = nextHost.username;
    }

    const updatedRoom: MultiplayerRoomState = {
      ...room,
      players: remainingPlayers,
      hostId: newHostId,
      hostUsername: newHostUsername,
      status: room.status === 'PLAYING' ? 'FINISHED' : remainingPlayers.length >= room.minPlayers ? 'READY' : 'WAITING',
      winnerPlayerId: room.status === 'PLAYING' ? remainingPlayers[0].id : room.winnerPlayerId,
      stateVersion: room.stateVersion + 1,
      updatedAt: now
    };

    const db = getFirebaseDb();
    if (db) {
      try {
        await setDoc(doc(db, 'rooms', code), updatedRoom);
      } catch (err) {
        console.warn('Firestore leave update failed:', err);
      }
    }

    memoryRooms.set(code, updatedRoom);
    notifyMemoryListeners(updatedRoom);
    return { success: true, data: updatedRoom };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error leaving room.' };
  }
};

/**
 * Subscribes to real-time room updates via Firestore onSnapshot with fallback.
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
          } else {
            // Room was deleted
            const memoryVal = memoryRooms.get(code);
            if (memoryVal) {
              onUpdate(memoryVal);
            }
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot warning (using realtime fallback):', error);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('Firestore onSnapshot initialization notice:', err);
    }
  }

  return () => {
    setRef.delete(onUpdate);
    if (setRef.size === 0) memoryListeners.delete(code);
    if (unsubscribeFirestore) unsubscribeFirestore();
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
            players: data.players,
            updatedAt: now
          });
        }
      }
    } catch {
      // ignore
    }
  }
};
