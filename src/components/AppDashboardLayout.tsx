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
    <div className="h-screen w-screen bg-[#05070E] text-gray-100 flex flex-row overflow-hidden font-sans selection:bg-[#00F0FF] selection:text-slate-950">
      <BackgroundParticles />

      {/* 1. Left Sidebar: Fixed in place on the left, does not scroll with main content */}
      <LeftSidebar
        isCollapsed={leftCollapsed}
        onToggleCollapse={() => setLeftCollapsed((prev) => !prev)}
      />

      {/* 2. Right Viewport: Pinned Top Header + Smooth Scrollable Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 relative">
        {/* Pinned Top Navigation Bar */}
        <TopHeaderBar
          onToggleLeftSidebar={() => setLeftCollapsed((prev) => !prev)}
        />

        {/* Independently Scrollable Gaming Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 scroll-smooth">
          <div className="max-w-[1540px] mx-auto space-y-12 pb-12">
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
