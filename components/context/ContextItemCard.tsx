'use client';

import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/utils';
import type { ContextItem } from '@/types';
import { SOURCE_COLORS, SOURCE_LABELS, CONTEXT_TYPE_LABELS } from '@/types';

interface Props {
  item: ContextItem;
  projectId: string;
  onDelete?: (id: string) => void;
}

export default function ContextItemCard({ item, projectId, onDelete }: Props) {
  const srcColor = SOURCE_COLORS[item.source] ?? '#8A8A9A';

  return (
    <div
      className="card"
      style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      {/* Top row: badges + timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Source badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
          borderRadius: '5px', fontSize: '11px', fontWeight: 600,
          background: `${srcColor}14`, color: srcColor,
          border: `1px solid ${srcColor}30`,
          fontFamily: 'var(--font-mono)',
        }}>
          {SOURCE_LABELS[item.source]}
        </span>

        {/* Type badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
          borderRadius: '5px', fontSize: '11px', fontWeight: 500,
          background: 'var(--bg-elevated)', color: 'var(--text-tertiary)',
          border: '1px solid var(--bg-border)', fontFamily: 'var(--font-mono)',
        }}>
          {CONTEXT_TYPE_LABELS[item.type]}
        </span>

        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-tertiary)' }}>
          {formatDistanceToNow(item.created_at)}
        </span>
      </div>

      {/* Title */}
      <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
        {item.title}
      </p>

      {/* Content preview */}
      <p style={{
        fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {item.content}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
        <Link
          href={`/projects/${projectId}/context/${item.id}`}
          id={`view-context-${item.id}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500,
            background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)',
            color: 'var(--text-secondary)', textDecoration: 'none',
            transition: 'all 0.15s',
          }}
        >
          View
        </Link>
        {onDelete && (
          <button
            id={`delete-context-${item.id}`}
            onClick={() => onDelete(item.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500,
              background: 'transparent', border: '1px solid transparent',
              color: 'var(--text-tertiary)', cursor: 'pointer', fontFamily: 'inherit',
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
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
