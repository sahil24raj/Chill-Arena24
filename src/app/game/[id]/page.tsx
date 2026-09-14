'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { ModiRunCanvas } from '@/components/games/ModiRunCanvas';
import { CIDEscapeCanvas } from '@/components/games/CIDEscapeCanvas';
import { ChaiTapriCanvas } from '@/components/games/ChaiTapriCanvas';
import { EmojiDodgeCanvas } from '@/components/games/EmojiDodgeCanvas';
import { MemeClickerCanvas } from '@/components/games/MemeClickerCanvas';
import { GullyCricketCanvas } from '@/components/games/GullyCricketCanvas';
import {
  Gamepad2,
  ThumbsUp,
  Share2,
  Flame,
  MessageSquare,
  Trophy,
  Star,
  Maximize2,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addCoins, addXP, addRecentlyPlayed, isMuted, toggleMute } = useAppStore();

  const [likes, setLikes] = useState(1420);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState([
    { id: '1', user: 'SigmaGamer_99', text: 'ACP Pradyuman caught me in CID Escape! Pure nostalgia 😂', time: '2 mins ago', likes: 14 },
    { id: '2', user: 'ChaiLover_IN', text: 'Chai Tapri Tycoon is addicting! 50 cutting chais served 🔥', time: '10 mins ago', likes: 8 }
  ]);

  const game = GAMES_CATALOG.find((g) => g.id === id) || GAMES_CATALOG[0];

  useEffect(() => {
    addRecentlyPlayed(game.id);
  }, [game.id, addRecentlyPlayed]);

  const handleLike = () => {
    soundFx.playCoin();
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
      confetti({ particleCount: 30, spread: 40 });
    }
  };

  const handleShare = () => {
    soundFx.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Game Link Copied to Clipboard!');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    soundFx.playLevelUp();
    setCommentsList([
      { id: Date.now().toString(), user: 'You (Meme Gamer)', text: commentText, time: 'Just now', likes: 0 },
      ...commentsList
    ]);
    setCommentText('');
  };

  const renderGameCanvas = () => {
    switch (game.id) {
      case 'modi-run':
        return <ModiRunCanvas />;
      case 'cid-escape':
        return <CIDEscapeCanvas />;
      case 'chai-tapri':
        return <ChaiTapriCanvas />;
      case 'emoji-dodge':
        return <EmojiDodgeCanvas />;
      case 'meme-clicker':
        return <MemeClickerCanvas />;
      case 'gully-cricket':
        return <GullyCricketCanvas />;
      default:
        return <ModiRunCanvas />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Game Title & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">{game.thumbnail}</span>
            <h1 className="text-3xl font-black text-white">{game.title}</h1>
          </div>
          <p className="text-xs text-gray-400">{game.tagline}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              hasLiked
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/40'
                : 'bg-slate-900/80 border border-purple-900/40 text-gray-300 hover:text-white'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{likes}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-full bg-slate-900/80 border border-purple-900/40 text-xs font-bold text-gray-300 hover:text-cyan-300 flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* GAME CANVAS VIEWPORT */}
      <div className="w-full flex justify-center">
        {renderGameCanvas()}
      </div>

      {/* Game Details & Controls Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-panel p-6 rounded-2xl border-purple-900/40 space-y-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-purple-400" /> About {game.title}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">{game.description}</p>

            <div className="pt-4 border-t border-purple-900/30">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">Game Controls</h4>
              <ul className="space-y-1 text-xs text-gray-400">
                {game.controls.map((ctrl, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> {ctrl}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Comments section */}
          <div className="glass-panel p-6 rounded-2xl border-purple-900/40 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-400" /> Gamer Comments ({commentsList.length})
            </h3>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a funny comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-slate-950 border border-purple-800/50 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="cyber-button px-5 py-2 rounded-xl text-xs font-black text-white shadow-lg"
              >
                Post
              </button>
            </form>

            <div className="space-y-3 pt-2">
              {commentsList.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-950/60 border border-purple-900/30 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-cyan-300">{c.user}</span>
                    <span className="text-[10px] text-gray-500">{c.time}</span>
                  </div>
                  <p className="text-gray-300">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Recommended Games */}
        <div className="glass-panel p-6 rounded-2xl border-purple-900/40 space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> More Meme Games
          </h3>

          <div className="space-y-3">
            {GAMES_CATALOG.filter((g) => g.id !== game.id).map((rec) => (
              <Link
                key={rec.id}
                href={`/game/${rec.id}`}
                onClick={() => soundFx.playClick()}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-purple-900/30 hover:border-cyan-400/60 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center text-2xl shrink-0">
                  {rec.thumbnail}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {rec.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-semibold">{rec.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
