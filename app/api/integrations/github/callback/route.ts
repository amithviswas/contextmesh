import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { encryptToken, getGitHubUser, getGitHubRepos, registerGitHubWebhook } from '@/lib/integrations/github';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !stateParam) {
    redirect('/integrations?error=github_denied');
  }

  // Decode state
  let workspaceId: string;
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf8'));
    workspaceId = decoded.workspace_id;
  } catch {
    redirect('/integrations?error=invalid_state');
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_INTEGRATION_CLIENT_ID,
      client_secret: process.env.GITHUB_INTEGRATION_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    redirect('/integrations?error=github_token_failed');
  }

  const accessToken: string = tokenData.access_token;

  // Get GitHub user info
  const ghUser = await getGitHubUser(accessToken);
  if (!ghUser) redirect('/integrations?error=github_user_failed');

  // Get user's repos and auto-register webhooks on the first 3 pushed repos
  const repos = await getGitHubRepos(accessToken);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET ?? 'dev-secret';
  const webhookUrl = `${appUrl}/api/integrations/github/webhook`;

  // Get the user's projects to find which project_id to map to
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createServiceClient()) as any;
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('workspace_id', workspaceId)
    .limit(1);

  const defaultProjectId = projects?.[0]?.id ?? null;

  // Register webhooks on up to 3 most recently pushed repos
  const repoMappings: Array<{ repo_full_name: string; project_id: string; hook_id: number }> = [];
  for (const repo of repos.slice(0, 3)) {
    if (!defaultProjectId) break;
    const hookId = await registerGitHubWebhook(
      accessToken,
      repo.owner.login,
      repo.name,
      webhookUrl,
      webhookSecret
    );
    if (hookId) {
      repoMappings.push({
        repo_full_name: repo.full_name,
        project_id: defaultProjectId,
        hook_id: hookId,
      });
    }
  }

  // Store encrypted token and config in integrations table
  const encryptedToken = encryptToken(accessToken);

  await supabase
    .from('integrations')
    .upsert({
      workspace_id: workspaceId,
      provider: 'github',
      status: 'active',
      access_token_encrypted: encryptedToken,
      config: {
        github_login: ghUser.login,
        github_avatar: ghUser.avatar_url,
        github_repos: repoMappings,
        webhook_secret: webhookSecret,
      },
      last_synced_at: new Date().toISOString(),
    }, { onConflict: 'workspace_id,provider' });

  redirect('/integrations?connected=github');
}
