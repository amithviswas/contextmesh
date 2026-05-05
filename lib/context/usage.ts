import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ) as any;
}

export const PLAN_QUERY_LIMITS: Record<string, number> = {
  free: 100,
  pro: 2000,
  team: Infinity,
};

export interface QueryUsage {
  used: number;
  limit: number;
  plan: string;
  remaining: number;
  percentUsed: number;
}

export async function getQueryUsage(workspaceId: string): Promise<QueryUsage> {
  const supabase = getServiceClient();

  // Start of current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Count queries this month for this workspace
  const { count } = await supabase
    .from('queries')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .gte('created_at', startOfMonth.toISOString());

  // Get workspace plan
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('plan')
    .eq('id', workspaceId)
    .maybeSingle();

  const plan = workspace?.plan ?? 'free';
  const limit = PLAN_QUERY_LIMITS[plan] ?? 100;
  const used = count ?? 0;

  return {
    used,
    limit,
    plan,
    remaining: Math.max(0, limit - used),
    percentUsed: limit === Infinity ? 0 : Math.min(100, Math.round((used / limit) * 100)),
  };
}
