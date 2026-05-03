import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Query — ContextMesh' };

export default function QueryPage() {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Query
        </p>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
          Query Context
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Ask anything about your projects in natural language.
        </p>
      </div>

      {/* Fake query input — coming soon */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{
          display: 'flex', gap: '10px', alignItems: 'center',
          padding: '12px 16px', borderRadius: '10px',
          background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)',
          opacity: 0.5,
        }}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', flex: 1 }}>
            e.g. "What database did we choose and why?"
          </span>
          <span className="tag">Phase 3</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '12px', textAlign: 'center' }}>
          Natural language querying coming in Phase 3 — semantic search over your context.
        </p>
      </div>

      {/* Terminal preview */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '10px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--bg-border)',
        }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FEBC2E' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28C840' }} />
          <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            ContextMesh Query
          </span>
        </div>
        <div style={{ padding: '20px', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.8 }}>
          <p><span style={{ color: 'var(--accent)' }}>{'>'}</span> <span style={{ color: 'var(--text-secondary)' }}>query</span> <span style={{ color: 'var(--text-primary)' }}>"What auth library are we using?"</span></p>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            We use <span style={{ color: '#60A5FA' }}>@supabase/ssr</span> for server-side auth with cookie-based sessions.
          </p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '4px' }}>
            Sources: <span style={{ color: 'var(--accent)' }}>lib/supabase/server.ts</span>, <span style={{ color: 'var(--accent)' }}>proxy.ts</span>
          </p>
          <p style={{ color: 'var(--text-tertiary)', marginTop: '16px', fontSize: '12px' }}>
            ▋
          </p>
        </div>
      </div>
    </div>
  );
}
