'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerSetup, AIDifficulty } from '@/types/gameMode';
import { soundFx } from '@/lib/audio';

export interface TurnEnginePlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  botDifficulty?: AIDifficulty;
  score: number;
  teamId?: string;
  isEliminated: boolean;
  isReady: boolean;
  customData: Record<string, any>;
}

export interface UsePlayerTurnManagerOptions {
  initialPlayers: PlayerSetup[];
  turnTimeoutSec?: number;
  autoBotDelayMs?: number; // Delay before bot executes turn (defaults to 1200ms)
  onBotTurn?: (activePlayer: TurnEnginePlayer, turnIndex: number) => Promise<void> | void;
  onTurnChange?: (newPlayer: TurnEnginePlayer, prevPlayer: TurnEnginePlayer) => void;
  onTurnTimeout?: (timedOutPlayer: TurnEnginePlayer) => void;
  onRoundComplete?: (round: number) => void;
}

export function usePlayerTurnManager({
  initialPlayers,
  turnTimeoutSec,
  autoBotDelayMs = 1200,
  onBotTurn,
  onTurnChange,
  onTurnTimeout,
  onRoundComplete,
}: UsePlayerTurnManagerOptions) {
  const [players, setPlayers] = useState<TurnEnginePlayer[]>(() =>
    initialPlayers.map((p, idx) => ({
      id: p.id || `p_${idx}`,
      name: p.name || `Player ${idx + 1}`,
      avatar: p.avatar || '🎮',
      isBot: Boolean(p.isAI),
      botDifficulty: p.aiDifficulty || 'medium',
      score: p.score || 0,
      teamId: p.teamId,
      isEliminated: Boolean(p.isEliminated),
      isReady: true,
      customData: {},
    }))
  );

  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [turnCount, setTurnCount] = useState<number>(1);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [isTurnLocked, setIsTurnLocked] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Turn Timer
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(turnTimeoutSec || 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const botTurnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activePlayer = players[activePlayerIndex] || players[0];
  const isBotTurn = Boolean(activePlayer?.isBot);

  // Reset players if initialPlayers change meaningfully
  const resetPlayers = useCallback((newSetup: PlayerSetup[]) => {
    setPlayers(
      newSetup.map((p, idx) => ({
        id: p.id || `p_${idx}`,
        name: p.name || `Player ${idx + 1}`,
        avatar: p.avatar || '🎮',
        isBot: Boolean(p.isAI),
        botDifficulty: p.aiDifficulty || 'medium',
        score: p.score || 0,
        teamId: p.teamId,
        isEliminated: Boolean(p.isEliminated),
        isReady: true,
        customData: {},
      }))
    );
    setActivePlayerIndex(0);
    setTurnCount(1);
    setRoundNumber(1);
    setIsTurnLocked(false);
  }, []);

  // Find next active player skipping eliminated players
  const getNextActiveIndex = useCallback(
    (fromIndex: number, currentPlayersList = players): { nextIndex: number; newRound: boolean } => {
      const total = currentPlayersList.length;
      if (total <= 1) return { nextIndex: 0, newRound: false };

      let next = (fromIndex + 1) % total;
      let loopCheck = 0;
      let wrapped = next <= fromIndex;

      while (currentPlayersList[next]?.isEliminated && loopCheck < total) {
        next = (next + 1) % total;
        if (next === 0) wrapped = true;
        loopCheck++;
      }

      return { nextIndex: next, newRound: wrapped };
    },
    [players]
  );

  // Advance turn to next valid player
  const advanceTurn = useCallback(
    (options?: { extraTurn?: boolean; nextIndex?: number }) => {
      if (botTurnTimeoutRef.current) {
        clearTimeout(botTurnTimeoutRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      setIsTurnLocked(false);

      if (options?.extraTurn) {
        // Player gets another turn (e.g. bonus roll/extra ball)
        setTurnCount((prev) => prev + 1);
        if (turnTimeoutSec) setTurnTimeLeft(turnTimeoutSec);
        return;
      }

      if (typeof options?.nextIndex === 'number') {
        const target = options.nextIndex;
        const prevPlayer = players[activePlayerIndex];
        setActivePlayerIndex(target);
        setTurnCount((prev) => prev + 1);
        if (turnTimeoutSec) setTurnTimeLeft(turnTimeoutSec);
        if (onTurnChange) onTurnChange(players[target], prevPlayer);
        return;
      }

      const { nextIndex, newRound } = getNextActiveIndex(activePlayerIndex);
      const prevP = players[activePlayerIndex];

      if (newRound) {
        setRoundNumber((r) => {
          const nextR = r + 1;
          if (onRoundComplete) onRoundComplete(nextR);
          return nextR;
        });
      }

      setActivePlayerIndex(nextIndex);
      setTurnCount((t) => t + 1);
      if (turnTimeoutSec) setTurnTimeLeft(turnTimeoutSec);
      if (onTurnChange) onTurnChange(players[nextIndex], prevP);
    },
    [activePlayerIndex, players, getNextActiveIndex, onTurnChange, onRoundComplete, turnTimeoutSec]
  );

  // Eliminate player
  const eliminatePlayer = useCallback(
    (playerId: string) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, isEliminated: true } : p))
      );
    },
    []
  );

  // Set individual player score
  const setPlayerScore = useCallback(
    (playerId: string, scoreUpdate: number | ((prev: number) => number)) => {
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === playerId) {
            const nextScore = typeof scoreUpdate === 'function' ? scoreUpdate(p.score) : scoreUpdate;
            return { ...p, score: nextScore };
          }
          return p;
        })
      );
    },
    []
  );

  // Add points to player
  const addPlayerScore = useCallback((playerId: string, points: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, score: p.score + points } : p))
    );
  }, []);

  // Automatic Bot Turn Execution
  useEffect(() => {
    if (isPaused || !activePlayer || !activePlayer.isBot || activePlayer.isEliminated) {
      return;
    }

    setIsTurnLocked(true);

    // Calculate dynamic thinking delay based on bot difficulty
    let delay = autoBotDelayMs;
    if (activePlayer.botDifficulty === 'hard') {
      delay = Math.floor(autoBotDelayMs * 0.7); // Fast, decisive
    } else if (activePlayer.botDifficulty === 'easy') {
      delay = Math.floor(autoBotDelayMs * 1.3); // Casual, slower
    }

    botTurnTimeoutRef.current = setTimeout(async () => {
      if (onBotTurn) {
        try {
          await onBotTurn(activePlayer, turnCount);
        } catch (err) {
          console.error('Error executing bot turn:', err);
        } finally {
          setIsTurnLocked(false);
        }
      }
    }, delay);

    return () => {
      if (botTurnTimeoutRef.current) {
        clearTimeout(botTurnTimeoutRef.current);
      }
    };
  }, [activePlayerIndex, isBotTurn, turnCount, isPaused, autoBotDelayMs, onBotTurn]);

  // Turn Timeout countdown
  useEffect(() => {
    if (isPaused || !turnTimeoutSec || isBotTurn) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTurnTimeLeft(turnTimeoutSec);

    timerRef.current = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (onTurnTimeout && activePlayer) {
            onTurnTimeout(activePlayer);
          }
          advanceTurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activePlayerIndex, isPaused, turnTimeoutSec, isBotTurn]);

  return {
    players,
    activePlayerIndex,
    activePlayer,
    isBotTurn,
    isTurnLocked,
    turnCount,
    roundNumber,
    turnTimeLeft,
    advanceTurn,
    eliminatePlayer,
    setPlayerScore,
    addPlayerScore,
    resetPlayers,
    lockTurn: setIsTurnLocked,
    pauseTurns: () => setIsPaused(true),
    resumeTurns: () => setIsPaused(false),
  };
}
