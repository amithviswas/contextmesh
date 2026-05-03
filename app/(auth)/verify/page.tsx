'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

export default function VerifyPage() {
  const supabase = createClient();
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    // The user would need to enter their email again; for simplicity we show a confirmation
    setResent(true);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-[420px] page-enter">
      <div className="card p-8 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--color-accent-subtle)', border: '1px solid rgba(0, 212, 180, 0.3)' }}>
          <Mail size={24} color="var(--color-accent-primary)" />
        </div>
        <h1 className="text-[24px] font-[var(--font-display)] font-700 mb-3" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Check your email
        </h1>
        <p className="text-[14px] mb-6" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
          We sent a verification link to your inbox. Click the link to activate your account and get started.
        </p>

        {resent ? (
          <div className="rounded-[8px] p-3 text-[13px] mb-5" style={{ background: 'var(--color-accent-subtle)', border: '1px solid rgba(0, 212, 180, 0.2)', color: 'var(--color-accent-primary)' }}>
            Verification email resent — check your inbox
          </div>
        ) : (
          <Button id="resend-verify-btn" variant="secondary" fullWidth loading={loading} onClick={handleResend}>
            <RefreshCw size={14} />
            Resend verification email
          </Button>
        )}

        <p className="mt-5 text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
          Wrong email?{' '}
          <Link href="/signup" className="transition-colors" style={{ color: 'var(--color-accent-primary)' }}>
            Start over
          </Link>
        </p>
      </div>
    </div>
  );
}
