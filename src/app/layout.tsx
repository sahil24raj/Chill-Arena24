import type { Metadata } from 'next';
import './globals.css';
import { AppDashboardLayout } from '@/components/AppDashboardLayout';

export const metadata: Metadata = {
  title: 'CHILL ARENA — Premium Multiplayer Browser Gaming & Meme Arcade',
  description: 'Play instant 60 FPS multiplayer browser games with squad banter & roasts. Pen Flip, Eraser Throw, Spin Cricket, Modi Run, CID Escape, Word Builder & rapid mind duels. 0 downloads, instant fun!',
  keywords: ['Chill Arena', 'multiplayer browser games', 'pen flip', 'school vibes', 'indian meme games', 'spin cricket', 'browser esports', 'mini games online', 'squad games']
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#06080F] text-gray-100 antialiased selection:bg-[#00F0FF] selection:text-slate-950 font-sans">
        <AppDashboardLayout>{children}</AppDashboardLayout>
      </body>
    </html>
  );
}

