import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

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
