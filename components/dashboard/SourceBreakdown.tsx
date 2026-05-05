'use client';

interface SourceStat {
  source: 'github' | 'slack' | 'manual' | 'jira' | 'linear';
  count: number;
  percent: number;
}

const SOURCE_COLORS: Record<string, string> = {
  github: '#6e40c9',
  slack: '#FBBF24',
  manual: '#00D4B4',
  jira: '#0052CC',
  linear: '#5B6AD0',
};

interface Props {
  stats: SourceStat[];
  total: number;
}

export default function SourceBreakdown({ stats, total }: Props) {
  if (!stats.length || total === 0) return (
    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>
      No context items yet
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
        Context by Source
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {stats.map(({ source, count, percent }) => (
          <div key={source}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize', fontWeight: 500 }}>
                {source}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {count} ({percent}%)
              </span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-border)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: SOURCE_COLORS[source] ?? '#00D4B4',
                  borderRadius: '3px',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
