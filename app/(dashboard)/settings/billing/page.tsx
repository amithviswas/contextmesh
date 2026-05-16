import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import BillingClient from './BillingClient';

export const metadata: Metadata = { title: 'Billing — ContextMesh' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const service = getService();

  const { data: membership } = await service
    .from('memberships').select('workspace_id, role').eq('user_id', user.id).maybeSingle();

  if (!membership?.workspace_id) redirect('/dashboard');

  const { data: workspace } = await service
    .from('workspaces')
    .select('id, name, plan, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, plan_period_end')
    .eq('id', membership.workspace_id)
    .maybeSingle();

  // Fetch usage stats
  const projectIds = ((await service.from('projects').select('id').eq('workspace_id', membership.workspace_id)).data ?? []).map((p: { id: string }) => p.id);

  const [projectCount, contextCount, queryCount, memberCount] = await Promise.all([
    service.from('projects').select('id', { count: 'exact', head: true }).eq('workspace_id', membership.workspace_id).then((r: { count: number }) => r.count ?? 0),
    projectIds.length
      ? service.from('context_items').select('id', { count: 'exact', head: true }).in('project_id', projectIds).then((r: { count: number }) => r.count ?? 0)
      : Promise.resolve(0),
    service.from('queries').select('id', { count: 'exact', head: true }).eq('workspace_id', membership.workspace_id)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .then((r: { count: number }) => r.count ?? 0),
    service.from('memberships').select('id', { count: 'exact', head: true }).eq('workspace_id', membership.workspace_id).then((r: { count: number }) => r.count ?? 0),
  ]);

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Billing</p>
        <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Plan & Usage
        </h1>
      </div>
      <BillingClient
        workspace={workspace}
        myRole={membership.role}
        usage={{ projects: projectCount, contextItems: contextCount, queriesThisMonth: queryCount, members: memberCount }}
      />
    </div>
  );
}
