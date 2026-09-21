'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Users,
  MessageSquare,
  Share2,
  Check,
  Swords,
  Headphones
} from 'lucide-react';

export const SquadPartyLounge: React.FC = () => {
  const { user, openMultiplayerModal } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [roastInput, setRoastInput] = useState('');
  const [roastFeed, setRoastFeed] = useState<{ id: string; user: string; avatar: string; msg: string; time: string }[]>([]);

  const quickRoasts = [
    'Skill issue bro 💀',
    'Aaja 1v1 Pen Flip me dekhte hai! 🖊️',
    'Middle stump gayab ho gaya tera! 🏏',
    '200 IQ move tha vo! 🧠',
    'Teacher aa rahi hai, chup baith! 🤫'
  ];

  const handleSendRoast = (text?: string) => {
    const msgToSend = text || roastInput;
    if (!msgToSend.trim()) return;
    soundFx.playCoin();
    setRoastFeed([
      {
        id: Date.now().toString(),
        user: user.displayName || user.username,
        avatar: user.avatar,
        msg: msgToSend.trim(),
        time: 'Just now'
      },
      ...roastFeed
    ]);
    setRoastInput('');
  };

  const handleCopySquadLink = () => {
    soundFx.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/multiplayer?room=CHILL24`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="p-6 lg:p-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#0c121c] via-[#080b12] to-[#05070a] relative overflow-hidden shadow-2xl space-y-6">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Users className="w-3.5 h-3.5" />
            <span>CHILL LOUNGE • SQUAD BANTER & 1v1 ROASTS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-1">
            HOSTEL & CANTEEN SQUAD LOUNGE ☕
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Hangout with friends, share live trash talk, and create instant duel rooms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySquadLink}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-gray-800 hover:border-[#00F0FF] text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors font-mono"
          >
            {copied ? <Check className="w-4 h-4 text-[#ADFF2F]" /> : <Share2 className="w-4 h-4 text-[#00F0FF]" />}
            <span>{copied ? 'SQUAD LINK COPIED!' : 'SHARE SQUAD INVITE'}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              openMultiplayerModal();
            }}
            className="px-5 py-2 rounded-xl cyber-button font-display text-xs font-black text-slate-950 flex items-center gap-1.5 shadow-lg shadow-[#00F0FF]/20"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>CREATE DUEL ROOM</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Col: Live Squad Chat & Banter Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span className="flex items-center gap-1.5 text-white font-bold font-display">
              <MessageSquare className="w-4 h-4 text-pink-400" /> SQUAD TRASH TALK & BANTER FEED
            </span>
          </div>

          {/* Chat Stream Box */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-gray-800/80 space-y-2.5 max-h-56 overflow-y-auto font-mono text-xs">
            {roastFeed.length > 0 ? (
              roastFeed.map((r) => (
                <div
                  key={r.id}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-gray-850 flex items-start justify-between gap-3 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl shrink-0 mt-0.5">{r.avatar}</span>
                    <div>
                      <span className="font-bold text-[#00F0FF] text-[11px] block">{r.user}</span>
                      <p className="text-gray-300 font-sans text-xs mt-0.5">{r.msg}</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-500 shrink-0">{r.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 space-y-1">
                <p className="text-xs text-gray-400 font-mono">No messages in squad banter yet.</p>
                <p className="text-[10px] text-gray-600">Type a message below or click a quick roast pill to drop the first roast!</p>
              </div>
            )}
          </div>

          {/* Quick Roast Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickRoasts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendRoast(q)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-[#00F0FF]/15 border border-gray-800 hover:border-[#00F0FF]/40 text-[10px] font-mono text-gray-300 hover:text-white transition-all"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Custom Message Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendRoast();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Send friendly roast to squad..."
              value={roastInput}
              onChange={(e) => setRoastInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF] font-sans"
            />
            <button
              type="submit"
              className="cyber-button px-6 py-2.5 rounded-xl font-display text-xs font-black text-slate-950 shadow-md"
            >
              ROAST 🚀
            </button>
          </form>
        </div>

        {/* Right Col: Squad Lounge Voice/Party Room Card */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/80 border border-gray-800/80 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-850 pb-2.5">
              <span className="text-xs font-bold text-white font-display flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-[#ADFF2F]" /> CHILL PARTY LOUNGE
              </span>
              <span className="text-[10px] font-mono text-[#ADFF2F] font-bold">READY</span>
            </div>

            <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
              No downloads needed. Instant browser audio cues & turn-based multiplayer with your friends.
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-gray-800">
                <div className="flex items-center gap-2">
                  <span>{user.avatar}</span>
                  <span className="text-white font-bold">{user.displayName || user.username} (You)</span>
                </div>
                <span className="text-[10px] text-[#ADFF2F]">
                  LVL {user.level}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              openMultiplayerModal();
            }}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-[#00F0FF] border border-[#00F0FF]/40 text-white hover:text-slate-950 text-xs font-black font-display flex items-center justify-center gap-1.5 transition-colors"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>CREATE / JOIN PARTY ROOM</span>
          </button>
        </div>
      </div>
    </section>
  );
};
