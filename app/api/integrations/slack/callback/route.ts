import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { encryptToken, getSlackChannels } from '@/lib/integrations/slack';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !stateParam) {
    redirect('/integrations?error=slack_denied');
  }

  let workspaceId: string;
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf8'));
    workspaceId = decoded.workspace_id;
  } catch {
    redirect('/integrations?error=invalid_state');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  // Exchange code for bot token
  const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: `${appUrl}/api/integrations/slack/callback`,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.ok || !tokenData.access_token) {
    redirect('/integrations?error=slack_token_failed');
  }

  const botToken: string = tokenData.access_token;
  const teamId: string = tokenData.team?.id;
  const teamName: string = tokenData.team?.name;

  // List available channels
  const channels = await getSlackChannels(botToken);

  // Store encrypted token
  const encryptedToken = encryptToken(botToken);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createServiceClient()) as any;
  await supabase
    .from('integrations')
    .upsert({
      workspace_id: workspaceId,
      provider: 'slack',
      status: 'active',
      access_token_encrypted: encryptedToken,
      config: {
        team_id: teamId,
        team_name: teamName,
        available_channels: channels.slice(0, 50).map((c) => ({ id: c.id, name: c.name })),
        monitored_channels: [], // user can configure later
      },
      last_synced_at: new Date().toISOString(),
    }, { onConflict: 'workspace_id,provider' });

  redirect('/integrations?connected=slack');
}
