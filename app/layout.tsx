import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ContextMesh — Shared memory for AI-powered teams',
  description: 'Stop repeating yourself to every AI. ContextMesh gives your development team a shared memory layer.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'ContextMesh',
    description: 'Shared memory for AI-powered teams',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
