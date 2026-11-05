import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AnalyticsProvider } from './providers';
import CookieBanner from '@/components/ui/CookieBanner';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.startsWith('http')
  ? process.env.NEXT_PUBLIC_APP_URL
  : 'https://contextmesh.vercel.app';

export const viewport: Viewport = {
  themeColor: '#0B0D17',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ContextMesh — Shared Memory for AI-Powered Teams',
    template: '%s | ContextMesh',
  },
  description: 'Stop repeating context to every AI. ContextMesh gives your team a shared memory layer — sync from GitHub, Slack, and Jira, then query it instantly with AI.',
  keywords: ['AI context', 'shared memory', 'AI agents', 'developer tools', 'GitHub integration', 'team collaboration', 'LLM context'],
  authors: [{ name: 'ContextMesh' }],
  creator: 'ContextMesh',
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: 'ContextMesh — Shared Memory for AI-Powered Teams',
    description: 'Stop repeating context to every AI. Query your team knowledge in seconds.',
    siteName: 'ContextMesh',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ContextMesh — Shared memory for AI-powered teams' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ContextMesh — Shared Memory for AI Teams',
    description: 'Stop repeating context to every AI. Query your team knowledge in seconds.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning>
        <Suspense>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </Suspense>
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
