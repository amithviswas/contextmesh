'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, FolderKanban, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import { projectsApi } from '@/lib/api';
import { formatDistanceToNow } from '@/lib/utils';
import type { Project } from '@/types';

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await projectsApi.list();
    if (result.error) {
      setError(result.error);
    } else {
      setProjects(result.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project? All context items will also be deleted. This cannot be undone.')) return;
    setDeletingId(id);
    const result = await projectsApi.delete(id);
    setDeletingId(null);
    if (result.error) {
      alert(result.error);
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <div>
          <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Projects
          </p>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
            Projects
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {projects.length > 0 ? `${projects.length} project${projects.length !== 1 ? 's' : ''}` : 'Organize your context by project or team.'}
          </p>
        </div>
        <button
          id="new-project-btn"
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
          style={{ height: '40px', padding: '0 18px', fontSize: '14px' }}
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={24} style={{ color: 'var(--text-tertiary)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ padding: '20px', borderRadius: '10px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--color-error)', fontSize: '14px' }}>
          {error}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onNew={() => setModalOpen(true)} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              deleting={deletingId === project.id}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}

function ProjectCard({ project, onDelete, deleting }: {
  project: Project;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <div
      id={`project-card-${project.id}`}
      className="card"
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}
    >
      {/* Icon + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
        }}>
          <FolderKanban size={18} style={{ color: 'var(--accent)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.name}
          </p>
          {project.description && (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {project.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{project.context_item_count ?? 0}</span> context items
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>·</span>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          {formatDistanceToNow(project.created_at)}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', paddingTop: '4px', borderTop: '1px solid var(--bg-border)' }}>
        <Link
          href={`/projects/${project.id}`}
          id={`open-project-${project.id}`}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
            background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)',
            color: 'var(--text-primary)', textDecoration: 'none',
          }}
        >
          Open <ArrowRight size={13} />
        </Link>
        <button
          id={`delete-project-${project.id}`}
          onClick={() => onDelete(project.id)}
          disabled={deleting}
          style={{
            width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: '1px solid transparent',
            color: 'var(--text-tertiary)', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-error)';
            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)';
            e.currentTarget.style.background = 'rgba(248,113,113,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-tertiary)';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {deleting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={15} />}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div
      id="projects-empty-state"
      className="card"
      style={{ padding: '64px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px' }}
    >
      <div style={{ width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', fontSize: '24px' }}>
        📁
      </div>
      <div>
        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>No projects yet</p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '280px' }}>Create your first project to start adding context items.</p>
      </div>
      <button onClick={onNew} className="btn btn-primary" id="empty-new-project-btn">
        <Plus size={14} /> Create first project
      </button>
    </div>
  );
}
