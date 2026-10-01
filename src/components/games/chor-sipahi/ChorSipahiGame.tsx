'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import {
  GameRoomState,
  Player,
  ChorSipahiRole,
  ChatMessage,
  RoundResult
} from './chorSipahiTypes';
import {
  generateRoomCode,
  shuffleRoles,
  calculateRoundScores,
  getMaskedGameState,
  BOT_NAMES,
  getBotChatMessage
} from './chorSipahiEngine';
import { GameLobby } from './GameLobby';
import { RoleReveal } from './RoleReveal';
import { DiscussionPhase } from './DiscussionPhase';
import { SipahiGuess } from './SipahiGuess';
import { ResultReveal } from './ResultReveal';
import { soundFx } from '@/lib/audio';
import { GameFullscreenShell } from '@/components/game-shell/GameFullscreenShell';

export const ChorSipahiGame: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room');
  const { user, submitGameScore, addCoins, addXP } = useAppStore();

  const [gameState, setGameState] = useState<GameRoomState>(() => {
    const defaultCode = roomParam ? roomParam.toUpperCase() : generateRoomCode();
    const myPlayer: Player = {
      id: user.uid || `usr_${Date.now()}`,
      name: user.displayName || user.username || 'Sherlock',
      avatar: user.avatar || '👑',
      isHost: true,
      isBot: false,
      isReady: false,
      roundScore: 0,
      totalScore: 0,
      stats: {
        roundsPlayed: 0,
        timesRaja: 0,
        timesMantri: 0,
        timesSipahi: 0,
        timesChor: 0,
        correctGuesses: 0,
        wrongGuesses: 0,
        escapesAsChor: 0
      }
    };

    return {
      roomCode: defaultCode,
      roomName: `Chor Sipahi Room #${defaultCode}`,
      isPrivate: false,
      phase: 'lobby',
      roundNumber: 1,
      maxRounds: 5,
      timeRemaining: 60,
      players: [myPlayer],
      hostId: myPlayer.id,
      history: [],
      chatMessages: [
        {
          id: 'sys-1',
          playerId: 'system',
          playerName: 'Court Herald',
          avatar: '📜',
          text: 'Welcome to the Chor Sipahi Royal Court! Assemble 4 players to draw chits.',
          timestamp: Date.now(),
          isSystem: true
        }
      ]
    };
  });

  const currentPlayer = gameState.players.find((p) => !p.isBot) || gameState.players[0];

  // Auto-fill bots if user starts single-player or wants quick match
  const handleAddBot = () => {
    if (gameState.players.length >= 4) return;
    soundFx.playClick();

    const usedNames = new Set(gameState.players.map((p) => p.name));
    const availableBots = BOT_NAMES.filter((b) => !usedNames.has(b.name));
    const botChoice = availableBots.length > 0
      ? availableBots[Math.floor(Math.random() * availableBots.length)]
      : { name: `Bot ${gameState.players.length + 1}`, avatar: '🤖' };

    const newBot: Player = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: botChoice.name,
      avatar: botChoice.avatar,
      isHost: false,
      isBot: true,
      isReady: true,
      roundScore: 0,
      totalScore: 0,
      stats: {
        roundsPlayed: 0,
        timesRaja: 0,
        timesMantri: 0,
        timesSipahi: 0,
        timesChor: 0,
        correctGuesses: 0,
        wrongGuesses: 0,
        escapesAsChor: 0
      }
    };

    setGameState((prev) => ({
      ...prev,
      players: [...prev.players, newBot]
    }));
  };

  const handleToggleReady = () => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === currentPlayer.id ? { ...p, isReady: !p.isReady } : p
      )
    }));
  };

  // Start the Game: Shuffle roles & transition to Role Reveal
  const handleStartGame = () => {
    if (gameState.players.length !== 4) return;
    soundFx.playLevelUp();

    const shuffled = shuffleRoles(gameState.players, gameState.history);
    const raja = shuffled.find((p) => p.role === 'raja');
    const sipahi = shuffled.find((p) => p.role === 'sipahi');

    const startMsg: ChatMessage = {
      id: `sys_start_${Date.now()}`,
      playerId: 'system',
      playerName: 'Court Herald',
      avatar: '👑',
      text: `👑 Royal Court has commenced! ${raja?.name} is the RAJA of Round ${gameState.roundNumber}.`,
      timestamp: Date.now(),
      isSystem: true
    };

    setGameState((prev) => ({
      ...prev,
      phase: 'role_reveal',
      players: shuffled,
      activeRajaId: raja?.id,
      activeSipahiId: sipahi?.id,
      chatMessages: [...prev.chatMessages, startMsg]
    }));
  };

  // Chat message sending
  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      avatar: currentPlayer.avatar,
      text,
      timestamp: Date.now()
    };

    setGameState((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, newMsg]
    }));
  };

  // Automated Bot Banter during Discussion Phase
  useEffect(() => {
    if (gameState.phase !== 'discussion') return;

    const botPlayers = gameState.players.filter((p) => p.isBot);
    if (botPlayers.length === 0) return;

    const interval = setInterval(() => {
      const randomBot = botPlayers[Math.floor(Math.random() * botPlayers.length)];
      if (!randomBot) return;

      const botBanter = getBotChatMessage(randomBot);
      const botMsg: ChatMessage = {
        id: `bot_msg_${Date.now()}`,
        playerId: randomBot.id,
        playerName: randomBot.name,
        avatar: randomBot.avatar,
        text: botBanter,
        timestamp: Date.now()
      };

      setGameState((prev) => ({
        ...prev,
        chatMessages: [...prev.chatMessages, botMsg]
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, [gameState.phase, gameState.players]);

  // Automated Bot Sipahi Guess during Interrogation Phase
  useEffect(() => {
    if (gameState.phase !== 'sipahi_guess') return;

    const sipahi = gameState.players.find((p) => p.id === gameState.activeSipahiId);
    if (!sipahi?.isBot) return;

    // Bot takes 4-7 seconds to deliberate
    const timer = setTimeout(() => {
      const candidates = gameState.players.filter((p) => p.id !== sipahi.id);
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      if (target) {
        handleSubmitGuess(target.id);
      }
    }, 5500);

    return () => clearTimeout(timer);
  }, [gameState.phase, gameState.activeSipahiId, gameState.players]);

  // Submit Sipahi Guess
  const handleSubmitGuess = (suspectPlayerId: string) => {
    const sipahi = gameState.players.find((p) => p.role === 'sipahi') || gameState.players[0];
    const chor = gameState.players.find((p) => p.role === 'chor') || gameState.players[3];
    const raja = gameState.players.find((p) => p.role === 'raja') || gameState.players[0];
    const mantri = gameState.players.find((p) => p.role === 'mantri') || gameState.players[1];

    const { updatedPlayers, isCorrect } = calculateRoundScores(
      gameState.players,
      suspectPlayerId,
      sipahi,
      chor
    );

    const result: RoundResult = {
      roundNumber: gameState.roundNumber,
      rajaId: raja.id,
      mantriId: mantri.id,
      sipahiId: sipahi.id,
      chorId: chor.id,
      guessedPlayerId: suspectPlayerId,
      isCorrectGuess: isCorrect,
      scores: updatedPlayers.reduce((acc, p) => ({ ...acc, [p.id]: p.roundScore }), {}),
      timestamp: Date.now()
    };

    // Add user score to global store
    const me = updatedPlayers.find((p) => p.id === currentPlayer.id);
    if (me) {
      submitGameScore('chor-sipahi', me.roundScore, isCorrect);
      addCoins(Math.floor(me.roundScore / 10));
      addXP(Math.floor(me.roundScore / 5));
    }

    const resultMsg: ChatMessage = {
      id: `sys_result_${Date.now()}`,
      playerId: 'system',
      playerName: 'Court Herald',
      avatar: isCorrect ? '🚨' : '💨',
      text: isCorrect
        ? `🎉 Sipahi ${sipahi.name} correctly arrested Chor ${chor.name}!`
        : `💨 Sipahi made a false arrest! Chor ${chor.name} escaped with the loot!`,
      timestamp: Date.now(),
      isSystem: true
    };

    setGameState((prev) => ({
      ...prev,
      phase: 'result_reveal',
      players: updatedPlayers,
      lastRoundResult: result,
      history: [...prev.history, result],
      chatMessages: [...prev.chatMessages, resultMsg]
    }));
  };

  // Next Round Trigger
  const handleNextRound = () => {
    soundFx.playClick();
    const nextRoundNum = gameState.roundNumber + 1;
    const shuffled = shuffleRoles(gameState.players, gameState.history);
    const raja = shuffled.find((p) => p.role === 'raja');
    const sipahi = shuffled.find((p) => p.role === 'sipahi');

    const nextRoundMsg: ChatMessage = {
      id: `sys_next_${Date.now()}`,
      playerId: 'system',
      playerName: 'Court Herald',
      avatar: '📜',
      text: `🎲 ROUND ${nextRoundNum} STARTED! Chits have been folded and shuffled.`,
      timestamp: Date.now(),
      isSystem: true
    };

    setGameState((prev) => ({
      ...prev,
      phase: 'role_reveal',
      roundNumber: nextRoundNum,
      players: shuffled,
      activeRajaId: raja?.id,
      activeSipahiId: sipahi?.id,
      chatMessages: [...prev.chatMessages, nextRoundMsg]
    }));
  };

  const handleLeaveRoom = () => {
    soundFx.playClick();
    router.push('/multiplayer');
  };

  const clientSafeState = getMaskedGameState(gameState, currentPlayer.id);
  const rajaPlayer = clientSafeState.players.find((p) => p.id === clientSafeState.activeRajaId);
  const sipahiPlayer = gameState.players.find((p) => p.id === gameState.activeSipahiId) || gameState.players[0];

  return (
    <GameFullscreenShell
      gameId="chor-sipahi"
      gameTitle="Chor Sipahi: Royal Court"
      category="Social Deduction"
      score={currentPlayer.totalScore}
    >
      <div className="w-full min-h-[560px] h-full flex flex-col justify-center overflow-y-auto p-2 sm:p-4">
        {clientSafeState.phase === 'lobby' && (
          <GameLobby
            roomCode={clientSafeState.roomCode}
            players={clientSafeState.players}
            currentPlayer={currentPlayer}
            onAddBot={handleAddBot}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {clientSafeState.phase === 'role_reveal' && (
          <RoleReveal
            currentPlayer={currentPlayer}
            rajaPlayer={rajaPlayer}
            onContinue={() => {
              soundFx.playClick();
              setGameState((prev) => ({ ...prev, phase: 'discussion' }));
            }}
          />
        )}

        {clientSafeState.phase === 'discussion' && (
          <DiscussionPhase
            players={clientSafeState.players}
            currentPlayer={currentPlayer}
            rajaPlayer={rajaPlayer}
            chatMessages={clientSafeState.chatMessages}
            onSendMessage={handleSendMessage}
            onProceedToGuess={() => {
              soundFx.playClick();
              setGameState((prev) => ({ ...prev, phase: 'sipahi_guess' }));
            }}
          />
        )}

        {clientSafeState.phase === 'sipahi_guess' && (
          <SipahiGuess
            players={clientSafeState.players}
            currentPlayer={currentPlayer}
            sipahiPlayer={sipahiPlayer}
            rajaPlayer={rajaPlayer}
            onSubmitGuess={handleSubmitGuess}
          />
        )}

        {clientSafeState.phase === 'result_reveal' && gameState.lastRoundResult && (
          <ResultReveal
            players={gameState.players}
            lastResult={gameState.lastRoundResult}
            currentPlayer={currentPlayer}
            onNextRound={handleNextRound}
            onLeaveRoom={handleLeaveRoom}
          />
        )}
      </div>
    </GameFullscreenShell>
  );
};
