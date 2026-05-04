import type { Metadata } from 'next';
import ProjectDetailClient from './ProjectDetailClient';

export const metadata: Metadata = { title: 'Project — ContextMesh' };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="page-enter">
      <ProjectDetailClient projectId={id} />
    </div>
  );
}
