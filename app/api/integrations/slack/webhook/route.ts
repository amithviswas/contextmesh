import { NextRequest, NextResponse } from 'next/server';
import { verifySlackSignature, isContextWorthy, decryptToken } from '@/lib/integrations/slack';
import { ingestContextItem } from '@/lib/context/ingest';
import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ) as any;
}

async function resolveProjectForChannel(channelId: string): Promise<{
  projectId: string;
  workspaceId: string;
} | null> {
  const supabase = getServiceClient();
  const { data: integrations } = await supabase
    .from('integrations')
    .select('workspace_id, config')
    .eq('provider', 'slack')
    .eq('status', 'active');

  for (const intg of integrations ?? []) {
    const monitored = (intg.config?.monitored_channels ?? []) as Array<{ id: string; project_id: string }>;
    const match = monitored.find((c) => c.id === channelId);
    if (match) {
      return { projectId: match.project_id, workspaceId: intg.workspace_id };
    }
  }

  // If no specific channel config, use the workspace's first project
  for (const intg of integrations ?? []) {
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('workspace_id', intg.workspace_id)
      .limit(1)
      .maybeSingle();

    if (project) {
      return { projectId: project.id, workspaceId: intg.workspace_id };
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Handle Slack's URL verification challenge (sent when first setting up)
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // HIGH-02: Verify signature for ALL requests — including url_verification.
  // This stops unauthenticated probing of the endpoint.
  if (!verifySlackSignature(body, request.headers)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Respond to Slack's URL verification challenge (only after signature passes)
  if (payload.type === 'url_verification') {
    return NextResponse.json({ challenge: payload.challenge });
  }

  const event = payload.event as Record<string, unknown> | undefined;
  if (!event) return NextResponse.json({ ok: true });

  // Only handle real user messages
  if (event.type === 'message' && !event.bot_id && !event.subtype) {
    const channelId = event.channel as string;
    const text = event.text as string;
    const ts = event.ts as string;
    const threadTs = event.thread_ts as string | undefined;
    const replyCount = event.reply_count as number | undefined;

    const messageObj = {
      text,
      thread_ts: threadTs,
      reply_count: replyCount,
      bot_id: event.bot_id as string | undefined,
    };

    if (isContextWorthy(messageObj)) {
      const target = await resolveProjectForChannel(channelId);
      if (target) {
        const truncatedTitle = `Slack: ${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`;
        await ingestContextItem({
          project_id: target.projectId,
          workspace_id: target.workspaceId,
          source: 'slack',
          type: 'message',
          title: truncatedTitle,
          content: text,
          metadata: {
            channel: channelId,
            user: event.user,
            timestamp: ts,
            thread_ts: threadTs,
          },
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
