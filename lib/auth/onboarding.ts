import { createClient as createServiceClient } from '@supabase/supabase-js';

/**
 * Creates workspace + owner membership for a new user.
 * Uses the service role key (bypasses RLS) so it can insert freely.
 * Idempotent — safe to call multiple times for the same user.
 */
export async function ensureWorkspace(userId: string, email: string): Promise<string> {
  // Use raw supabase-js client with service role to bypass RLS
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if user already has a workspace
  const { data: existing } = await supabase
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing?.workspace_id) return existing.workspace_id as string;

  // Create workspace slug from email prefix
  const baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  const slug = `${baseSlug}-${Date.now()}`;
  const name = `${email.split('@')[0]}'s workspace`;

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .insert({ name, slug, plan: 'free' })
    .select('id')
    .single();

  if (wsError || !workspace) {
    throw new Error(`Failed to create workspace: ${wsError?.message ?? 'unknown error'}`);
  }

  const workspaceId = (workspace as { id: string }).id;

  // Add user as owner
  const { error: memberError } = await supabase.from('memberships').insert({
    user_id: userId,
    workspace_id: workspaceId,
    role: 'owner',
  });

  if (memberError) {
    throw new Error(`Failed to create membership: ${memberError.message}`);
  }

  return workspaceId;
}
