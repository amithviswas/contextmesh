'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { contextApi } from '@/lib/api';
import type { ContextItem } from '@/types';
import { SOURCE_COLORS, SOURCE_LABELS, CONTEXT_TYPE_LABELS } from '@/types';
import { formatDate, formatDistanceToNow } from '@/lib/utils';

interface Props {
  item: ContextItem;
  projectId: string;
}

export default function ContextDetailClient({ item, projectId }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const srcColor = SOURCE_COLORS[item.source] ?? '#8A8A9A';

  async function handleDelete() {
    if (!confirm('Delete this context item permanently?')) return;
    setDeleting(true);
    const result = await contextApi.delete(item.id);
    if (result.error) { alert(result.error); setDeleting(false); return; }
    router.push(`/projects/${projectId}`);
    router.refresh();
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Back */}
      <a
        href={`/projects/${projectId}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '24px', textDecoration: 'none' }}
      >
        <ArrowLeft size={13} /> Back to {item.project_name ?? 'Project'}
      </a>

      {/* Meta header */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
            borderRadius: '6px', fontSize: '12px', fontWeight: 600,
            background: `${srcColor}14`, color: srcColor,
            border: `1px solid ${srcColor}30`,
            fontFamily: 'var(--font-mono)',
          }}>
            {SOURCE_LABELS[item.source]}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
            borderRadius: '6px', fontSize: '12px', fontWeight: 500,
            background: 'var(--bg-elevated)', color: 'var(--text-tertiary)',
            border: '1px solid var(--bg-border)', fontFamily: 'var(--font-mono)',
          }}>
            {CONTEXT_TYPE_LABELS[item.type]}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {formatDistanceToNow(item.created_at)} · {formatDate(item.created_at)}
          </span>
        </div>

        <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px', lineHeight: 1.3 }}>
          {item.title}
        </h1>

        {item.indexed_at && (
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            Indexed at {formatDate(item.indexed_at)} · Embedding stored
          </p>
        )}
      </div>

      {/* Content */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Content
        </p>
        <div style={{
          fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.8,
          whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)',
        }}>
          {item.content}
        </div>
      </div>

      {/* Metadata */}
      {item.metadata && Object.keys(item.metadata).length > 0 && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Metadata
          </p>
          <pre style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', overflowX: 'auto' }}>
            {JSON.stringify(item.metadata, null, 2)}
          </pre>
        </div>
      )}

      {/* Delete */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          id="delete-context-item-btn"
          onClick={handleDelete}
          disabled={deleting}
          className="btn"
          style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.2)',
            color: 'var(--color-error)',
          }}
        >
          {deleting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
          Delete item
        </button>
      </div>
    </div>
  );
}
