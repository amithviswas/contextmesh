import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch workspace info via two queries to avoid join type issues
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
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      <Sidebar
        userEmail={user.email ?? ''}
        workspaceName={workspaceName}
      />

      {/* Main content — offset by sidebar width on desktop */}
      <main
        className="md:pl-[var(--sidebar-width)] pt-14 md:pt-0 min-h-screen"
      >
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
