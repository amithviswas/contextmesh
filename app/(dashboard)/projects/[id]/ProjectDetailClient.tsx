'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft, Filter, Loader2 } from 'lucide-react';
import AddContextModal from '@/components/context/AddContextModal';
import ContextItemCard from '@/components/context/ContextItemCard';
import { projectsApi, contextApi } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import type { Project, ContextItem } from '@/types';
import { SOURCE_LABELS } from '@/types';

const SOURCE_FILTERS = ['all', 'manual', 'github', 'slack', 'jira', 'linear'] as const;
type FilterSource = typeof SOURCE_FILTERS[number];

interface Props { projectId: string; }

export default function ProjectDetailClient({ projectId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<ContextItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterSource>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);

    // Load project meta
    const projResult = await projectsApi.get(projectId);
    if (projResult.error || !projResult.data) {
      router.push('/projects');
      return;
    }
    setProject(projResult.data);

    // Load context items
    const { data: ctxData, error: ctxError } = await supabase
      .from('context_items')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (!ctxError) {
      setItems((ctxData ?? []) as unknown as ContextItem[]);
    }

    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  function handleCreated(item: ContextItem) {
    setItems((prev) => [item, ...prev]);
    setProject((prev) => prev ? { ...prev, context_item_count: (prev.context_item_count ?? 0) + 1 } : prev);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this context item? This cannot be undone.')) return;
    setDeletingId(id);
    const result = await contextApi.delete(id);
    setDeletingId(null);
    if (result.error) { alert(result.error); return; }
    setItems((prev) => prev.filter((i) => i.id !== id));
    setProject((prev) => prev ? { ...prev, context_item_count: Math.max(0, (prev.context_item_count ?? 0) - 1) } : prev);
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.source === filter);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={24} style={{ color: 'var(--text-tertiary)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      {/* Back + header */}
      <div style={{ marginBottom: '28px' }}>
        <a
          href="/projects"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px', textDecoration: 'none' }}
        >
          <ArrowLeft size={13} /> Back to Projects
        </a>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Project
            </p>
            <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
              {project?.name}
            </h1>
            {project?.description && (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px' }}>{project.description}</p>
            )}
          </div>
          <button
            id="add-context-btn"
            onClick={() => setAddOpen(true)}
            className="btn btn-primary"
            style={{ height: '40px', padding: '0 18px', fontSize: '14px' }}
          >
            <Plus size={15} /> Add Context
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--bg-border)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '16px' }}>{project?.context_item_count ?? 0}</span>
            {' '}context items
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '16px' }}>
              {items.filter(i => i.source === 'manual').length}
            </span>
            {' '}manual
          </p>
        </div>
      </div>

      {/* Filter bar */}
      {items.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <Filter size={13} style={{ color: 'var(--text-tertiary)' }} />
          {SOURCE_FILTERS.map((src) => {
            const count = src === 'all' ? items.length : items.filter((i) => i.source === src).length;
            if (src !== 'all' && count === 0) return null;
            return (
              <button
                key={src}
                id={`filter-${src}`}
                onClick={() => setFilter(src)}
                style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                  border: `1px solid ${filter === src ? 'var(--accent-border)' : 'var(--bg-border)'}`,
                  background: filter === src ? 'var(--accent-subtle)' : 'transparent',
                  color: filter === src ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {src === 'all' ? 'All' : SOURCE_LABELS[src as ContextItem['source']]} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Context list */}
      {filtered.length === 0 ? (
        <div
          id="context-empty-state"
          className="card"
          style={{ padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
        >
          <span style={{ fontSize: '32px' }}>🧠</span>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {filter !== 'all' ? `No ${SOURCE_LABELS[filter as ContextItem['source']]} context yet` : 'No context yet'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Add your first context item manually or connect an integration.
            </p>
          </div>
          {filter === 'all' && (
            <button onClick={() => setAddOpen(true)} className="btn btn-primary" id="empty-add-context-btn">
              <Plus size={14} /> Add first context
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((item) => (
            <ContextItemCard
              key={item.id}
              item={item}
              projectId={projectId}
              onDelete={deletingId === item.id ? undefined : handleDelete}
            />
          ))}
        </div>
      )}

      <AddContextModal
        open={addOpen}
        projectId={projectId}
        onClose={() => setAddOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
