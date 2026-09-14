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
    <div className="min-h-screen bg-[#05070E] text-gray-100 flex flex-col font-sans selection:bg-[#00F0FF] selection:text-slate-950 overflow-x-hidden">
      <BackgroundParticles />

      {/* Top Header Bar */}
      <TopHeaderBar
        onToggleLeftSidebar={() => setLeftCollapsed((prev) => !prev)}
      />

      {/* Main App Body */}
      <div className="flex-1 flex w-full relative">
        {/* Left Navigation Sidebar */}
        <LeftSidebar
          isCollapsed={leftCollapsed}
          onToggleCollapse={() => setLeftCollapsed((prev) => !prev)}
        />

        {/* Center Main Gaming Area */}
        <main
          className={`flex-1 transition-all duration-300 min-w-0 px-3 sm:px-6 lg:px-8 py-6 relative z-10 ${
            leftCollapsed ? 'md:pl-24' : 'md:pl-[272px]'
          }`}
        >
          <div className="max-w-[1520px] mx-auto space-y-12">
            {children}
            <Footer />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal />
      <DailySpinModal />
    </div>
  );
}
