import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContextDetailClient from './ContextDetailClient';

export const metadata: Metadata = { title: 'Context Item — ContextMesh' };

export default async function ContextDetailPage({
  params,
}: {
  params: Promise<{ id: string; contextId: string }>;
}) {
  const { id: projectId, contextId } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await supabase
    .from('context_items')
    .select('*, projects(name)')
    .eq('id', contextId)
    .maybeSingle();

  if (!item) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const it = item as any;
  const shaped = {
    ...it,
    project_name: it.projects?.name,
    projects: undefined,
    embedding: undefined,
  };

  return (
    <div className="page-enter">
      <ContextDetailClient item={shaped} projectId={projectId} />
    </div>
  );
}
