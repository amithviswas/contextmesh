import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Settings — ContextMesh' };

export default function SettingsPage() {
  return (
    <div className="page-enter space-y-6">
      <div>
        <p className="text-[13px] font-[var(--font-mono)] mb-2" style={{ color: 'var(--color-accent-primary)' }}>ContextMesh / Settings</p>
        <h1 className="text-[32px] font-[var(--font-display)] font-700 mb-2" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>Settings</h1>
        <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>Manage your workspace, profile, and billing.</p>
      </div>
      <div className="card p-12 flex flex-col items-center justify-center text-center gap-4" id="settings-placeholder">
        <p className="text-[15px] font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Full settings panel</p>
        <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Team management, billing, and workspace settings coming in Phase 5–6.</p>
      </div>
    </div>
  );
}
