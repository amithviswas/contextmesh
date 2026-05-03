import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Integrations — ContextMesh' };

const integrations = [
  {
    id: 'int-github',
    name: 'GitHub',
    desc: 'Sync commits, pull requests, and issues automatically',
    status: 'Phase 4',
    icon: '⌥',
    color: '#6e40c9',
  },
  {
    id: 'int-slack',
    name: 'Slack',
    desc: 'Capture decisions and blockers from conversations',
    status: 'Phase 4',
    icon: '#',
    color: '#4A154B',
  },
  {
    id: 'int-jira',
    name: 'Jira',
    desc: 'Sync issues, epics, and sprint data',
    status: 'Pro',
    icon: 'J',
    color: '#0052CC',
  },
  {
    id: 'int-linear',
    name: 'Linear',
    desc: 'Sync issues and project cycles',
    status: 'Pro',
    icon: 'L',
    color: '#5E6AD2',
  },
];

export default function IntegrationsPage() {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Integrations
        </p>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
          Integrations
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Connect your tools to automatically ingest context.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {integrations.map((intg) => (
          <div
            key={intg.id}
            id={intg.id}
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', opacity: 0.7 }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${intg.color}18`,
              border: `1px solid ${intg.color}30`,
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '15px',
              color: intg.color,
            }}>
              {intg.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                {intg.name}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {intg.desc}
              </p>
            </div>
            <span
              className="tag"
              style={intg.status === 'Pro' ? {
                background: 'rgba(251,191,36,0.1)',
                color: '#FBBF24',
                borderColor: 'rgba(251,191,36,0.25)',
              } : {}}
            >
              {intg.status}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          borderRadius: '10px', padding: '16px 20px',
          background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Integrations with GitHub, Slack, Jira, and Linear are coming in Phase 4.
          Pro integrations will be available with the Pro plan ($19/mo).
        </p>
      </div>
    </div>
  );
}
