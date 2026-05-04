import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';
import { SOURCE_COLORS, SOURCE_LABELS, CONTEXT_TYPE_LABELS } from '@/types';
import type { ContextItem } from '@/types';

export const metadata: Metadata = {
  title: 'Dashboard — ContextMesh',
  description: 'Your project context hub.',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Resolve workspace
  const { data: membership } = await supabase
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const workspaceId = membership?.workspace_id;

  // Fetch stats in parallel
  const [projectsResult, contextResult, recentResult] = await Promise.all([
    workspaceId
      ? supabase.from('projects').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId)
      : Promise.resolve({ count: 0, error: null }),

    workspaceId
      ? supabase
          .from('context_items')
          .select('id', { count: 'exact', head: true })
          .in('project_id',
            (await supabase.from('projects').select('id').eq('workspace_id', workspaceId)).data?.map(p => p.id) ?? []
          )
      : Promise.resolve({ count: 0, error: null }),

    workspaceId
      ? supabase
          .from('context_items')
          .select('id, title, source, type, created_at, project_id, projects(name)')
          .in('project_id',
            (await supabase.from('projects').select('id').eq('workspace_id', workspaceId)).data?.map(p => p.id) ?? []
          )
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const projectCount = projectsResult.count ?? 0;
  const contextCount = contextResult.count ?? 0;
  const recentItems = (recentResult.data ?? []) as unknown as Array<ContextItem & { projects: { name: string } | null }>;

  const firstName = (user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'there').split(' ')[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Overview
        </p>
        <h1 style={{ fontSize: '30px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '6px' }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
          {projectCount === 0
            ? 'Your shared memory layer is ready — create your first project.'
            : `${projectCount} project${projectCount !== 1 ? 's' : ''}, ${contextCount} context items indexed.`}
        </p>
      </div>

      {/* Stats */}
      <div
        className="page-enter-delay-1"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}
        id="stats-grid"
        role="list"
        aria-label="Overview statistics"
      >
        {[
          { id: 'stat-context-items', value: contextCount, label: 'Context items', desc: 'indexed', href: '/projects' },
          { id: 'stat-projects', value: projectCount, label: 'Projects', desc: 'active', href: '/projects' },
          { id: 'stat-integrations', value: 0, label: 'Integrations', desc: 'connected', href: '/integrations' },
        ].map((stat) => (
          <Link
            key={stat.id}
            id={stat.id}
            href={stat.href}
            role="listitem"
            className="card"
            style={{ padding: '20px 24px', textDecoration: 'none', display: 'block' }}
          >
            <p style={{ fontSize: '38px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '6px' }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{stat.label}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{stat.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent activity or quick actions */}
      {recentItems.length > 0 ? (
        <div className="page-enter-delay-2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Recent activity
            </p>
            <Link href="/projects" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {recentItems.map((item, i) => {
              const srcColor = SOURCE_COLORS[item.source] ?? '#8A8A9A';
              return (
                <Link
                  key={item.id}
                  href={`/projects/${item.project_id}/context/${item.id}`}
                  id={`recent-item-${item.id}`}
                  className="recent-activity-link"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 20px',
                    borderBottom: i < recentItems.length - 1 ? '1px solid var(--bg-border)' : 'none',
                    textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: srcColor, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {(item.projects as unknown as { name: string } | null)?.name} · {CONTEXT_TYPE_LABELS[item.type]}
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                    {formatDistanceToNow(item.created_at)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="page-enter-delay-2">
          <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', marginBottom: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Get started
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { href: '/projects', emoji: '📁', title: 'Create a project', desc: 'Group your context by team or codebase', tag: projectCount > 0 ? null : 'Start here' },
              { href: '/query', emoji: '🔍', title: 'Query your context', desc: 'Ask anything in natural language', tag: 'Phase 3' },
              { href: '/integrations', emoji: '🔌', title: 'Connect integrations', desc: 'Auto-sync from GitHub, Slack, Jira, Linear', tag: 'Phase 4' },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', textDecoration: 'none' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', fontSize: '18px' }}>
                  {action.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{action.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{action.desc}</p>
                </div>
                {action.tag && <span className="tag" style={{ flexShrink: 0 }}>{action.tag}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Phase notice / CTA */}
      {projectCount > 0 && contextCount === 0 && (
        <Link
          href="/projects"
          id="add-context-cta"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            borderRadius: '10px', padding: '16px 20px',
            background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
            textDecoration: 'none',
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} className="teal-pulse" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>Project created — add your first context item</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Open a project and click Add Context to start building your memory layer.</p>
          </div>
          <Plus size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        </Link>
      )}

      {contextCount === 0 && projectCount === 0 && (
        <div
          id="phase-notice"
          style={{ borderRadius: '10px', padding: '16px 20px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '6px' }} className="teal-pulse" />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '3px' }}>Phase 1 complete — auth &amp; workspace foundation live</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Phase 2: create projects and add context. Phases 3–4: AI query &amp; integrations coming soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}
