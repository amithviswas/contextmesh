import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { Plus, ArrowRight, Zap, Users, Plug, Database } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';
import { SOURCE_COLORS, CONTEXT_TYPE_LABELS } from '@/types';
import ActivityChart from '@/components/dashboard/ActivityChart';
import SourceBreakdown from '@/components/dashboard/SourceBreakdown';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard — ContextMesh',
  description: 'Your project context hub.',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const service = getService();

  // ── Resolve workspace ──────────────────────────────────────────────────────
  const { data: membership } = await service
    .from('memberships')
    .select('workspace_id, role, display_name, onboarding_completed_steps')
    .eq('user_id', user.id)
    .maybeSingle();

  const workspaceId: string | null = membership?.workspace_id ?? null;

  // ── Get project IDs ────────────────────────────────────────────────────────
  const projectIds: string[] = workspaceId
    ? ((await service.from('projects').select('id').eq('workspace_id', workspaceId)).data?.map((p: { id: string }) => p.id) ?? [])
    : [];

  // ── Parallel data fetches ──────────────────────────────────────────────────
  const [
    projectsRes,
    contextRes,
    queriesRes,
    integrationsRes,
    membersRes,
    recentContextRes,
    last14dRes,
  ] = await Promise.all([
    // Project count
    workspaceId
      ? service.from('projects').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId)
      : { count: 0 },

    // Context item count
    projectIds.length
      ? service.from('context_items').select('id', { count: 'exact', head: true }).in('project_id', projectIds)
      : { count: 0 },

    // Query count this month
    workspaceId
      ? service.from('queries')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspaceId)
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      : { count: 0 },

    // Active integrations
    workspaceId
      ? service.from('integrations').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId).eq('status', 'connected')
      : { count: 0 },

    // Member count
    workspaceId
      ? service.from('memberships').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId)
      : { count: 0 },

    // Recent context items (activity feed)
    projectIds.length
      ? service.from('context_items')
          .select('id, title, source, type, created_at, project_id, projects(name)')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false })
          .limit(20)
      : { data: [] },

    // Last 14 days of context items for chart
    projectIds.length
      ? service.from('context_items')
          .select('source, created_at')
          .in('project_id', projectIds)
          .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      : { data: [] },
  ]);

  const projectCount = projectsRes.count ?? 0;
  const contextCount = contextRes.count ?? 0;
  const queryCount = queriesRes.count ?? 0;
  const integrationCount = integrationsRes.count ?? 0;
  const memberCount = membersRes.count ?? 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentItems = (recentContextRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const last14d = (last14dRes.data ?? []) as any[];

  // ── Build 14-day activity chart data ───────────────────────────────────────
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const day = last14d.filter((item) => item.created_at.startsWith(dateStr));
    return {
      date: label,
      github: day.filter((x) => x.source === 'github').length,
      slack: day.filter((x) => x.source === 'slack').length,
      manual: day.filter((x) => !['github', 'slack'].includes(x.source)).length,
      total: day.length,
    };
  });

  // ── Source breakdown ────────────────────────────────────────────────────────
  const sourceMap: Record<string, number> = {};
  last14d.forEach((item) => { sourceMap[item.source] = (sourceMap[item.source] ?? 0) + 1; });
  const sourceTotal = Object.values(sourceMap).reduce((a, b) => a + b, 0);
  const sourceStats = Object.entries(sourceMap)
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({
      source: source as 'github' | 'slack' | 'manual',
      count,
      percent: sourceTotal > 0 ? Math.round((count / sourceTotal) * 100) : 0,
    }));

  // ── User greeting ──────────────────────────────────────────────────────────
  const displayName = membership?.display_name ?? user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'there';
  const firstName = displayName.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const completedSteps: string[] = membership?.onboarding_completed_steps ?? [];
  const showOnboarding = completedSteps.length < 5;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Overview</p>
        <h1 style={{ fontSize: '30px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '6px' }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
          {projectCount === 0
            ? 'Your shared memory layer is ready — create your first project.'
            : `${projectCount} project${projectCount !== 1 ? 's' : ''} · ${contextCount} context items indexed.`}
        </p>
      </div>

      {/* Onboarding checklist */}
      {showOnboarding && (
        <DashboardClient completedSteps={completedSteps} />
      )}

      {/* 4 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }} className="stats-grid">
        {[
          { id: 'stat-context', icon: Database, value: contextCount, label: 'Context Items', sub: 'indexed', href: '/projects', color: '#00D4B4' },
          { id: 'stat-queries', icon: Zap, value: queryCount, label: 'AI Queries', sub: 'this month', href: '/query', color: '#A78BFA' },
          { id: 'stat-integrations', icon: Plug, value: integrationCount, label: 'Integrations', sub: 'connected', href: '/integrations', color: '#6e40c9' },
          { id: 'stat-members', icon: Users, value: memberCount, label: 'Team Members', sub: 'in workspace', href: '/settings', color: '#FBBF24' },
        ].map(({ id, icon: Icon, value, label, sub, href, color }) => (
          <Link
            key={id}
            id={id}
            href={href}
            className="card"
            style={{ padding: '18px 20px', textDecoration: 'none', display: 'block' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <p style={{ fontSize: '34px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '4px' }}>
              {value}
            </p>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1px' }}>{label}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{sub}</p>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      {contextCount > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }} className="charts-grid">
          <div className="card" style={{ padding: '20px 22px' }}>
            <ActivityChart data={chartData} />
          </div>
          <div className="card" style={{ padding: '20px 22px' }}>
            <SourceBreakdown stats={sourceStats} total={sourceTotal} />
          </div>
        </div>
      )}

      {/* Activity feed */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Recent Activity
          </p>
          {recentItems.length > 0 && (
            <Link href="/projects" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {recentItems.length > 0 ? (
          <div className="card" style={{ overflow: 'hidden' }}>
            {recentItems.slice(0, 10).map((item, i) => {
              const srcColor = SOURCE_COLORS[item.source as keyof typeof SOURCE_COLORS] ?? '#8A8A9A';
              return (
                <Link
                  key={item.id}
                  href={`/projects/${item.project_id}`}
                  id={`activity-${item.id}`}
                  className="recent-activity-link"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 20px',
                    borderBottom: i < Math.min(recentItems.length, 10) - 1 ? '1px solid var(--bg-border)' : 'none',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: `${srcColor}18`, border: `1px solid ${srcColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px' }}>
                    {item.source === 'github' ? '⚡' : item.source === 'slack' ? '💬' : '📝'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {item.projects?.name} · {CONTEXT_TYPE_LABELS[item.type as keyof typeof CONTEXT_TYPE_LABELS] ?? item.type}
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
                    {formatDistanceToNow(item.created_at)}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { href: '/projects', emoji: '📁', title: 'Create a project', desc: 'Group your context by team or codebase' },
              { href: '/integrations', emoji: '🔌', title: 'Connect GitHub or Slack', desc: 'Auto-sync context from your tools' },
              { href: '/query', emoji: '🤖', title: 'Ask ContextMesh AI', desc: 'Get answers from your project context instantly' },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', textDecoration: 'none' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', fontSize: '16px' }}>
                  {action.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{action.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{action.desc}</p>
                </div>
                <Plus size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
