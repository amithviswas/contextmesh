import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = { title: 'Settings — ContextMesh' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getService(): any {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const service = getService();

  const { data: membership } = await service
    .from('memberships')
    .select('workspace_id, role, display_name')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: workspace } = membership?.workspace_id
    ? await service.from('workspaces').select('id, name, slug, plan').eq('id', membership.workspace_id).maybeSingle()
    : { data: null };

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Account
        </p>
        <h1 style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Settings
        </h1>
      </div>
      <SettingsClient
        user={{ id: user.id, email: user.email ?? '', display_name: membership?.display_name ?? null }}
        workspace={workspace}
        myRole={membership?.role ?? 'member'}
      />
    </div>
  );
}
