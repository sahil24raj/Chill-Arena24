import type { Metadata } from 'next';
import './globals.css';
import { AppDashboardLayout } from '@/components/AppDashboardLayout';

export const metadata: Metadata = {
  title: 'VIBE ARENA — Where Friends Come to Play',
  description: 'A social gaming playground where friends can create & join rooms, play quick multiplayer games, compete, joke around, and spend time together. Dost. Games. Full Vibe. Zero downloads, instant play.',
  keywords: [
    'Vibe Arena',
    'Where Friends Come to Play',
    'social gaming',
    'multiplayer party games',
    'Chor Sipahi online',
    'Raja Mantri Chor Sipahi',
    'Word Builder Pro',
    'Spin Cricket',
    'Pen Flip Battle',
    'room codes',
    'play with friends browser'
  ],
  icons: {
    icon: '/brand/vibe-arena-icon.png',
    shortcut: '/brand/vibe-arena-icon.png',
    apple: '/brand/vibe-arena-icon.png',
  },
  openGraph: {
    title: 'VIBE ARENA — Where Friends Come to Play',
    description: 'Dost. Games. Full Vibe. Create instant rooms, challenge your squad, and crown the Vibe King.',
    images: ['/brand/vibe-arena-logo.png'],
  },
  themeColor: '#080A12',
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#080A12] text-[#F8FAFC] antialiased selection:bg-[#D946EF]/30 selection:text-white font-sans">
        <AppDashboardLayout>{children}</AppDashboardLayout>
      </body>
    </html>
  );
}


