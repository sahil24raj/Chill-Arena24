'use client';

import React, { useState } from 'react';
import { LeftSidebar } from '@/components/LeftSidebar';
import { TopHeaderBar } from '@/components/TopHeaderBar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { DailySpinModal } from '@/components/DailySpinModal';
import { BackgroundParticles } from '@/components/BackgroundParticles';

interface AppDashboardLayoutProps {
  children: React.ReactNode;
}

export function AppDashboardLayout({ children }: AppDashboardLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#05070E] text-gray-100 flex flex-row w-full font-sans selection:bg-[#00F0FF] selection:text-slate-950 overflow-x-hidden">
      <BackgroundParticles />

      {/* 1. Left Sidebar in flex flow (sticky top-0 h-screen) */}
      <LeftSidebar
        isCollapsed={leftCollapsed}
        onToggleCollapse={() => setLeftCollapsed((prev) => !prev)}
      />

      {/* 2. Main Right Container (Header + Content + Footer) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Sticky Top Header */}
        <TopHeaderBar
          onToggleLeftSidebar={() => setLeftCollapsed((prev) => !prev)}
        />

        {/* Scrollable Center Content */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-12 relative z-10">
          {children}
          <Footer />
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal />
      <DailySpinModal />
    </div>
  );
}
