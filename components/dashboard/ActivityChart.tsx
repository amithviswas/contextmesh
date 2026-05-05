'use client';

interface DayBucket {
  date: string; // 'May 1'
  github: number;
  slack: number;
  manual: number;
  total: number;
}

interface Props {
  data: DayBucket[];
}

export default function ActivityChart({ data }: Props) {
  if (!data.length) return null;

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div>
      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
        Context Activity — Last 14 Days
      </p>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        {[
          { label: 'GitHub', color: '#6e40c9' },
          { label: 'Slack', color: '#FBBF24' },
          { label: 'Manual', color: '#00D4B4' },
        ].map(({ label, color }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
        {data.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.total} items`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              height: '100%',
              gap: '1px',
              cursor: 'default',
            }}
          >
            {/* Stacked bar segments */}
            {day.total === 0 ? (
              <div style={{ height: '2px', borderRadius: '1px', background: 'var(--bg-border)' }} />
            ) : (
              <>
                {day.github > 0 && (
                  <div style={{ height: `${(day.github / maxTotal) * 80}px`, background: '#6e40c9', borderRadius: '2px 2px 0 0', minHeight: '2px' }} />
                )}
                {day.slack > 0 && (
                  <div style={{ height: `${(day.slack / maxTotal) * 80}px`, background: '#FBBF24', minHeight: '2px' }} />
                )}
                {day.manual > 0 && (
                  <div style={{ height: `${(day.manual / maxTotal) * 80}px`, background: '#00D4B4', minHeight: '2px', borderRadius: day.github === 0 && day.slack === 0 ? '2px 2px 0 0' : '0' }} />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* X-axis labels — show every other day */}
      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
        {data.map((day, i) => (
          <div key={day.date} style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: 'var(--text-tertiary)', overflow: 'hidden', fontFamily: 'var(--font-mono)' }}>
            {i % 3 === 0 ? day.date.split(' ')[1] : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
