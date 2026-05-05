import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Accept Invite — ContextMesh' };

interface Props { params: Promise<{ token: string }> }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const service = getService();

  // Look up invite
  const { data: invite } = await service
    .from('invites')
    .select('*, workspaces(name)')
    .eq('token', token)
    .is('accepted_at', null)
    .maybeSingle();

  // Check auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isExpired = invite && new Date(invite.expires_at) < new Date();
  const isInvalid = !invite || isExpired;
  const workspaceName = invite?.workspaces?.name ?? 'a workspace';

  // If logged in and valid, auto-accept via redirect
  if (user && invite && !isExpired) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/team/invite/${token}`, {
      method: 'POST',
      headers: { Cookie: '' }, // server-side can't forward cookies this way, show button instead
    }).catch(() => null);
    if (res?.ok) redirect('/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '24px' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '40px', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '22px' }}>
          🧠
        </div>

        {isInvalid ? (
          <>
            <h1 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '10px' }}>
              {isExpired ? 'Invite Expired' : 'Invalid Invite'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {isExpired
                ? 'This invite link has expired. Ask your team admin to send a new one.'
                : 'This invite link is not valid or has already been used.'}
            </p>
            <Link href="/login" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Go to Login
            </Link>
          </>
        ) : !user ? (
          <>
            <h1 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '10px' }}>
              You&apos;re Invited!
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              You&apos;ve been invited to join <strong style={{ color: 'var(--text-primary)' }}>{workspaceName}</strong> on ContextMesh.
              Sign in or create an account to accept.
            </p>
            <Link
              href={`/login?redirect=/invite/${token}`}
              className="btn btn-primary"
              style={{ textDecoration: 'none', display: 'inline-block', width: '100%', textAlign: 'center' }}
            >
              Sign In to Accept
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '10px' }}>
              Join {workspaceName}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              You&apos;ve been invited as <strong style={{ color: 'var(--text-primary)' }}>{invite.role}</strong>.
            </p>
            {/* Client-side accept */}
            <AcceptButton token={token} />
          </>
        )}
      </div>
    </div>
  );
}

function AcceptButton({ token }: { token: string }) {
  return (
    <form action={`/api/team/invite/${token}`} method="POST">
      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
        Accept Invite → Join Workspace
      </button>
    </form>
  );
}
