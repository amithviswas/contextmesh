'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isSupabaseError = this.state.error?.message?.includes('Supabase') ||
                              this.state.error?.message?.includes('supabase') ||
                              this.state.error?.message?.includes('URL and');

      return (
        <div className="w-full max-w-[480px]">
          <div
            className="rounded-[12px] p-6"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-bg-border)',
            }}
          >
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4"
              style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.54 21H20.46A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {isSupabaseError ? (
              <>
                <h2 className="text-[16px] font-[var(--font-display)] font-700 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Configure Supabase
                </h2>
                <p className="text-[13px] mb-4" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                  This page requires Supabase credentials. Add them to your <code className="font-[var(--font-mono)] text-[12px] px-1 py-0.5 rounded" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-accent-primary)' }}>.env.local</code> file:
                </p>
                <div
                  className="rounded-[8px] p-3 font-[var(--font-mono)] text-[12px] space-y-1"
                  style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
                >
                  <p>NEXT_PUBLIC_SUPABASE_URL=<span style={{ color: 'var(--color-accent-primary)' }}>your-url</span></p>
                  <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=<span style={{ color: 'var(--color-accent-primary)' }}>your-key</span></p>
                </div>
                <p className="text-[12px] mt-3" style={{ color: 'var(--color-text-tertiary)' }}>
                  Get your credentials from the{' '}
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-primary)' }}>
                    Supabase Dashboard
                  </a>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-[16px] font-[var(--font-display)] font-700 mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Something went wrong
                </h2>
                <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {this.state.error?.message ?? 'An unexpected error occurred.'}
                </p>
              </>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
