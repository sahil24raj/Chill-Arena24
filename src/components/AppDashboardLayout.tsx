'use client';

import React, { useEffect } from 'react';
import { TopHeaderBar } from '@/components/TopHeaderBar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { DailySpinModal } from '@/components/DailySpinModal';
import { BackgroundParticles } from '@/components/BackgroundParticles';
import { useAppStore } from '@/store/useAppStore';

interface AppDashboardLayoutProps {
  children: React.ReactNode;
}

export function AppDashboardLayout({ children }: AppDashboardLayoutProps) {
  const initAuthListener = useAppStore((state) => state.initAuthListener);

  useEffect(() => {
    const unsub = initAuthListener();
    return () => {
      if (unsub) unsub();
    };
  }, [initAuthListener]);

  return (
    <div className="min-h-screen w-full bg-[#05070E] text-gray-100 flex flex-col font-sans selection:bg-[#00F0FF] selection:text-slate-950 relative overflow-x-hidden">
      <BackgroundParticles />

      {/* Pinned Top Navigation Bar */}
      <TopHeaderBar />

      {/* Main Full-Width Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-[1540px] mx-auto space-y-12 pb-12">
          {children}
          <Footer />
        </div>
      </main>

      {/* Global Modals */}
      <AuthModal />
      <DailySpinModal />
    </div>
  );
}
