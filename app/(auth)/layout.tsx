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
        className="pointer-events-none fixed inset-x-0 top-0 h-[400px]"
        style={{ background: 'var(--gradient-glow)' }}
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
