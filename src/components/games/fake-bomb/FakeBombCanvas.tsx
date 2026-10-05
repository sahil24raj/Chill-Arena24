'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CHAOS_SYMBOLS,
  ChaosSymbol,
  FakeBombPuzzleConfig,
  ClueCard,
  PREBUILT_PUZZLES,
  getPuzzleForRound
} from '@/lib/game-engine/fakeBombPuzzles';
import {
  FakeBombPlayer,
  GamePhase,
  ChatMessage,
  DuckPopEffect,
  RoundScoreBreakdown
} from './fakeBombTypes';
import { soundFx } from '@/lib/audio';
import { useAppStore } from '@/store/useAppStore';
import confetti from 'canvas-confetti';
import {
  Shield,
  Clock,
  Trophy,
  Users,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Copy,
  Check,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Bot,
  UserCheck,
  Zap,
  Radio
} from 'lucide-react';

interface FakeBombCanvasProps {
  onGameEnd?: (score: number) => void;
  roomCode?: string;
  isMultiplayerSession?: boolean;
}

const AI_BOT_TEMPLATES = [
  { name: 'CosmicCat', avatar: '🐱', tag: 'Fast Thinker' },
  { name: 'PizzaLord', avatar: '🍕', tag: 'Chill Vibes' },
  { name: 'NeonNinja', avatar: '⚡', tag: 'Detective' },
  { name: 'StarGazer', avatar: '⭐', tag: 'Curious' },
  { name: 'AlienBro', avatar: '👾', tag: 'Suspicious' }
];

export function FakeBombCanvas({
  onGameEnd,
  roomCode: initialRoomCode,
  isMultiplayerSession = false
}: FakeBombCanvasProps) {
  const { user, submitGameScore, addXP, addCoins, recordGameWin } = useAppStore();

  // Mode & Room State
  const [gameMode, setGameMode] = useState<'solo' | 'room' | 'quick'>('solo');
  const [roomCode, setRoomCode] = useState<string>(
    initialRoomCode || `CORE${Math.floor(10 + Math.random() * 90)}`
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [enableGremlin, setEnableGremlin] = useState(true);

  // Match State
  const [phase, setPhase] = useState<GamePhase>('mode_select');
  const [round, setRound] = useState(1);
  const maxRounds = 3;
  const [timeLeft, setTimeLeft] = useState(35);
  const [shields, setShields] = useState(2);
  const maxShields = 2;
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [perfectRound, setPerfectRound] = useState(true);

  // Active Puzzle & Input
  const [currentPuzzle, setCurrentPuzzle] = useState<FakeBombPuzzleConfig>(PREBUILT_PUZZLES[0]);
  const [enteredSequence, setEnteredSequence] = useState<string[]>([]);
  const [activeButtonFlash, setActiveButtonFlash] = useState<string | null>(null);

  // Players & Clues
  const [players, setPlayers] = useState<FakeBombPlayer[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string>('player-1');
  const [isClueHidden, setIsClueHidden] = useState(false);

  // Social & Fun Effects
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [duckPops, setDuckPops] = useState<DuckPopEffect[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [reactorEnergy, setReactorEnergy] = useState(100);
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);
  const [roundSummary, setRoundSummary] = useState<RoundScoreBreakdown | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiChatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load High Score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fake_bomb_high_score');
      if (saved) setHighScore(parseInt(saved, 10));
    } catch {
      // ignore
    }
  }, []);

  const saveHighScore = (newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      try {
        localStorage.setItem('fake_bomb_high_score', newScore.toString());
      } catch {
        // ignore
      }
    }
  };

  // Quack / Duck animation on wrong press
  const triggerDuckPop = (text = 'QUACK! 🦆') => {
    soundFx.playHit();
    const id = Date.now().toString() + Math.random();
    const newDuck: DuckPopEffect = {
      id,
      x: 30 + Math.random() * 40,
      y: 35 + Math.random() * 30,
      emoji: ['🦆', '🤪', '🤡', '🍕', '💣'][Math.floor(Math.random() * 5)],
      label: text
    };
    setDuckPops((prev) => [...prev, newDuck]);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    setTimeout(() => {
      setDuckPops((prev) => prev.filter((d) => d.id !== id));
    }, 1800);
  };

  // Setup Solo Players
  const initPlayers = useCallback((mode: 'solo' | 'room', gremlinActive: boolean) => {
    const human: FakeBombPlayer = {
      id: 'player-1',
      name: user.displayName || user.username || 'You (Commander)',
      avatar: user.avatar || '🚀',
      isHost: true,
      isAi: false,
      role: 'operator',
      suspicionScore: 0,
      ready: true,
      votesReceived: 0,
      tag: 'Human Pilot'
    };

    const squad: FakeBombPlayer[] = [human];
    const aiCount = mode === 'solo' ? 3 : 2; // 4 players total in solo, 3 in private room default

    for (let i = 0; i < aiCount; i++) {
      const template = AI_BOT_TEMPLATES[i % AI_BOT_TEMPLATES.length];
      squad.push({
        id: `ai-${i + 1}`,
        name: template.name,
        avatar: template.avatar,
        isHost: false,
        isAi: true,
        role: 'operator',
        suspicionScore: 0,
        ready: true,
        votesReceived: 0,
        tag: template.tag
      });
    }

    // Assign 1 secret Gremlin if enabled
    if (gremlinActive && squad.length >= 3) {
      const gremlinIndex = Math.floor(Math.random() * squad.length);
      squad[gremlinIndex].role = 'gremlin';
    }

    setPlayers(squad);
    setMyPlayerId('player-1');
  }, [user]);

  // Distribute Clues for a Round
  const assignCluesForPuzzle = useCallback(
    (puzzle: FakeBombPuzzleConfig, currentPlayers: FakeBombPlayer[]) => {
      const clues = [...puzzle.clues];
      const updated = currentPlayers.map((player, idx) => {
        let assignedClue: ClueCard;
        if (player.role === 'gremlin') {
          assignedClue = puzzle.gremlinClue;
        } else {
          assignedClue = clues[idx % clues.length] || clues[0];
        }
        return {
          ...player,
          clue: assignedClue,
          votedFor: undefined,
          votesReceived: 0
        };
      });
      setPlayers(updated);
      return updated;
    },
    []
  );

  // Start a new Round
  const startRound = useCallback(
    (roundNum: number) => {
      const difficulty = roundNum === 1 ? 'easy' : roundNum === 2 ? 'normal' : 'hard';
      const puzzle = getPuzzleForRound(roundNum, difficulty);
      setCurrentPuzzle(puzzle);
      setRound(roundNum);
      setTimeLeft(35);
      setShields(2);
      setEnteredSequence([]);
      setPerfectRound(true);
      setReactorEnergy(100);
      setSelectedVoteId(null);

      // Assign clues
      const updatedPlayers = assignCluesForPuzzle(puzzle, players);

      // System Message
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          senderId: 'system',
          senderName: 'Chaos Core AI',
          text: `🚨 ROUND ${roundNum} INITIALIZED! ${puzzle.sequence.length}-symbol sequence needed. Share your clues!`,
          timestamp: 'Now',
          isSystem: true
        }
      ]);

      setPhase('playing');
      soundFx.playLevelUp();

      // Trigger AI Clue Sharing in chat
      let delay = 2000;
      updatedPlayers.forEach((p) => {
        if (p.isAi && p.clue) {
          setTimeout(() => {
            const aiText =
              p.role === 'gremlin'
                ? `Hey squad! ${p.clue?.text} 😈`
                : `Found data: ${p.clue?.text} 💡`;
            setChatMessages((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                senderId: p.id,
                senderName: p.name,
                text: aiText,
                timestamp: 'Just now',
                isAi: true,
                badge: p.avatar
              }
            ]);
            soundFx.playFlip();
          }, delay);
          delay += 3500;
        }
      });
    },
    [assignCluesForPuzzle, players]
  );

  // Main countdown timer
  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleRoundTimeout();
          return 0;
        }
        if (prev === 10) {
          soundFx.playBuzzer();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Round Timeout Handler
  const handleRoundTimeout = () => {
    soundFx.playWrong();
    triggerDuckPop('TIME UP! CHAOS ACTIVATED! 🦆💥');
    setPhase('round_fail');
  };

  // Symbol Button Press Handler
  const handleButtonPress = (symbolId: string) => {
    if (phase !== 'playing') return;

    soundFx.playClick();
    setActiveButtonFlash(symbolId);
    setTimeout(() => setActiveButtonFlash(null), 300);

    const nextIndex = enteredSequence.length;
    const expectedSymbol = currentPuzzle.sequence[nextIndex];

    if (symbolId === expectedSymbol) {
      // Correct Symbol!
      const newSequence = [...enteredSequence, symbolId];
      setEnteredSequence(newSequence);
      soundFx.playCorrect();

      // Check if sequence is fully solved!
      if (newSequence.length === currentPuzzle.sequence.length) {
        handleRoundSuccess();
      }
    } else {
      // Wrong Symbol!
      setPerfectRound(false);
      triggerDuckPop('WRONG SYMBOL! OOPS! 🦆');
      const nextShields = shields - 1;
      setShields(nextShields);
      setEnteredSequence([]); // Reset attempt

      if (nextShields <= 0) {
        soundFx.playWrong();
        setPhase('round_fail');
      }
    }
  };

  // Round Success Handler
  const handleRoundSuccess = () => {
    soundFx.playLevelUp();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });

    const timeBonus = timeLeft * 5;
    const perfBonus = perfectRound ? 75 : 0;
    const roundPts = 100 + timeBonus + perfBonus;
    const newTotal = score + roundPts;
    setScore(newTotal);
    saveHighScore(newTotal);

    setRoundSummary({
      round,
      cleared: true,
      sequencePoints: 100,
      timeBonus,
      perfectBonus: perfBonus,
      gremlinBonus: 0,
      gremlinPenalty: 0,
      totalRoundPoints: roundPts
    });

    setPhase('round_success');
  };

  // Handle Voting Submission
  const handleVotePlayer = (targetPlayerId: string) => {
    if (selectedVoteId) return; // already voted
    setSelectedVoteId(targetPlayerId);
    soundFx.playClick();

    // AI Votes
    const votes: Record<string, number> = {};
    players.forEach((p) => {
      votes[p.id] = 0;
    });

    // Human vote
    votes[targetPlayerId] = (votes[targetPlayerId] || 0) + 1;

    // AI teammates vote semi-randomly, higher chance to vote for the real Gremlin or someone suspicious
    const realGremlin = players.find((p) => p.role === 'gremlin');
    players.forEach((p) => {
      if (p.isAi) {
        let aiChoice = targetPlayerId;
        const roll = Math.random();
        if (realGremlin && roll > 0.45) {
          aiChoice = realGremlin.id;
        } else {
          const candidates = players.filter((c) => c.id !== p.id);
          aiChoice = candidates[Math.floor(Math.random() * candidates.length)].id;
        }
        votes[aiChoice] = (votes[aiChoice] || 0) + 1;
      }
    });

    // Update players with votes and suspicion
    const updated = players.map((p) => {
      const received = votes[p.id] || 0;
      const newSuspicion = Math.min(100, p.suspicionScore + received * 18);
      return {
        ...p,
        votesReceived: received,
        suspicionScore: newSuspicion
      };
    });
    setPlayers(updated);

    // Score deduction or bonus
    const isTargetGremlin = realGremlin && targetPlayerId === realGremlin.id;
    if (isTargetGremlin) {
      soundFx.playLevelUp();
      setScore((s) => s + 50);
    }

    setPhase('vote_reveal');
  };

  // Continue to next round or match over
  const handleContinueAfterRound = () => {
    if (round < maxRounds) {
      startRound(round + 1);
    } else {
      // Match Over!
      setPhase('match_over');
      soundFx.playVictory();
      confetti({ particleCount: 120, spread: 90 });
      saveHighScore(score);
      submitGameScore('fake-bomb', score);
      recordGameWin('fake-bomb');
      addXP(150);
      addCoins(100);
      if (onGameEnd) onGameEnd(score);
    }
  };

  // Send a Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    soundFx.playFlip();
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: myPlayerId,
      senderName: user.displayName || user.username || 'You',
      text: chatInput.trim(),
      timestamp: 'Just now',
      badge: '🚀'
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  // Start Solo Practice
  const handleStartSolo = () => {
    soundFx.playClick();
    setGameMode('solo');
    initPlayers('solo', enableGremlin);
    setScore(0);
    setPhase('countdown');
    setTimeout(() => {
      startRound(1);
    }, 1200);
  };

  // Start Private Room Lobby
  const handleCreateRoom = () => {
    soundFx.playClick();
    setGameMode('room');
    initPlayers('room', enableGremlin);
    setScore(0);
    setPhase('lobby');
  };

  const handleCopyRoomCode = () => {
    soundFx.playCoin();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const myPlayer = players.find((p) => p.id === myPlayerId) || players[0];

  return (
    <div
      className={`relative w-full min-h-[640px] md:min-h-[720px] rounded-3xl overflow-hidden bg-[#0A0D14] border border-white/10 shadow-2xl flex flex-col font-sans select-none ${
        isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
      }`}
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 20%, rgba(236,72,153,0.12) 0%, rgba(6,182,212,0.08) 40%, rgba(10,13,20,1) 85%)'
      }}
    >
      {/* Funny Duck Pop Floating Overlays */}
      {duckPops.map((duck) => (
        <div
          key={duck.id}
          className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-[bounce_0.6s_infinite] transition-all"
          style={{ left: `${duck.x}%`, top: `${duck.y}%` }}
        >
          <div className="flex flex-col items-center">
            <span className="text-6xl drop-shadow-[0_10px_20px_rgba(255,200,0,0.6)]">
              {duck.emoji}
            </span>
            <span className="px-3 py-1 bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-full shadow-lg border-2 border-white">
              {duck.label}
            </span>
          </div>
        </div>
      ))}

      {/* ============================================================== */}
      {/* 1. MODE SELECT SCREEN                                         */}
      {/* ============================================================== */}
      {phase === 'mode_select' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            <Sparkles className="w-3.5 h-3.5" />
            Social Deduction Co-op Party
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-400 tracking-tight drop-shadow-[0_4px_30px_rgba(236,72,153,0.4)] mb-2">
            FAKE BOMB
          </h1>
          <p className="text-base md:text-xl text-gray-300 font-medium italic max-w-xl mb-8">
            “Trust nobody. Press carefully.”
          </p>

          {/* Harmless Disclaimer Pill */}
          <div className="mb-8 px-4 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-xs flex items-center gap-2 max-w-md">
            <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Fictional cartoon Chaos Core device. 100% harmless party puzzle!</span>
          </div>

          {/* Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
            {/* Solo Practice */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/[0.05] transition-all flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Solo Practice</h3>
              <p className="text-xs text-gray-400 mb-6 flex-1">
                Play instantly with 3 hilarious AI teammates. Perfect to learn clue deduction!
              </p>
              <button
                onClick={handleStartSolo}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                PLAY SOLO NOW
              </button>
            </div>

            {/* Private Room */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/[0.05] transition-all flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                🔑
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Private Room</h3>
              <p className="text-xs text-gray-400 mb-6 flex-1">
                Create a 6-digit room code for 3–6 friends or local play with secret roles.
              </p>
              <button
                onClick={handleCreateRoom}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                CREATE SQUAD ROOM
              </button>
            </div>

            {/* Quick Play */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 opacity-70 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Coming Soon
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shadow-lg mb-4 text-gray-400">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-gray-200 mb-1">Global Matchmaking</h3>
              <p className="text-xs text-gray-400 mb-6 flex-1">
                Cross-realm random matching with ranked social deduction leagues.
              </p>
              <button
                disabled
                className="w-full py-3 rounded-xl bg-white/10 text-gray-400 font-bold text-sm tracking-wide cursor-not-allowed"
              >
                COMING SOON
              </button>
            </div>
          </div>

          {/* Social Deduction Gremlin Toggle */}
          <div className="mt-8 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
            <span className="text-lg">😈</span>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Secret Gremlin Role</p>
              <p className="text-[10px] text-gray-400">
                1 secret player gets misleading clues to confuse the squad
              </p>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                setEnableGremlin(!enableGremlin);
              }}
              className={`ml-3 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                enableGremlin
                  ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              {enableGremlin ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PRIVATE ROOM LOBBY                                         */}
      {/* ============================================================== */}
      {phase === 'lobby' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
          <div className="w-full max-w-xl p-8 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
            <span className="text-4xl mb-2">🛸</span>
            <h2 className="text-2xl font-black text-white tracking-wide mb-1">
              CHAOS CORE SQUAD LOBBY
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Share the room code with your friends to defuse together!
            </p>

            {/* Room Code Pill */}
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/50 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)] mb-8">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
                ROOM CODE:
              </span>
              <span className="text-2xl md:text-3xl font-mono font-black text-white tracking-wider">
                {roomCode}
              </span>
              <button
                onClick={handleCopyRoomCode}
                className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 transition-colors"
                title="Copy Room Code"
              >
                {copiedCode ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* Players List */}
            <div className="w-full space-y-2 mb-8">
              <div className="text-left text-xs font-mono text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>CREW MEMBERS ({players.length}/6)</span>
                <span className="text-pink-400">
                  {enableGremlin ? '😈 1 Secret Gremlin' : '😇 Pure Co-op'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3 text-left"
                  >
                    <span className="text-2xl">{p.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{p.name}</span>
                        {p.isHost && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            HOST
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{p.tag}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Controls */}
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setPhase('mode_select')}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs font-mono tracking-wider transition-all"
              >
                LEAVE ROOM
              </button>
              <button
                onClick={() => {
                  soundFx.playLevelUp();
                  startRound(1);
                }}
                className="flex-2 py-3 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-sm tracking-wider shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                START MISSION (3 ROUNDS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ACTIVE GAMEPLAY & REACTOR                                  */}
      {/* ============================================================== */}
      {(phase === 'playing' ||
        phase === 'round_success' ||
        phase === 'round_fail' ||
        phase === 'countdown') && (
        <div className="flex-1 flex flex-col p-4 md:p-6 relative z-10">
          {/* Top HUD: Round, Shields, Timer, Score */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-2 flex-wrap">
            {/* Round info */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs font-mono font-bold text-cyan-300">
                ROUND {round} / {maxRounds}
              </div>
              <span className="text-xs text-gray-400 hidden sm:inline font-mono">
                {currentPuzzle.difficulty.toUpperCase()} SEQUENCE ({currentPuzzle.sequence.length} STEPS)
              </span>
            </div>

            {/* Team Shields */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-xs font-mono text-red-400 font-bold mr-1">SHIELDS:</span>
              {Array.from({ length: maxShields }).map((_, i) => (
                <Shield
                  key={i}
                  className={`w-4 h-4 transition-all ${
                    i < shields
                      ? 'text-pink-400 fill-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* 35s Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl font-mono font-black text-sm tracking-wider transition-colors ${
                timeLeft <= 10
                  ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                  : 'bg-black/40 border border-cyan-500/30 text-cyan-400'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>{score} PTS</span>
            </div>
          </div>

          {/* Main 3-Column Content: Left Squad, Center Chaos Core, Right Clue & Chat */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 items-stretch">
            {/* LEFT: Squad Roster (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">
                  <span>SQUAD ({players.length})</span>
                  <span className="text-[10px] text-cyan-400">STATUS</span>
                </div>

                <div className="space-y-2 flex-1">
                  {players.map((p) => {
                    const isMe = p.id === myPlayerId;
                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                          isMe
                            ? 'bg-pink-500/10 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                            : 'bg-white/[0.02] border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl">{p.avatar}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                              {p.name}
                              {isMe && <span className="text-[9px] text-pink-400 font-mono">(YOU)</span>}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono truncate">{p.tag}</p>
                          </div>
                        </div>

                        {/* Suspicion meter indicator */}
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-amber-400">
                            {p.suspicionScore > 0 ? `${p.suspicionScore}% sus` : 'calm'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Secret Role Reminder for Me */}
                <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/10 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">MY SECRET ROLE</span>
                    <span className="text-xs">
                      {myPlayer.role === 'gremlin' ? '😈' : '🛡️'}
                    </span>
                  </div>
                  <p
                    className={`text-xs font-black tracking-wide ${
                      myPlayer.role === 'gremlin' ? 'text-pink-400' : 'text-cyan-400'
                    }`}
                  >
                    {myPlayer.role === 'gremlin' ? 'THE SECRET GREMLIN' : 'CORE DEFUSER'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {myPlayer.role === 'gremlin'
                      ? 'Mislead the squad subtly! Do not get voted out.'
                      : 'Share your clue and solve the sequence with the crew.'}
                  </p>
                </div>
              </div>
            </div>

            {/* CENTER: Cartoon Chaos Core Device & Sequence Inputs (6 cols) */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 rounded-3xl bg-black/40 border border-white/10 relative overflow-hidden">
              {/* Harmless Cartoon Core Sphere Graphics */}
              <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center my-2">
                {/* Outer Rotating Energy Ring */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 animate-[spin_12s_linear_infinite]"
                  style={{ boxShadow: '0 0 30px rgba(6,182,212,0.3)' }}
                />
                {/* Secondary Reverse Ring */}
                <div className="absolute inset-4 rounded-full border border-pink-400/30 animate-[spin_8s_linear_infinite_reverse]" />

                {/* Cartoon Core Sphere */}
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-pink-600 via-purple-700 to-cyan-500 shadow-[inset_0_0_40px_rgba(255,255,255,0.4),0_0_50px_rgba(236,72,153,0.5)] flex flex-col items-center justify-center p-4 text-center border-4 border-white/20">
                  <span className="text-3xl sm:text-4xl animate-pulse">⚛️</span>
                  <span className="text-[10px] font-mono font-bold text-white/90 uppercase tracking-widest mt-1">
                    CHAOS CORE
                  </span>
                  <span className="text-xs font-mono text-cyan-200 font-bold">
                    {Math.max(0, timeLeft)}s
                  </span>
                </div>
              </div>

              {/* Sequence Slot Progress Indicators */}
              <div className="flex items-center gap-2 my-4">
                {currentPuzzle.sequence.map((_, idx) => {
                  const filledSymbolId = enteredSequence[idx];
                  const filledSymbol = filledSymbolId ? CHAOS_SYMBOLS[filledSymbolId] : null;

                  return (
                    <div
                      key={idx}
                      className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center text-xl transition-all border-2 ${
                        filledSymbol
                          ? 'bg-white/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-105'
                          : 'bg-black/50 border-white/20 text-gray-500'
                      }`}
                    >
                      {filledSymbol ? filledSymbol.emoji : idx + 1}
                    </div>
                  );
                })}
              </div>

              {/* Glowing Harmless Symbol Buttons */}
              <div className="text-center w-full max-w-md">
                <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-2">
                  CLICK CORRECT SYMBOL IN ORDER:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {currentPuzzle.availableButtons.map((symId) => {
                    const sym = CHAOS_SYMBOLS[symId];
                    if (!sym) return null;
                    const isFlashing = activeButtonFlash === symId;

                    return (
                      <button
                        key={symId}
                        onClick={() => handleButtonPress(symId)}
                        disabled={phase !== 'playing'}
                        className={`group relative p-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/15 hover:border-white/40 active:scale-95 transition-all flex flex-col items-center justify-center min-w-[72px] sm:min-w-[80px] shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] ${
                          isFlashing ? 'bg-cyan-400/40 border-cyan-300 scale-110' : ''
                        }`}
                        style={{
                          boxShadow: isFlashing ? `0 0 25px ${sym.color}` : undefined
                        }}
                      >
                        <span className="text-2xl sm:text-3xl mb-1 group-hover:scale-125 transition-transform">
                          {sym.emoji}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-gray-300 tracking-wide">
                          {sym.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: My Clue Card & Squad Chat (3 cols) */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              {/* My Clue Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/30 shadow-lg text-left relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>YOUR SECRET CLUE</span>
                  </div>
                  <button
                    onClick={() => setIsClueHidden(!isClueHidden)}
                    className="text-gray-400 hover:text-white p-1"
                    title={isClueHidden ? 'Show Clue' : 'Hide Clue'}
                  >
                    {isClueHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {isClueHidden ? (
                  <div className="py-4 text-center text-xs font-mono text-gray-500 italic bg-black/40 rounded-xl">
                    [Clue Hidden — Click Eye to Reveal]
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-black/50 border border-amber-500/20 text-xs text-amber-100 font-medium leading-relaxed">
                    “{myPlayer.clue?.text || 'Observe the reactor carefully.'}”
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-2 italic">
                  💡 Share this clue with your squad in chat to coordinate!
                </p>
              </div>

              {/* Live Squad Chat */}
              <div className="flex-1 min-h-[220px] p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                  <span>SQUAD BANTER & CLUES</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[180px] text-left">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`text-xs p-2 rounded-xl leading-relaxed ${
                        msg.isSystem
                          ? 'bg-pink-500/10 border border-pink-500/20 text-pink-300 font-mono text-[11px]'
                          : msg.senderId === myPlayerId
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-100 ml-2'
                          : 'bg-white/[0.04] border border-white/5 text-gray-300 mr-2'
                      }`}
                    >
                      {!msg.isSystem && (
                        <div className="flex items-center gap-1 font-bold text-[10px] text-gray-400 mb-0.5">
                          <span>{msg.badge || '👾'}</span>
                          <span>{msg.senderName}</span>
                        </div>
                      )}
                      <span>{msg.text}</span>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChat} className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type clue or roast..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. ROUND SUCCESS MODAL OVERLAY                                */}
      {/* ============================================================== */}
      {phase === 'round_success' && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md p-6 rounded-3xl bg-gradient-to-b from-gray-900 via-gray-900 to-black border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-center animate-in zoom-in-95">
            <span className="text-5xl mb-2 inline-block">🎉</span>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-wide mb-1">
              CORE STABILIZED!
            </h2>
            <p className="text-xs text-gray-300 mb-6">
              Round {round} defused with pure squad synergy!
            </p>

            {/* Score breakdown */}
            <div className="space-y-2 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono text-left mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Sequence Solved:</span>
                <span className="text-emerald-400 font-bold">+100 PTS</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Time Remaining ({timeLeft}s):</span>
                <span className="text-cyan-400 font-bold">+{timeLeft * 5} PTS</span>
              </div>
              {perfectRound && (
                <div className="flex justify-between text-amber-300">
                  <span>Zero Error Bonus:</span>
                  <span className="font-bold">+75 PTS</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                <span>ROUND TOTAL:</span>
                <span className="text-amber-400">+{roundSummary?.totalRoundPoints || 100} PTS</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (enableGremlin && players.length >= 3) {
                  setPhase('voting');
                } else {
                  handleContinueAfterRound();
                }
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-black font-bold text-sm tracking-wider shadow-lg transition-all"
            >
              {enableGremlin ? 'PROCEED TO SQUAD VOTING 🗳️' : 'NEXT ROUND 🚀'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. ROUND FAIL / CHAOS ACTIVATED MODAL                          */}
      {/* ============================================================== */}
      {phase === 'round_fail' && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md p-6 rounded-3xl bg-gradient-to-b from-gray-900 via-gray-900 to-black border border-pink-500/40 shadow-[0_0_50px_rgba(236,72,153,0.3)] text-center animate-in zoom-in-95">
            <span className="text-6xl mb-2 inline-block animate-bounce">🦆</span>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-rose-400 tracking-wide mb-1">
              CHAOS ACTIVATED!
            </h2>
            <p className="text-xs text-gray-300 mb-6">
              Rubber ducks have overrun the core! The Gremlin must be laughing!
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono text-left mb-6 space-y-1 text-gray-400">
              <p>• Shields depleted or time expired</p>
              <p>• No points awarded this round</p>
              <p>• You still get a chance to deduce the Gremlin!</p>
            </div>

            <button
              onClick={() => {
                if (enableGremlin && players.length >= 3) {
                  setPhase('voting');
                } else {
                  handleContinueAfterRound();
                }
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-sm tracking-wider shadow-lg transition-all"
            >
              {enableGremlin ? 'VOTE WHO CAUSED THIS 🗳️' : 'RETRY MISSION 🔄'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SOCIAL DEDUCTION VOTING PHASE                              */}
      {/* ============================================================== */}
      {phase === 'voting' && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-6">
          <div className="w-full max-w-lg p-6 md:p-8 rounded-3xl bg-gray-900 border border-white/15 shadow-2xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-mono font-bold mb-3">
              <span>🕵️ SQUAD INTERROGATION</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide mb-1">
              WHO WAS ACTING SUSPICIOUS?
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Vote for the player you think is the secret Gremlin (+50 pts if correct)!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {players.map((p) => {
                const isMe = p.id === myPlayerId;
                return (
                  <button
                    key={p.id}
                    disabled={isMe}
                    onClick={() => handleVotePlayer(p.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      isMe
                        ? 'opacity-40 cursor-not-allowed bg-white/[0.02] border-white/5'
                        : 'bg-white/[0.04] border-white/10 hover:border-pink-500 hover:bg-pink-500/10 active:scale-95'
                    }`}
                  >
                    <span className="text-3xl">{p.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                        {p.name}
                        {isMe && <span className="text-[9px] text-gray-500">(YOU)</span>}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">{p.tag}</p>
                    </div>
                    <span className="text-xs font-mono text-pink-400 font-bold">VOTE</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. VOTE RESULTS & SUSPICION REVEAL                             */}
      {/* ============================================================== */}
      {phase === 'vote_reveal' && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-6">
          <div className="w-full max-w-lg p-6 md:p-8 rounded-3xl bg-gray-900 border border-white/15 shadow-2xl text-center">
            <span className="text-5xl mb-2 inline-block">📊</span>
            <h2 className="text-2xl font-black text-white tracking-wide mb-1">
              VOTE RESULTS & SUSPICION METER
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Everyone stays in the match! High suspicion raises pressure in next rounds.
            </p>

            <div className="space-y-3 mb-8">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3 text-left"
                >
                  <span className="text-2xl">{p.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span>{p.name}</span>
                      <span className="font-mono text-pink-400">{p.votesReceived} Votes</span>
                    </div>

                    {/* Animated Suspicion Bar */}
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-pink-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(5, p.suspicionScore)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleContinueAfterRound}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-black font-black text-sm tracking-wider shadow-lg transition-all"
            >
              {round < maxRounds ? `CONTINUE TO ROUND ${round + 1} 🚀` : 'VIEW FINAL MATCH REPORT 🏆'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. MATCH OVER REPORT                                          */}
      {/* ============================================================== */}
      {phase === 'match_over' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10 text-center">
          <div className="w-full max-w-lg p-8 rounded-3xl bg-white/[0.04] border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
            <span className="text-6xl mb-3">🏆</span>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-400 tracking-tight mb-1">
              MISSION DEBRIEF
            </h2>
            <p className="text-xs text-gray-300 mb-6 font-mono">
              FINAL SCORE: <span className="text-amber-400 font-bold text-base">{score} PTS</span>
            </p>

            {/* Secret Roles Truth Unveiled */}
            <div className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-left mb-6">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-2">
                SECRET ROLES REVEALED:
              </span>
              <div className="space-y-2">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-2">
                      <span>{p.avatar}</span>
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                    <span
                      className={`font-mono text-[11px] font-bold ${
                        p.role === 'gremlin' ? 'text-pink-400' : 'text-cyan-400'
                      }`}
                    >
                      {p.role === 'gremlin' ? '😈 THE GREMLIN' : '🛡️ CORE DEFUSER'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setPhase('mode_select')}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs font-mono tracking-wider transition-all"
              >
                MODE SELECT
              </button>
              <button
                onClick={handleStartSolo}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-xs font-mono tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                PLAY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
