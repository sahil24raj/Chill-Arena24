import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BackgroundParticles } from '@/components/BackgroundParticles';
import { AuthModal } from '@/components/AuthModal';
import { DailySpinModal } from '@/components/DailySpinModal';

export const metadata: Metadata = {
  title: 'MemeVerse - Gen-Z Viral Meme Gaming Platform',
  description: 'Play funny, addictive browser games inspired by viral memes, Indian internet culture, and trending social media moments!'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070312] text-gray-100 antialiased flex flex-col relative selection:bg-pink-500 selection:text-white">
        <BackgroundParticles />
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-8 relative z-10">
          {children}
        </main>
        <Footer />
        <AuthModal />
        <DailySpinModal />
      </body>
    </html>
  );
}
