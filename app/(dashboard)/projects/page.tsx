import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Projects — ContextMesh' };

export default function ProjectsPage() {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Projects
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
              Projects
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Organize your context by project or team.
            </p>
          </div>
          <button
            id="new-project-btn"
            disabled
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '0 16px', height: '36px', borderRadius: '8px',
              background: 'var(--accent)', color: '#0A0A0F',
              fontFamily: 'inherit', fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: 'not-allowed', opacity: 0.5,
            }}
          >
            + New Project
          </button>
        </div>
      </div>

      <div
        id="projects-empty-state"
        className="card"
        style={{
          padding: '64px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', gap: '16px',
        }}
      >
        <div style={{
          width: '56px', height: '56px', borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
          fontSize: '24px',
        }}>
          📁
        </div>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No projects yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '320px' }}>
            Project creation is coming in Phase 2 — the context engine.
          </p>
        </div>
        <span className="tag">Phase 2</span>
      </div>
    </div>
  );
}
