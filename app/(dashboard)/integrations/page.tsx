import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Integrations — ContextMesh' };

export default function IntegrationsPage() {
  const integrations = [
    { id: 'int-github', name: 'GitHub', desc: 'Sync commits, PRs, and issues', status: 'coming', icon: '⌥' },
    { id: 'int-slack', name: 'Slack', desc: 'Capture decisions from conversations', status: 'coming', icon: '#' },
    { id: 'int-jira', name: 'Jira', desc: 'Sync issues and sprint data (Pro)', status: 'pro', icon: 'J' },
    { id: 'int-linear', name: 'Linear', desc: 'Sync issues and project cycles (Pro)', status: 'pro', icon: 'L' },
  ];

  return (
    <div className="page-enter space-y-6">
      <div>
        <p className="text-[13px] font-[var(--font-mono)] mb-2" style={{ color: 'var(--color-accent-primary)' }}>ContextMesh / Integrations</p>
        <h1 className="text-[32px] font-[var(--font-display)] font-700 mb-2" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>Integrations</h1>
        <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>Connect your tools to automatically ingest context.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {integrations.map((intg) => (
          <div key={intg.id} id={intg.id} className="card p-5 flex items-center gap-4 opacity-70">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center font-[var(--font-mono)] font-500 text-[14px]" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-bg-border)' }}>
              {intg.icon}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-medium" style={{ color: 'var(--color-text-primary)' }}>{intg.name}</p>
              <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>{intg.desc}</p>
            </div>
            <span className="text-[11px] font-[var(--font-mono)] px-2 py-1 rounded-[5px]" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-tertiary)', border: '1px solid var(--color-bg-border)' }}>
              {intg.status === 'pro' ? 'Pro' : 'Phase 3'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
