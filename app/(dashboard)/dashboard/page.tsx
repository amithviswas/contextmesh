import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Database, Search, Plug, ArrowRight } from 'lucide-react';


export const metadata: Metadata = {
  title: 'Dashboard — ContextMesh',
  description: 'Your project context hub. Query, sync, and explore your team\'s shared memory.',
};

const stats = [
  { label: 'Context items', value: '0', id: 'stat-context-items' },
  { label: 'Queries this month', value: '0', id: 'stat-queries' },
  { label: 'Integrations active', value: '0', id: 'stat-integrations' },
];

const quickActions = [
  {
    id: 'action-projects',
    href: '/projects',
    icon: Database,
    title: 'Create a project',
    desc: 'Group your context by team or codebase',
  },
  {
    id: 'action-query',
    href: '/query',
    icon: Search,
    title: 'Query your context',
    desc: 'Ask anything about your projects in natural language',
  },
  {
    id: 'action-integrations',
    href: '/integrations',
    icon: Plug,
    title: 'Connect integrations',
    desc: 'Sync context from GitHub, Slack, Jira, and Linear',
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const firstName = user.email?.split('@')[0] ?? 'there';

  return (
    <div className="space-y-10 page-enter">
      {/* Header */}
      <div>
        <p className="text-[13px] font-[var(--font-mono)] mb-2" style={{ color: 'var(--color-accent-primary)' }}>
          ContextMesh / Dashboard
        </p>
        <h1
          className="text-[36px] font-[var(--font-display)] font-700 mb-2"
          style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}
        >
          Welcome back, {firstName}
        </h1>
        <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>
          Your shared memory layer is ready. Start by creating a project.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 page-enter page-enter-delay-1" role="list" aria-label="Overview statistics">
        {stats.map((stat) => (
          <div
            key={stat.id}
            id={stat.id}
            role="listitem"
            className="card p-5"
          >
            <p className="text-[40px] font-[var(--font-display)] font-800 leading-none mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {stat.value}
            </p>
            <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Empty state / Quick actions */}
      <div className="page-enter page-enter-delay-2">
        <h2
          className="text-[18px] font-[var(--font-display)] font-600 mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Get started
        </h2>

        <div className="space-y-2">
          {quickActions.map((action, i) => (
            <a
              key={action.id}
              id={action.id}
              href={action.href}
              className="card flex items-center gap-4 p-5 group cursor-pointer transition-all duration-[250ms]"
              style={{ animationDelay: `${(i + 2) * 50}ms` }}
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-all duration-150 group-hover:scale-105"
                style={{ background: 'var(--color-accent-subtle)', border: '1px solid rgba(0,212,180,0.15)' }}
              >
                <action.icon size={18} style={{ color: 'var(--color-accent-primary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                  {action.title}
                </p>
                <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {action.desc}
                </p>
              </div>
              <ArrowRight
                size={16}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-150 -translate-x-1 group-hover:translate-x-0"
                style={{ color: 'var(--color-accent-primary)' }}
              />
            </a>
          ))}
        </div>
      </div>

      {/* Context engine coming notice */}
      <div
        className="page-enter page-enter-delay-3 rounded-[12px] p-5 flex items-start gap-4"
        style={{ background: 'var(--color-accent-subtle)', border: '1px solid rgba(0,212,180,0.15)' }}
        id="phase-notice"
      >
        <div
          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 teal-pulse"
          style={{ background: 'var(--color-accent-primary)' }}
        />
        <div>
          <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--color-accent-primary)' }}>
            Phase 1 Complete — Foundation & Auth
          </p>
          <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
            The core auth layer, workspace, and dashboard shell are live. Context engine, integrations, and AI query interface coming in Phase 2–4.
          </p>
        </div>
      </div>
    </div>
  );
}
