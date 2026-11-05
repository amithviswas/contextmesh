import type { Metadata } from 'next';
import Logo from '@/components/ui/Logo';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export const metadata: Metadata = {
  title: 'ContextMesh — Sign in',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Top glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[520px]"
        style={{ background: 'var(--gradient-glow)' }}
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 line-grid" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        style={{ background: 'rgba(108,92,231,0.18)' }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <Logo size="md" />
        <a
          href="/"
          className="text-[13px] transition-colors duration-150 hover:text-[var(--color-text-primary)]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          ← Back to home
        </a>
      </nav>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
          © {new Date().getFullYear()} ContextMesh.{' '}
          <a
            href="/legal/privacy"
            className="hover:text-[var(--color-text-secondary)] transition-colors"
          >
            Privacy
          </a>
          {' · '}
          <a
            href="/legal/terms"
            className="hover:text-[var(--color-text-secondary)] transition-colors"
          >
            Terms
          </a>
        </p>
      </footer>
    </div>
  );
}
