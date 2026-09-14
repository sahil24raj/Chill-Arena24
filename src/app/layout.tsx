import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BackgroundParticles } from '@/components/BackgroundParticles';
import { AuthModal } from '@/components/AuthModal';
import { DailySpinModal } from '@/components/DailySpinModal';

export const metadata: Metadata = {
  title: 'MemeVerse Arena — Multiplayer Mini-Game Platform | Pen Flip, School Vibes & Meme Duels',
  description: 'Instant multiplayer browser mini-games with friends. Play Pen Flip, Eraser Throw, Spin Cricket, Caught Modi, Word Builder, and rapid mind duels. No downloads, 60 FPS esports action!',
  keywords: ['Meme games', 'multiplayer browser games', 'pen flip', 'school vibes', 'indian meme games', 'spin cricket', 'browser esports', 'mini games online']
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07080c] text-gray-100 antialiased flex flex-col relative selection:bg-[#00F0FF] selection:text-slate-950 font-sans">
        <BackgroundParticles />
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-6 relative z-10">
          {children}
        </main>
        <Footer />
        <AuthModal />
        <DailySpinModal />
      </body>
    </html>
  );
}
