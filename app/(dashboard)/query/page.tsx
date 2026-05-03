import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Query — ContextMesh' };

export default function QueryPage() {
  return (
    <div className="page-enter space-y-6">
      <div>
        <p className="text-[13px] font-[var(--font-mono)] mb-2" style={{ color: 'var(--color-accent-primary)' }}>ContextMesh / Query</p>
        <h1 className="text-[32px] font-[var(--font-display)] font-700 mb-2" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>Query</h1>
        <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>Ask anything about your project context using natural language.</p>
      </div>
      <div className="card p-12 flex flex-col items-center justify-center text-center gap-4" id="query-empty-state">
        <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ background: 'var(--color-accent-subtle)', border: '1px solid rgba(0,212,180,0.15)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="var(--color-accent-primary)" strokeWidth="1.5"/><path d="M21 21L16.65 16.65" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
        <div>
          <p className="text-[15px] font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>AI query interface</p>
          <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Coming in Phase 4 — powered by Claude with semantic search over your context.</p>
        </div>
      </div>
    </div>
  );
}
