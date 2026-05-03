'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Include at least one uppercase letter').regex(/[0-9]/, 'Include at least one number'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }: FormValues) => {
    setServerError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setServerError(error.message); }
    else { setSuccess(true); setTimeout(() => router.push('/login'), 2500); }
  };

  if (success) {
    return (
      <div className="w-full max-w-[420px] page-enter">
        <div className="card p-8 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
            <CheckCircle size={22} color="var(--color-success)" />
          </div>
          <h1 className="text-[22px] font-[var(--font-display)] font-700 mb-2" style={{ color: 'var(--color-text-primary)' }}>Password updated</h1>
          <p className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>Redirecting you to sign in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] page-enter">
      <div className="mb-8 text-center">
        <h1 className="text-[32px] font-[var(--font-display)] font-700 mb-2" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>New password</h1>
        <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>Choose a strong password for your account</p>
      </div>
      <div className="card p-6 space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input id="reset-password" label="New password" type="password" placeholder="At least 8 characters" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
          <Input id="reset-confirm" label="Confirm password" type="password" placeholder="Repeat your password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
          {serverError && (
            <div className="rounded-[8px] p-3 text-[13px]" style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.2)', color: 'var(--color-error)' }}>
              {serverError}
            </div>
          )}
          <Button id="reset-submit-btn" type="submit" fullWidth loading={isSubmitting}>Update password</Button>
        </form>
      </div>
    </div>
  );
}
