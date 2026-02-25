import type { Metadata } from 'next';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.cinecause.com'),
  title: 'CineCause - Donate to Charity, Inspired by Movies',
  description: 'Discover movies and TV shows that inspire giving. Browse popular titles and donate to charity.',
  openGraph: {
    title: 'CineCause - Donate to Charity, Inspired by Movies',
    description: 'Discover movies and TV shows that inspire giving. Browse popular titles and donate to charity.',
    url: '/',
    siteName: 'CineCause',
    type: 'website',
    images: [
      {
        url: '/images/cinecause-big.png',
        width: 791,
        height: 458,
        alt: 'CineCause - Watch Films That Matter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineCause - Donate to Charity, Inspired by Movies',
    description: 'Discover movies and TV shows that inspire giving. Browse popular titles and donate to charity.',
    images: ['/images/cinecause-big.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-variant="editorial">
      <body className={`${plusJakartaSans.variable} ${fraunces.variable} app-shell flex min-h-screen flex-col antialiased`}>
        <Header />
        <main className="flex-1">
          <div className="page-shell">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
