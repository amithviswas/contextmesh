import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Query History — ContextMesh',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QueryHistoryPage({ params }: Props) {
  const { id: projectId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const { data: project } = await sb
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .maybeSingle();

  if (!project) redirect('/projects');

  const { data: queries } = await sb
    .from('queries')
    .select('id, question, answer, tokens_used, context_used, created_at')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <Link
          href={`/projects/${projectId}`}
          style={{ fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'none', fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}
        >
          ← {project.name}
        </Link>
        <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Query History
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          All AI queries for <strong style={{ color: 'var(--text-primary)' }}>{project.name}</strong>
        </p>
      </div>

      {/* Empty state */}
      {(!queries || queries.length === 0) && (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
            No queries yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '6px', marginBottom: '20px' }}>
            Ask your first question about this project.
          </p>
          <Link href="/query" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Ask ContextMesh
          </Link>
        </div>
      )}

      {/* Queries list */}
      {queries && queries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {queries.map((q: {
            id: string;
            question: string;
            answer: string | null;
            tokens_used: number;
            context_used: string[];
            created_at: string;
          }) => (
            <details
              key={q.id}
              className="card"
              style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}
            >
              <summary
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  listStyle: 'none',
                  userSelect: 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.question}
                  </p>
                  {q.answer && (
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.answer.slice(0, 100)}{q.answer.length > 100 ? '…' : ''}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
                  {q.context_used?.length > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {q.context_used.length} src
                    </span>
                  )}
                  {q.tokens_used > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {q.tokens_used}t
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    {formatDistanceToNow(q.created_at)}
                  </span>
                </div>
              </summary>

              {/* Expanded content */}
              {q.answer && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--bg-border)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', padding: '14px 0 8px' }}>
                    Answer
                  </p>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {q.answer}
                  </div>
                </div>
              )}
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
