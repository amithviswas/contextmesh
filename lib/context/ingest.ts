import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/embeddings/generate';

// Use service role for webhook handlers (no user session available)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface IngestPayload {
  project_id: string;
  workspace_id: string;
  source: 'github' | 'slack' | 'jira' | 'linear' | 'manual';
  type: 'commit' | 'pr' | 'issue' | 'message' | 'decision' | 'architecture' | 'blocker' | 'meeting_note' | 'note';
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export async function ingestContextItem(payload: IngestPayload) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getServiceClient() as any;

  const { project_id, workspace_id, source, type, title, content, metadata = {} } = payload;

  // Verify project belongs to the workspace
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('workspace_id', workspace_id)
    .maybeSingle();

  if (!project) {
    console.error(`Project ${project_id} not found in workspace ${workspace_id}`);
    return null;
  }

  // Generate embedding
  const embeddingArray = await generateEmbedding(`${title}\n\n${content}`);

  const { data, error } = await supabase
    .from('context_items')
    .insert({
      project_id,
      source,
      type,
      title,
      content,
      metadata,
      embedding: `[${embeddingArray.join(',')}]`,
      indexed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Context ingest error:', error);
    return null;
  }

  // Bump items_synced counter on the integration
  await supabase
    .from('integrations')
    .update({
      items_synced: supabase.rpc('integrations_increment_synced', {}), // fallback below
      last_synced_at: new Date().toISOString(),
    })
    .eq('workspace_id', workspace_id)
    .eq('provider', source);

  // Simpler increment (works without custom RPC)
  const { data: intg } = await supabase
    .from('integrations')
    .select('items_synced')
    .eq('workspace_id', workspace_id)
    .eq('provider', source)
    .maybeSingle();

  if (intg) {
    await supabase
      .from('integrations')
      .update({
        items_synced: (intg.items_synced ?? 0) + 1,
        last_synced_at: new Date().toISOString(),
        status: 'active',
      })
      .eq('workspace_id', workspace_id)
      .eq('provider', source);
  }

  return data;
}

/** Resolve workspace_id from a project_id */
export async function getWorkspaceForProject(projectId: string): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getServiceClient() as any;
  const { data } = await supabase
    .from('projects')
    .select('workspace_id')
    .eq('id', projectId)
    .maybeSingle();
  return data?.workspace_id ?? null;
}
