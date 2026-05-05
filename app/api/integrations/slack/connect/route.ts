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

  const clientId = process.env.SLACK_CLIENT_ID;
  if (!clientId) {
    redirect('/integrations?error=slack_not_configured');
  }

  const state = Buffer.from(JSON.stringify({ workspace_id: membership.workspace_id })).toString('base64');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const slackAuthUrl =
    `https://slack.com/oauth/v2/authorize?` +
    `client_id=${clientId}` +
    `&scope=channels:history,channels:read,chat:write` +
    `&redirect_uri=${encodeURIComponent(`${appUrl}/api/integrations/slack/callback`)}` +
    `&state=${state}`;

  redirect(slackAuthUrl);
}
