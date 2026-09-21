'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { MessageSquare, Send, Sparkles, ChevronRight, Bot } from 'lucide-react';

interface ChatSidebarProps {
  collapsed?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
  onToggleCollapse?: () => void;
}

export const RightChatSidebar: React.FC<ChatSidebarProps> = ({
  collapsed = false,
  isCollapsed,
  onToggle,
  onToggleCollapse
}) => {
  const isActualCollapsed = isCollapsed !== undefined ? isCollapsed : collapsed;
  const handleToggle = onToggleCollapse || onToggle || (() => {});
  const { user } = useAppStore();
  const [messages, setMessages] = useState<
    { id: string; user: string; avatar: string; badge: string; time: string; text: string }[]
  >([]);

  const [inputMsg, setInputMsg] = useState('');

  const quickEmojis = ['🔥', '💀', '🖊️', '🏏', '☕', '🧠', '👑'];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim()) return;

    soundFx.playCoin();
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: user.displayName || user.username,
        avatar: user.avatar,
        badge: user.authType === 'google' ? 'Google' : user.authType === 'email' ? 'Verified' : 'Gamer',
        time: 'Just now',
        text: inputMsg.trim()
      }
    ]);
    setInputMsg('');
  };

  if (isActualCollapsed) {
    return (
      <div className="hidden xl:flex flex-col items-center justify-start p-3 bg-[#0d0f18] border-l border-[#1e2235] h-screen fixed right-0 top-0 z-30 pt-16">
        <button
          onClick={handleToggle}
          className="p-2.5 rounded-xl bg-[#161926] hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-gray-800 transition-colors shadow-lg"
          title="Open Arena Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <span className="[writing-mode:vertical-lr] text-[10px] font-mono text-gray-500 font-bold tracking-widest uppercase mt-6">
          ARENA CHAT
        </span>
      </div>
    );
  }

  return (
    <aside className="hidden xl:flex flex-col justify-between shrink-0 w-80 bg-[#0d0f18] border-l border-[#1e2235] h-screen fixed right-0 top-0 z-30 p-4 space-y-4 pt-16">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-[#1e2235] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center text-sm">
            <Bot className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white font-display uppercase tracking-wide">ARENA CHAT</h3>
            <span className="text-[10px] font-mono text-[#00F0FF] flex items-center gap-1 font-bold">
              <span>SQUAD LOBBY</span>
            </span>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className="p-1.5 rounded-lg bg-[#161926] hover:bg-slate-800 text-gray-400 hover:text-white"
          title="Collapse Chat"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-1">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div
              key={m.id}
              className="p-3 rounded-2xl bg-[#131624] border border-[#1e2235] hover:border-[#00F0FF]/30 transition-all space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{m.avatar}</span>
                  <span className="text-[11px] font-bold text-[#00F0FF] font-display truncate max-w-[110px]">
                    {m.user}
                  </span>
                  <span className="text-[8px] bg-purple-950/80 text-purple-300 border border-purple-800/40 px-1 py-0.2 rounded font-mono">
                    {m.badge}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400">{m.time}</span>
              </div>
              <p className="text-[11px] text-gray-200 font-sans leading-relaxed pt-0.5">{m.text}</p>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
            <MessageSquare className="w-8 h-8 text-gray-600" />
            <p className="text-xs font-bold text-gray-400">No chat messages yet</p>
            <p className="text-[10px] text-gray-600">Type below to share duel room codes or send trash talk!</p>
          </div>
        )}
      </div>

      {/* Quick Emojis & Input Form */}
      <div className="space-y-2 pt-2 border-t border-[#1e2235]">
        <div className="flex justify-between items-center gap-1">
          {quickEmojis.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundFx.playClick();
                setInputMsg((prev) => prev + emoji);
              }}
              className="p-1 rounded-lg bg-[#161926] hover:bg-[#00F0FF]/20 text-xs hover:scale-110 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type trash talk / message..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 bg-[#131624] border border-[#1e2235] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF] font-sans"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-[#7928CA] text-slate-950 hover:brightness-110 shadow-md shadow-[#00F0FF]/20"
          >
            <Send className="w-3.5 h-3.5 fill-slate-950" />
          </button>
        </form>
      </div>
    </aside>
  );
};
