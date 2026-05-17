import { NextRequest, NextResponse } from 'next/server';
import { verifyGitHubWebhook } from '@/lib/integrations/github';
import { ingestContextItem } from '@/lib/context/ingest';
import { createClient } from '@supabase/supabase-js';

// Service client — no cookies needed for webhook handler
function getServiceClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ) as any;
}

async function resolveProjectForRepo(repoFullName: string): Promise<{ projectId: string; workspaceId: string } | null> {
  const supabase = getServiceClient();
  // Find an integration that has this repo in its config
  const { data: integrations } = await supabase
    .from('integrations')
    .select('workspace_id, config')
    .eq('provider', 'github')
    .eq('status', 'active');

  for (const intg of integrations ?? []) {
    const repos = (intg.config?.github_repos ?? []) as Array<{ repo_full_name: string; project_id: string }>;
    const match = repos.find((r) => r.repo_full_name === repoFullName);
    if (match) {
      return { projectId: match.project_id, workspaceId: intg.workspace_id };
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');
  const event = request.headers.get('x-github-event');

  // HIGH-01: Fail hard if webhook secret is not configured (do NOT fall back to a default)
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[github/webhook] GITHUB_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  // Verify signature
  if (!verifyGitHubWebhook(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const repoFullName: string = payload.repository?.full_name;

  if (!repoFullName) {
    return NextResponse.json({ received: true });
  }

  const target = await resolveProjectForRepo(repoFullName);
  if (!target) {
    // Webhook received but no project mapping yet — still 200 to avoid GitHub disabling webhook
    return NextResponse.json({ received: true, note: 'no project mapping' });
  }

  const { projectId, workspaceId } = target;

  try {
    if (event === 'push') {
      const commits: Array<{
        id: string;
        message: string;
        author: { name: string };
        timestamp: string;
        added: string[];
        modified: string[];
        removed: string[];
      }> = payload.commits ?? [];

      for (const commit of commits.slice(0, 10)) {
        const filesChanged = [
          ...commit.added,
          ...commit.modified,
          ...commit.removed,
        ].join(', ');

        await ingestContextItem({
          project_id: projectId,
          workspace_id: workspaceId,
          source: 'github',
          type: 'commit',
          title: commit.message.split('\n')[0].slice(0, 200),
          content: [
            commit.message,
            `Author: ${commit.author.name}`,
            filesChanged ? `Files: ${filesChanged}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
          metadata: {
            sha: commit.id,
            author: commit.author.name,
            timestamp: commit.timestamp,
            repo: repoFullName,
          },
        });
      }
    } else if (event === 'pull_request') {
      const pr = payload.pull_request;
      const action: string = payload.action;
      if (!['opened', 'closed', 'reopened'].includes(action)) {
        return NextResponse.json({ received: true });
      }

      await ingestContextItem({
        project_id: projectId,
        workspace_id: workspaceId,
        source: 'github',
        type: 'pr',
        title: `PR #${pr.number}: ${pr.title}`,
        content: pr.body || 'No description provided.',
        metadata: {
          number: pr.number,
          state: pr.state,
          merged: pr.merged ?? false,
          author: pr.user.login,
          repo: repoFullName,
          action,
        },
      });
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
    // Return 200 anyway so GitHub doesn't disable the webhook
  }

  return NextResponse.json({ received: true });
}
