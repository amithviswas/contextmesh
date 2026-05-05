import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: membership } = await sb
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) redirect('/dashboard');

  const state = Buffer.from(JSON.stringify({ workspace_id: membership.workspace_id })).toString('base64');

  const clientId = process.env.GITHUB_INTEGRATION_CLIENT_ID;
  if (!clientId) {
    redirect('/integrations?error=github_not_configured');
  }

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?` +
    `client_id=${clientId}` +
    `&scope=repo,admin:repo_hook` +
    `&state=${state}`;

  redirect(githubAuthUrl);
}
