import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Settings — ContextMesh' };

const sections = [
  { id: 'settings-profile', title: 'Profile', desc: 'Update your name, avatar, and preferences', emoji: '👤', phase: 'Phase 5' },
  { id: 'settings-workspace', title: 'Workspace', desc: 'Rename workspace, manage team members', emoji: '🏢', phase: 'Phase 5' },
  { id: 'settings-billing', title: 'Billing', desc: 'Manage your plan and payment method', emoji: '💳', phase: 'Phase 6' },
  { id: 'settings-api', title: 'API Keys', desc: 'Generate tokens for the ContextMesh API', emoji: '🔑', phase: 'Phase 6' },
];

export default function SettingsPage() {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Settings
        </p>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
          Settings
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Manage your workspace, profile, and billing.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sections.map((s) => (
          <div
            key={s.id}
            id={s.id}
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', opacity: 0.65, cursor: 'not-allowed' }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)',
              fontSize: '20px',
            }}>
              {s.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                {s.title}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {s.desc}
              </p>
            </div>
            <span className="tag">{s.phase}</span>
          </div>
        ))}
      </div>

      <div
        id="settings-placeholder"
        style={{
          borderRadius: '10px', padding: '16px 20px',
          background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Full settings panel — team management, billing, and workspace settings coming in Phases 5–6.
        </p>
      </div>
    </div>
  );
}
