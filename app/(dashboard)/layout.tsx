import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ensureWorkspace } from '@/lib/auth/onboarding';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Guarantee workspace exists for ALL login methods (email signup, OAuth, admin-created)
  // ensureWorkspace is idempotent — safe to call on every dashboard load
  try {
    await ensureWorkspace(user.id, user.email ?? `user-${user.id}`);
  } catch (err) {
    console.error('[dashboard layout] ensureWorkspace failed:', err);
    // Non-fatal — let the user proceed; individual pages handle missing workspace gracefully
  }

  // Re-fetch membership after ensuring it exists
  const { data: membership } = await supabase
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  let workspaceName = 'My Workspace';
  if (membership?.workspace_id) {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('name')
      .eq('id', membership.workspace_id)
      .maybeSingle();
    workspaceName = workspace?.name ?? 'My Workspace';
  }

  return (
    <>
      <Sidebar userEmail={user.email ?? ''} workspaceName={workspaceName} />
      <main className="dashboard-main">
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </>
  );
}
