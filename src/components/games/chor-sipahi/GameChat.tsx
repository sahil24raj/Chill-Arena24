'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Player } from './chorSipahiTypes';
import { Send, MessageSquare, Sparkles, Smile, Flame } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface GameChatProps {
  messages: ChatMessage[];
  currentPlayer: Player;
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

const QUICK_ROASTS = [
  'Pakka Chor yehi hai! 🥷',
  'Main imandaar Mantri hoon bhai! 😇',
  'Raja ji kripya insaaf karein! 👑',
  'Bohot suspicious acting chal rahi hai! 👀',
  'Bhai meri aankhon me dekho, sach bol raha hoon!',
  'Sipahi ji isko turant arrest karo! 👮'
];

export const GameChat: React.FC<GameChatProps> = ({
  messages,
  currentPlayer,
  onSendMessage,
  disabled = false
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || disabled) return;
    soundFx.playClick();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickRoast = (roast: string) => {
    if (disabled) return;
    soundFx.playClick();
    onSendMessage(roast);
  };

  return (
    <div className="flex flex-col h-full bg-[#0c101d]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-[#11172a] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#00F0FF]" />
          <span className="font-display font-black text-xs text-white uppercase tracking-wider">
            Court Discussion & Roasts
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
          Live Banter
        </span>
      </div>

      {/* Message List */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-[260px] sm:max-h-[300px] scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
            <span className="text-2xl mb-1">🗣️</span>
            <span>Court discussion open! Defend your identity or interrogate suspects.</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.playerId === currentPlayer.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-2 items-start ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] text-slate-950 flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                  {msg.avatar}
                </div>
                <div
                  className={`max-w-[78%] rounded-xl px-3 py-1.5 text-xs ${
                    isMe
                      ? 'bg-gradient-to-r from-[#00F0FF]/20 to-[#3B82F6]/20 border border-[#00F0FF]/40 text-cyan-100 rounded-tr-none'
                      : 'bg-[#151c33] border border-white/10 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[10px] text-white">
                      {isMe ? 'You' : msg.playerName}
                    </span>
                    {msg.roleHint && (
                      <span className="text-[9px] font-mono text-[#ADFF2F]">
                        [{msg.roleHint}]
                      </span>
                    )}
                  </div>
                  <p className="font-sans leading-relaxed break-words">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Roast Buttons */}
      <div className="px-3 py-2 bg-[#080b14] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        {QUICK_ROASTS.map((roast, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => handleQuickRoast(roast)}
            className="text-[10px] font-sans whitespace-nowrap px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00F0FF]/20 text-slate-300 hover:text-white border border-white/5 hover:border-[#00F0FF]/30 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {roast}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-2.5 bg-[#11172a] border-t border-white/10 flex gap-2">
        <input
          type="text"
          disabled={disabled}
          placeholder={disabled ? 'Chat is disabled in this phase...' : 'Type your defense or roast...'}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-[#090d19] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] transition-colors disabled:opacity-50 font-sans"
        />
        <button
          type="submit"
          disabled={disabled || !inputText.trim()}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#3B82F6] text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
