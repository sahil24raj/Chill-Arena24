'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface GameTimerProps {
  initialSeconds: number;
  onExpire?: () => void;
  label?: string;
  isPaused?: boolean;
}

export const GameTimer: React.FC<GameTimerProps> = ({
  initialSeconds,
  onExpire,
  label = 'Time Left',
  isPaused = false
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) {
      if (timeLeft === 0 && onExpire) {
        onExpire();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpire) onExpire();
          return 0;
        }
        if (prev <= 6) {
          soundFx.playClick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isPaused, onExpire]);

  const percentage = Math.max(0, Math.min(100, (timeLeft / initialSeconds) * 100));
  const isUrgent = timeLeft <= 5;

  return (
    <div className="flex items-center gap-3 bg-[#0a0f1d]/90 border border-white/10 px-4 py-2 rounded-2xl shadow-lg backdrop-blur-md">
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg className="w-8 h-8 transform -rotate-90">
          <circle
            cx="16"
            cy="16"
            r="13"
            stroke="currentColor"
            strokeWidth="3"
            className="text-white/10"
            fill="transparent"
          />
          <circle
            cx="16"
            cy="16"
            r="13"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={81.68}
            strokeDashoffset={81.68 - (81.68 * percentage) / 100}
            className={`transition-all duration-1000 ${
              isUrgent ? 'text-red-500 animate-pulse' : 'text-[#00F0FF]'
            }`}
            fill="transparent"
            strokeLinecap="round"
          />
        </svg>
        <Clock className={`w-3.5 h-3.5 absolute ${isUrgent ? 'text-red-400' : 'text-[#00F0FF]'}`} />
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold leading-none">
          {label}
        </span>
        <span
          className={`text-base font-black font-mono leading-tight ${
            isUrgent ? 'text-red-400 scale-105 animate-bounce' : 'text-white'
          }`}
        >
          {timeLeft}s
        </span>
      </div>
    </div>
  );
};
