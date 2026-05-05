'use client';

import { SOURCE_COLORS, SOURCE_LABELS } from '@/types';
import type { SearchResult } from '@/types';

interface Props {
  source: SearchResult;
  index: number;
}

const TYPE_EMOJI: Record<string, string> = {
  decision: '⚡',
  architecture: '🏗️',
  blocker: '🚧',
  meeting_note: '📝',
  note: '💡',
  commit: '📦',
  pr: '🔀',
  issue: '🎯',
  message: '💬',
};

export default function SourceCard({ source, index }: Props) {
  const color = SOURCE_COLORS[source.source] ?? '#00D4B4';
  const snippet = source.content.slice(0, 120) + (source.content.length > 120 ? '…' : '');
  const similarity = Math.round((source.similarity ?? 0) * 100);
  const emoji = TYPE_EMOJI[source.type] ?? '📄';

  return (
    <div
      id={`source-card-${index}`}
      style={{
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid var(--bg-border)',
        background: 'var(--bg-elevated)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'border-color 0.15s',
        cursor: 'default',
      }}
      className="source-card"
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Source badge */}
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '4px',
            background: `${color}18`,
            border: `1px solid ${color}30`,
            color,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.03em',
            flexShrink: 0,
          }}
        >
          {SOURCE_LABELS[source.source]}
        </span>

        {/* Type emoji + type */}
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
          {emoji} {source.type.replace('_', ' ')}
        </span>

        {/* Similarity score */}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: similarity > 75 ? '#34D399' : similarity > 50 ? '#FBBF24' : 'var(--text-tertiary)',
          }}
        >
          {similarity}%
        </span>
      </div>

      {/* Title */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
          fontFamily: 'var(--font-display)',
        }}
      >
        {source.title}
      </p>

      {/* Snippet */}
      <p
        style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          fontFamily: 'var(--font-mono)',
        }}
      >
        {snippet}
      </p>

      {/* Similarity bar */}
      <div
        style={{
          height: '3px',
          borderRadius: '2px',
          background: 'var(--bg-border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${similarity}%`,
            background: similarity > 75 ? '#34D399' : similarity > 50 ? '#FBBF24' : '#6B7280',
            borderRadius: '2px',
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  );
}
