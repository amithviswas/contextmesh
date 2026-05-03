import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Projects — ContextMesh' };

export default function ProjectsPage() {
  return (
    <div className="page-enter space-y-6">
      <div>
        <p className="text-[13px] font-[var(--font-mono)] mb-2" style={{ color: 'var(--color-accent-primary)' }}>ContextMesh / Projects</p>
        <h1 className="text-[32px] font-[var(--font-display)] font-700 mb-2" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>Projects</h1>
        <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>Organize your context by project or team.</p>
      </div>
      <div className="card p-12 flex flex-col items-center justify-center text-center gap-4" id="projects-empty-state">
        <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ background: 'var(--color-accent-subtle)', border: '1px solid rgba(0,212,180,0.15)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 7C3 5.89543 3.89543 5 5 5H10L12 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <p className="text-[15px] font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>No projects yet</p>
          <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Project creation coming in Phase 2 — the context engine.</p>
        </div>
      </div>
    </div>
  );
}
