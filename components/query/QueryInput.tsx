'use client';

import { Loader2, Send } from 'lucide-react';
import { useRef } from 'react';
import { formatDistanceToNow } from '@/lib/utils';
import type { Project, Query } from '@/types';

interface Props {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  question: string;
  onQuestionChange: (q: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  usage: { used: number; limit: number; plan: string } | null;
  recentQueries: Query[];
  onSelectQuery: (q: Query) => void;
}

export default function QueryInput({
  projects,
  selectedProjectId,
  onProjectChange,
  question,
  onQuestionChange,
  onSubmit,
  isLoading,
  usage,
  recentQueries,
  onSelectQuery,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && question.trim()) onSubmit();
    }
  }

  const percentUsed = usage
    ? usage.limit === Infinity
      ? 0
      : Math.min(100, Math.round((usage.used / usage.limit) * 100))
    : 0;

  const isNearLimit = percentUsed >= 80;
  const isAtLimit = usage ? usage.used >= usage.limit : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Project selector */}
      <div>
        <label
          htmlFor="query-project-select"
          style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}
        >
          Project
        </label>
        <select
          id="query-project-select"
          value={selectedProjectId}
          onChange={(e) => onProjectChange(e.target.value)}
          className="input-base"
          style={{ fontSize: '13px', cursor: 'pointer' }}
        >
          <option value="">— Select a project —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Question textarea */}
      <div>
        <label
          htmlFor="query-question"
          style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}
        >
          Question
        </label>
        <textarea
          id="query-question"
          ref={textareaRef}
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || isAtLimit}
          rows={5}
          placeholder="e.g. Why did we choose PostgreSQL? What are the current blockers? What was decided in the last sprint?"
          className="input-base"
          style={{
            resize: 'vertical',
            minHeight: '120px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        />
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
          Ctrl+Enter to submit
        </p>
      </div>

      {/* Submit button */}
      <button
        id="query-submit-btn"
        onClick={onSubmit}
        disabled={isLoading || !question.trim() || !selectedProjectId || isAtLimit}
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
      >
        {isLoading ? (
          <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Thinking…</>
        ) : (
          <><Send size={14} /> Ask ContextMesh</>
        )}
      </button>

      {/* Usage meter */}
      {usage && (
        <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <p style={{ fontSize: '12px', color: isNearLimit ? '#FBBF24' : 'var(--text-secondary)', fontWeight: 500 }}>
              {usage.used} / {usage.limit === Infinity ? '∞' : usage.limit} queries this month
            </p>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              {usage.plan}
            </span>
          </div>
          {usage.limit !== Infinity && (
            <div style={{ height: '4px', borderRadius: '2px', background: 'var(--bg-border)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${percentUsed}%`,
                  background: isAtLimit ? '#F87171' : isNearLimit ? '#FBBF24' : 'var(--accent)',
                  borderRadius: '2px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          )}
          {isAtLimit && (
            <p style={{ fontSize: '12px', color: '#F87171', marginTop: '6px' }}>
              Limit reached.{' '}
              <a href="/pricing" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                Upgrade for {usage.plan === 'free' ? '2,000' : 'unlimited'} queries
              </a>
            </p>
          )}
          {isNearLimit && !isAtLimit && (
            <p style={{ fontSize: '11px', color: '#FBBF24', marginTop: '6px' }}>
              Approaching limit.{' '}
              <a href="/pricing" style={{ color: 'var(--accent)', textDecoration: 'underline', fontSize: '11px' }}>
                Upgrade to Pro
              </a>
            </p>
          )}
        </div>
      )}

      {/* Recent queries */}
      {recentQueries.length > 0 && (
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
            Recent
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {recentQueries.slice(0, 5).map((q) => (
              <button
                key={q.id}
                onClick={() => onSelectQuery(q)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--bg-border)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s',
                }}
                className="recent-query-btn"
              >
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {q.question.slice(0, 60)}{q.question.length > 60 ? '…' : ''}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
                  {formatDistanceToNow(q.created_at)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
