import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showWordmark?: boolean;
}

const sizes = {
  sm: { icon: 20, text: 'text-[15px]' },
  md: { icon: 24, text: 'text-[18px]' },
  lg: { icon: 32, text: 'text-[24px]' },
};

export default function Logo({ size = 'md', className, showWordmark = true }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Mesh icon — interlocking nodes */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Connection lines */}
        <line x1="4" y1="4" x2="12" y2="12" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="4" x2="12" y2="12" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="20" x2="12" y2="12" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="20" x2="12" y2="12" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="4" x2="20" y2="4" stroke="var(--color-accent-primary)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" />
        <line x1="4" y1="20" x2="20" y2="20" stroke="var(--color-accent-primary)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" />
        {/* Nodes */}
        <circle cx="4" cy="4" r="2" fill="var(--color-accent-primary)" />
        <circle cx="20" cy="4" r="2" fill="var(--color-accent-primary)" />
        <circle cx="4" cy="20" r="2" fill="var(--color-accent-primary)" />
        <circle cx="20" cy="20" r="2" fill="var(--color-accent-primary)" />
        {/* Center node — slightly larger, bright */}
        <circle cx="12" cy="12" r="3" fill="var(--color-accent-primary)" />
        <circle cx="12" cy="12" r="1.5" fill="#0A0A0F" />
      </svg>

      {showWordmark && (
        <span
          className={cn(
            text,
            'font-[var(--font-display)] font-700 tracking-[-0.03em]',
            'text-[var(--color-text-primary)]',
            'leading-none'
          )}
        >
          Context<span className="text-[var(--color-accent-primary)]">Mesh</span>
        </span>
      )}
    </div>
  );
}
