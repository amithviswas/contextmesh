import type { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = { title: 'Projects — ContextMesh' };

export default function ProjectsPage() {
  return (
    <div className="page-enter">
      <ProjectsClient />
    </div>
  );
}
