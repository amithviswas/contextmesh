import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { decryptToken, deleteGitHubWebhook } from '@/lib/integrations/github';

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: membership } = await sb
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 404 });

  const { data: integration } = await sb
    .from('integrations')
    .select('access_token_encrypted, config')
    .eq('workspace_id', membership.workspace_id)
    .eq('provider', 'github')
    .maybeSingle();

  if (integration?.access_token_encrypted) {
    try {
      const accessToken = decryptToken(integration.access_token_encrypted);
      const repos = (integration.config?.github_repos ?? []) as Array<{
        repo_full_name: string;
        hook_id: number;
      }>;

      // Remove webhooks from all registered repos
      for (const repo of repos) {
        const [owner, repoName] = repo.repo_full_name.split('/');
        await deleteGitHubWebhook(accessToken, owner, repoName, repo.hook_id);
      }
    } catch (e) {
      console.error('Error cleaning up GitHub webhooks:', e);
    }
  }

  // Mark integration as disconnected
  await sb
    .from('integrations')
    .update({ status: 'disconnected', access_token_encrypted: null })
    .eq('workspace_id', membership.workspace_id)
    .eq('provider', 'github');

  return NextResponse.json({ data: { disconnected: true } });
}
