import { useId } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  style?: React.CSSProperties;
}

const sizes = {
  sm: { icon: 22, fontSize: '16px' },
  md: { icon: 26, fontSize: '19px' },
  lg: { icon: 34, fontSize: '25px' },
};

export default function Logo({ size = 'md', showWordmark = true, style }: LogoProps) {
  const { icon, fontSize } = sizes[size];
  const gid = `cm-logo-${useId().replace(/:/g, '')}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', ...style }}>
      {/* Mesh icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 0 6px rgba(108,92,231,0.55))' }}
      >
        <defs>
          <linearGradient id={gid} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#A78BFA" />
            <stop offset="0.55" stopColor="#6C5CE7" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <g stroke={`url(#${gid})`} strokeLinecap="round">
          <line x1="4" y1="4" x2="12" y2="12" strokeWidth="1.6" />
          <line x1="20" y1="4" x2="12" y2="12" strokeWidth="1.6" />
          <line x1="4" y1="20" x2="12" y2="12" strokeWidth="1.6" />
          <line x1="20" y1="20" x2="12" y2="12" strokeWidth="1.6" />
          <line x1="4" y1="4" x2="20" y2="4" strokeWidth="1" strokeOpacity="0.45" />
          <line x1="4" y1="20" x2="20" y2="20" strokeWidth="1" strokeOpacity="0.45" />
          <line x1="4" y1="4" x2="4" y2="20" strokeWidth="1" strokeOpacity="0.25" />
          <line x1="20" y1="4" x2="20" y2="20" strokeWidth="1" strokeOpacity="0.25" />
        </g>
        <circle cx="4" cy="4" r="2" fill="#A78BFA" />
        <circle cx="20" cy="4" r="2" fill="#8B6CF6" />
        <circle cx="4" cy="20" r="2" fill="#6C5CE7" />
        <circle cx="20" cy="20" r="2" fill="#22D3EE" />
        <circle cx="12" cy="12" r="3.2" fill={`url(#${gid})`} />
        <circle cx="12" cy="12" r="1.4" fill="#0B0D17" />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontSize,
            fontFamily: 'var(--font-display)',
            fontWeight: 650,
            letterSpacing: '-0.035em',
            lineHeight: 1,
            color: 'var(--text-primary)',
          }}
        >
          Context
          <span
            style={{
              background: 'linear-gradient(110deg, #C4B5FD 0%, #A78BFA 45%, #22D3EE 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Mesh
          </span>
        </span>
      )}
    </div>
  );
}
