import type { ReactNode } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

interface Props { children: ReactNode }

export default function MarketingLayout({ children }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--bg-border)',
      }}>
        <Logo size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {[
            { href: '/#features', label: 'Features' },
            { href: '/pricing', label: 'Pricing' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="marketing-nav-link">
              {label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/login" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', padding: '7px 16px', borderRadius: '7px', border: '1px solid var(--bg-border)', background: 'transparent' }}>
            Sign In
          </Link>
          <Link href="/login" className="btn btn-primary" style={{ fontSize: '13px', padding: '7px 16px', textDecoration: 'none' }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ flex: 1, paddingTop: '60px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--bg-border)', padding: '32px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Logo size="sm" />
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { href: '/pricing', label: 'Pricing' },
              { href: '/privacy', label: 'Privacy' },
              { href: '/terms', label: 'Terms' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ fontSize: '13px', color: 'var(--text-tertiary)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} ContextMesh. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
