interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  style?: React.CSSProperties;
}

const sizes = {
  sm: { icon: 20, fontSize: '15px' },
  md: { icon: 24, fontSize: '18px' },
  lg: { icon: 32, fontSize: '24px' },
};

export default function Logo({ size = 'md', showWordmark = true, style }: LogoProps) {
  const { icon, fontSize } = sizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', ...style }}>
      {/* Mesh icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <line x1="4" y1="4" x2="12" y2="12" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="4" x2="12" y2="12" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="20" x2="12" y2="12" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="20" x2="12" y2="12" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="4" x2="20" y2="4" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" />
        <line x1="4" y1="20" x2="20" y2="20" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" />
        <circle cx="4" cy="4" r="2" fill="var(--accent)" />
        <circle cx="20" cy="4" r="2" fill="var(--accent)" />
        <circle cx="4" cy="20" r="2" fill="var(--accent)" />
        <circle cx="20" cy="20" r="2" fill="var(--accent)" />
        <circle cx="12" cy="12" r="3" fill="var(--accent)" />
        <circle cx="12" cy="12" r="1.5" fill="#0A0A0F" />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontSize,
            fontFamily: 'Syne, Inter, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: 'var(--text-primary)',
          }}
        >
          Context<span style={{ color: 'var(--accent)' }}>Mesh</span>
        </span>
      )}
    </div>
  );
}
