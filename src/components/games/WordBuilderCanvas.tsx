'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { RotateCcw, Sparkles, Trophy, Users, Bot, Zap, Check, X, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WordBuilderProps {
  mode?: 'local' | 'ai' | 'solo';
}

const LETTER_POOLS = [
  ['C', 'A', 'T', 'R', 'E', 'S'],
  ['P', 'L', 'A', 'Y', 'E', 'R'],
  ['B', 'R', 'A', 'I', 'N', 'S'],
  ['M', 'E', 'M', 'E', 'R', 'S'],
  ['G', 'A', 'M', 'E', 'O', 'N']
];

const VALID_DICTIONARY = new Set([
  // CATRES
  'CAT', 'CATS', 'RAT', 'RATS', 'TAR', 'TARS', 'ART', 'ARTS', 'STAR', 'RATE', 'RATES', 'TEAR', 'TEARS', 'CARE', 'CARES', 'RACE', 'RACES', 'ACRE', 'ACRES', 'SCARE', 'CRATE', 'CRATES', 'TRACE', 'TRACES', 'REACT', 'REACTS', 'CASTER', 'CATER', 'CATERS', 'SET', 'SEA', 'EAT', 'EATS', 'ATE', 'TEA', 'TEAS', 'EAST', 'SEAT', 'REST',
  // PLAYER
  'PLAY', 'PLAYS', 'PLAYER', 'PLAYERS', 'LAY', 'LAYS', 'PAY', 'PAYS', 'RAY', 'RAYS', 'EAR', 'EARS', 'PEAL', 'PEALS', 'PALE', 'PALES', 'PLEA', 'PLEAS', 'REAP', 'REAPS', 'LEAP', 'LEAPS', 'PEAR', 'PEARS', 'RIPE', 'PALE',
  // BRAINS
  'BRAIN', 'BRAINS', 'RAIN', 'RAINS', 'BAR', 'BARS', 'BAN', 'BANS', 'RIB', 'RIBS', 'BIN', 'BINS', 'NAB', 'NABS', 'AIR', 'AIRS', 'SIN', 'SIR', 'RAN', 'ABRI',
  // MEMERS
  'MEME', 'MEMES', 'SEEM', 'MEER', 'SERE', 'REMS', 'EMER', 'MEES', 'SEER', 'ERE', 'SEE',
  // GAMEON
  'GAME', 'GAMES', 'NAME', 'NAMES', 'MAN', 'MEN', 'ONE', 'ONES', 'GEM', 'GEMS', 'AGE', 'AGES', 'EON', 'EONS', 'MOAN', 'MOANS', 'MANE', 'MANES', 'MEGA', 'GONE', 'NOME', 'OMEN'
]);

export const WordBuilderCanvas: React.FC<WordBuilderProps> = ({ mode: initialMode = 'local' }) => {
  const { user, addCoins, addXP, updateHighScore, recordGameWin, submitGameScore } = useAppStore();

  const [gameMode, setGameMode] = useState<'local' | 'ai' | 'solo'>(initialMode);
  const [letters, setLetters] = useState<string[]>(LETTER_POOLS[0]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [submittedWords, setSubmittedWords] = useState<string[]>([]);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [comboStreak, setComboStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [gameOver, setGameOver] = useState(false);

  // AI bot words auto generator
  useEffect(() => {
    if (gameMode === 'ai' && currentTurn === 2 && isPlaying && !gameOver) {
      const interval = setInterval(() => {
        const pool = Array.from(VALID_DICTIONARY);
        const randomWord = pool[Math.floor(Math.random() * pool.length)];
        setPlayer2Score((prev) => prev + (randomWord.length >= 5 ? 4 : randomWord.length >= 4 ? 2 : 1));
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [gameMode, currentTurn, isPlaying, gameOver]);

  // Round Timer Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleEndRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver, currentTurn]);

  const handleTileClick = (index: number) => {
    if (!isPlaying) setIsPlaying(true);
    if (selectedIndices.includes(index)) return;

    soundFx.playClick();
    setSelectedIndices([...selectedIndices, index]);
    setCurrentWord(currentWord + letters[index]);
  };

  const handleBackspace = () => {
    if (selectedIndices.length === 0) return;
    soundFx.playClick();
    setSelectedIndices(selectedIndices.slice(0, -1));
    setCurrentWord(currentWord.slice(0, -1));
  };

  const handleClear = () => {
    soundFx.playClick();
    setSelectedIndices([]);
    setCurrentWord('');
  };

  const handleSubmitWord = () => {
    if (!currentWord) return;
    const word = currentWord.toUpperCase();

    if (submittedWords.includes(word)) {
      soundFx.playBuzzer();
      setFeedback({ msg: `"${word}" already submitted!`, type: 'error' });
      handleClear();
      return;
    }

    if (word.length >= 3 && VALID_DICTIONARY.has(word)) {
      soundFx.playCorrect();
      soundFx.playCoin();
      const points = (word.length >= 5 ? 4 : word.length === 4 ? 2 : 1) * (comboStreak >= 3 ? 2 : 1);
      
      setSubmittedWords([word, ...submittedWords]);
      setComboStreak((c) => c + 1);
      setFeedback({ msg: `+${points} PTS! "${word}" accepted! 🎯`, type: 'success' });

      if (currentTurn === 1) {
        setPlayer1Score((s) => s + points);
        addCoins(points * 10);
        addXP(points * 8);
      } else {
        setPlayer2Score((s) => s + points);
      }
    } else {
      soundFx.playBuzzer();
      setComboStreak(0);
      setFeedback({ msg: `"${word}" is not in dictionary!`, type: 'error' });
    }

    handleClear();
  };

  const handleEndRound = () => {
    if (gameMode !== 'solo' && currentTurn === 1) {
      soundFx.playLevelUp();
      setCurrentTurn(2);
      setTimeLeft(30);
      setSelectedIndices([]);
      setCurrentWord('');
      setSubmittedWords([]);
      setComboStreak(0);
      setLetters(LETTER_POOLS[1]);
      setFeedback({ msg: 'Player 1 finished! Player 2 switch turn now!', type: 'success' });
      return;
    }

    setGameOver(true);
    setIsPlaying(false);
    soundFx.playLevelUp();
    confetti({ particleCount: 80, spread: 60 });

    const isWin = player1Score >= player2Score || gameMode === 'solo';
    submitGameScore('word-builder', player1Score, isWin);
  };

  const resetGame = () => {
    soundFx.playClick();
    const randomPool = LETTER_POOLS[Math.floor(Math.random() * LETTER_POOLS.length)];
    setLetters(randomPool);
    setSelectedIndices([]);
    setCurrentWord('');
    setSubmittedWords([]);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentTurn(1);
    setTimeLeft(30);
    setIsPlaying(false);
    setGameOver(false);
    setComboStreak(0);
    setFeedback(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border-[#00F0FF]/20 bg-[#0d1117]/90">
        <div className="flex items-center gap-2 font-display">
          <span className="text-2xl">🔤</span>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              WORD BUILDER SCRAMBLE <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">30S DUEL</span>
            </h2>
            <p className="text-[11px] text-gray-400 font-sans">Form valid words from scrambled letter tiles before time expires!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'local', label: '👥 Pass & Play 1v1', icon: Users },
            { id: 'ai', label: '🤖 vs Smart AI', icon: Bot },
            { id: 'solo', label: '🎯 Solo Practice', icon: Zap }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                soundFx.playClick();
                setGameMode(m.id as any);
                resetGame();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display transition-all ${
                gameMode === m.id
                  ? 'bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F] text-slate-950 shadow-md shadow-[#00F0FF]/20'
                  : 'bg-slate-900 border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}

          <button
            onClick={resetGame}
            className="p-2 rounded-lg bg-slate-900 border border-gray-800 text-gray-400 hover:text-white hover:border-[#00F0FF]/40 transition-colors"
            title="Restart Match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Score & Timer HUD */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl glass-panel border ${
          currentTurn === 1 ? 'border-[#00F0FF] bg-[#00F0FF]/10' : 'border-gray-800 bg-[#0d1117]/80'
        }`}>
          <span className="text-[10px] text-gray-400 font-mono block">PLAYER 1 (YOU)</span>
          <span className="text-3xl font-black text-[#00F0FF] font-display">{player1Score}</span>
          <span className="text-[9px] text-gray-500 block">WORDS: {submittedWords.length}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-purple-500/30 bg-purple-500/5 text-center flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-pink-400 font-mono">⏳ {timeLeft}s</span>
          <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> STREAK: {comboStreak}x
          </span>
        </div>

        <div className={`p-4 rounded-2xl glass-panel border ${
          currentTurn === 2 ? 'border-pink-500 bg-pink-500/10' : 'border-gray-800 bg-[#0d1117]/80'
        }`}>
          <span className="text-[10px] text-gray-400 font-mono block">
            {gameMode === 'ai' ? 'BOT_CHAD (AI)' : 'PLAYER 2'}
          </span>
          <span className="text-3xl font-black text-pink-400 font-display">{player2Score}</span>
          <span className="text-[9px] text-gray-500 block">POINTS</span>
        </div>
      </div>

      {/* Word Canvas Stage */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-purple-900/40 shadow-2xl bg-gradient-to-b from-[#170e2b] via-[#0d0a1a] to-[#080610] p-6 space-y-6">
        {/* Word Display Input Box */}
        <div className="h-16 rounded-2xl bg-slate-950/80 border-2 border-purple-500/40 flex items-center justify-center text-3xl font-black tracking-widest text-white font-display shadow-inner">
          {currentWord || <span className="text-gray-600 text-sm font-mono tracking-normal">Click letter tiles below to build word...</span>}
        </div>

        {/* Feedback Alert Message */}
        {feedback && (
          <div className={`p-2 rounded-xl text-center text-xs font-mono font-bold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/20 border border-red-500/40 text-red-400'
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Letter Tiles Grid */}
        <div className="flex flex-wrap justify-center gap-3 py-2">
          {letters.map((letter, idx) => {
            const isUsed = selectedIndices.includes(idx);
            return (
              <button
                key={idx}
                disabled={isUsed || gameOver}
                onClick={() => handleTileClick(idx)}
                className={`w-14 h-14 rounded-2xl font-display font-black text-2xl transition-all shadow-lg select-none flex items-center justify-center ${
                  isUsed
                    ? 'bg-slate-900/50 border border-gray-800 text-gray-700 scale-95'
                    : 'bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 hover:brightness-110 border border-pink-400 text-white hover:scale-105 shadow-pink-500/25 active:scale-95'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Word Action Controls */}
        <div className="flex justify-center gap-3">
          <button
            onClick={handleBackspace}
            disabled={selectedIndices.length === 0 || gameOver}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-gray-800 text-xs font-bold text-gray-300 hover:text-white"
          >
            ← Backspace
          </button>
          <button
            onClick={handleClear}
            disabled={selectedIndices.length === 0 || gameOver}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-gray-800 text-xs font-bold text-gray-300 hover:text-white"
          >
            Clear
          </button>
          <button
            onClick={handleSubmitWord}
            disabled={!currentWord || gameOver}
            className="cyber-button px-8 py-2.5 rounded-xl font-display text-xs font-black text-slate-950 shadow-lg"
          >
            SUBMIT WORD 🎯
          </button>
        </div>

        {/* Accepted Words Pills */}
        <div className="pt-4 border-t border-purple-900/30">
          <span className="text-[10px] font-mono text-gray-400 block mb-2">
            ACCEPTED WORDS THIS ROUND ({submittedWords.length}):
          </span>
          <div className="flex flex-wrap gap-2 min-h-8">
            {submittedWords.map((w, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/50 text-xs font-mono text-cyan-300 font-bold">
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/90 to-slate-950/90 border-2 border-[#00F0FF] text-center space-y-4 shadow-2xl animate-fadeIn">
          <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide">
            🏆 {player1Score > player2Score ? `${user.username} WON THE WORD DUEL!` : 'PLAYER 2 / BOT WON!'}
          </h3>
          <p className="text-xs text-gray-300 font-mono">
            Final Score: P1 ({player1Score} pts) vs P2 ({player2Score} pts)
          </p>
          <button
            onClick={resetGame}
            className="cyber-button px-6 py-2.5 rounded-xl font-display text-xs font-black text-slate-950 shadow-lg"
          >
            PLAY NEXT ROUND
          </button>
        </div>
      )}
    </div>
  );
};
