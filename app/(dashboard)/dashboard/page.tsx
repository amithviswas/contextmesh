import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard — ContextMesh',
  description: 'Your project context hub.',
};

const stats = [
  { label: 'Context items', value: '0', id: 'stat-context-items', desc: 'indexed so far' },
  { label: 'Queries', value: '0', id: 'stat-queries', desc: 'this month' },
  { label: 'Integrations', value: '0', id: 'stat-integrations', desc: 'connected' },
];

const quickActions = [
  {
    id: 'action-projects',
    href: '/projects',
    emoji: '📁',
    title: 'Create a project',
    desc: 'Group your context by team or codebase',
    tag: 'Phase 2',
  },
  {
    id: 'action-query',
    href: '/query',
    emoji: '🔍',
    title: 'Query your context',
    desc: 'Ask anything in natural language and get sourced answers',
    tag: 'Phase 3',
  },
  {
    id: 'action-integrations',
    href: '/integrations',
    emoji: '🔌',
    title: 'Connect integrations',
    desc: 'Auto-sync context from GitHub, Slack, Jira, and Linear',
    tag: 'Phase 4',
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const firstName = (user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'there')
    .split(' ')[0];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── Header ── */}
      <div>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Overview
        </p>
        <h1 style={{ fontSize: '30px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '6px' }}>
          Good evening, {firstName} 👋
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Your shared memory layer is ready. Start by creating a project below.
        </p>
      </div>

      {/* ── Stats ── */}
      <div
        className="page-enter-delay-1"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}
        id="stats-grid"
        role="list"
        aria-label="Overview statistics"
      >
        {stats.map((stat) => (
          <div key={stat.id} id={stat.id} role="listitem" className="card" style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: '38px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '6px' }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
              {stat.label}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {stat.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="page-enter-delay-2">
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', marginBottom: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Get started
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {quickActions.map((action, i) => (
            <Link
              key={action.id}
              id={action.id}
              href={action.href}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                fontSize: '18px',
              }}>
                {action.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {action.title}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {action.desc}
                </p>
              </div>
              <span className="tag" style={{ flexShrink: 0 }}>{action.tag}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Phase notice ── */}
      <div
        id="phase-notice"
        className="page-enter-delay-3"
        style={{
          borderRadius: '10px',
          padding: '16px 20px',
          background: 'var(--accent-subtle)',
          border: '1px solid var(--accent-border)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '6px' }} className="teal-pulse" />
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '3px' }}>
            Phase 1 complete — Auth &amp; workspace foundation live
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Context engine, integrations, and AI query interface are coming in Phases 2–4.
          </p>
        </div>
      </div>
    </div>
  );
}
