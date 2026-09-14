'use client';

import React, { useState } from 'react';
import { LeftSidebar } from '@/components/LeftSidebar';
import { TopHeaderBar } from '@/components/TopHeaderBar';
import { RightChatSidebar } from '@/components/RightChatSidebar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { DailySpinModal } from '@/components/DailySpinModal';
import { BackgroundParticles } from '@/components/BackgroundParticles';

interface AppDashboardLayoutProps {
  children: React.ReactNode;
}

export function AppDashboardLayout({ children }: AppDashboardLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#06080F] text-gray-100 flex flex-col font-sans selection:bg-[#00F0FF] selection:text-slate-950 overflow-x-hidden">
      <BackgroundParticles />

      {/* Top Header Bar */}
      <TopHeaderBar
        onToggleLeftSidebar={() => setLeftCollapsed((prev) => !prev)}
        onToggleRightSidebar={() => setRightCollapsed((prev) => !prev)}
      />

      {/* Main 3-Column Body */}
      <div className="flex-1 flex w-full relative">
        {/* 1. Left Sidebar */}
        <LeftSidebar
          isCollapsed={leftCollapsed}
          onToggleCollapse={() => setLeftCollapsed((prev) => !prev)}
        />

        {/* 2. Center Content Stream */}
        <main
          className={`flex-1 transition-all duration-300 min-w-0 px-3 sm:px-6 lg:px-8 py-6 relative z-10 ${
            leftCollapsed ? 'lg:pl-24' : 'lg:pl-[272px]'
          } ${
            rightCollapsed ? 'xl:pr-16' : 'xl:pr-[336px]'
          }`}
        >
          <div className="max-w-[1440px] mx-auto space-y-12">
            {children}
            <Footer />
          </div>
        </main>

        {/* 3. Right Chat Sidebar */}
        <RightChatSidebar
          isCollapsed={rightCollapsed}
          onToggleCollapse={() => setRightCollapsed((prev) => !prev)}
        />
      </div>

      {/* Global Modals */}
      <AuthModal />
      <DailySpinModal />
    </div>
  );
}
