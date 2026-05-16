import type { Workspace } from '@/types';

const LIMITS = {
  projects:    { free: 1,   pro: 5,        team: Infinity },
  queries:     { free: 100, pro: 2000,      team: Infinity },
  members:     { free: 1,   pro: 5,         team: Infinity },
  contextItems:{ free: 500, pro: 10000,     team: Infinity },
};

type Plan = 'free' | 'pro' | 'team';
type Resource = keyof typeof LIMITS;

function limit(plan: Plan, resource: Resource): number {
  return LIMITS[resource][plan] ?? LIMITS[resource]['free'];
}

export function canAddProject(workspace: Workspace, current: number): boolean {
  return current < limit(workspace.plan, 'projects');
}

export function canQuery(workspace: Workspace, queriesThisMonth: number): boolean {
  return queriesThisMonth < limit(workspace.plan, 'queries');
}

export function canAddMember(workspace: Workspace, current: number): boolean {
  return current < limit(workspace.plan, 'members');
}

export function canConnectIntegration(workspace: Workspace, provider: string): boolean {
  if (workspace.plan === 'free' && !['github'].includes(provider)) return false;
  if (workspace.plan === 'pro' && provider === 'linear') return false;
  return true;
}

export function getLimit(workspace: Workspace, resource: Resource): number {
  const l = limit(workspace.plan, resource);
  return l === Infinity ? -1 : l; // -1 = unlimited in API responses
}

export function getLimitDisplay(workspace: Workspace, resource: Resource): string {
  const l = limit(workspace.plan, resource);
  return l === Infinity ? 'Unlimited' : String(l);
}

export const PLAN_NAMES: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
};

export const PLAN_PRICES: Record<string, string> = {
  free: '$0',
  pro: '$19/mo',
  team: '$49/mo',
};
