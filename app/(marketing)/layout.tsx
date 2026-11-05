import type { ReactNode } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

interface Props { children: ReactNode }

export default function MarketingLayout({ children }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav className="marketing-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        background: 'rgba(11,13,23,0.72)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        borderBottom: '1px solid var(--bg-border)',
      }}>
        <Logo size="sm" />
        <div className="marketing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
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
          <Link href="/login" className="btn btn-ghost marketing-nav-signin" style={{ height: '36px', fontSize: '13px' }}>
            Sign In
          </Link>
          <Link href="/login" className="btn btn-primary" style={{ height: '36px', fontSize: '13px', padding: '0 16px' }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ flex: 1, paddingTop: '64px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--bg-border)', padding: '36px 24px', background: 'rgba(18,21,42,0.5)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Logo size="sm" />
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { href: '/pricing', label: 'Pricing' },
              { href: '/privacy', label: 'Privacy' },
              { href: '/terms', label: 'Terms' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="marketing-nav-link" style={{ fontSize: '13px' }}>{label}</Link>
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
