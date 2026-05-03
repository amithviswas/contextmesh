'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Search,
  Plug,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/query', label: 'Query', icon: Search },
  { href: '/integrations', label: 'Integrations', icon: Plug },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  userEmail: string;
  workspaceName: string;
}

export default function Sidebar({ userEmail, workspaceName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const userInitial = userEmail?.[0]?.toUpperCase() ?? 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--color-bg-border)' }}>
        <Logo size="sm" />
      </div>

      {/* Workspace selector */}
      <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--color-bg-border)' }}>
        <button
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] transition-colors duration-150 text-left group"
          style={{ background: 'var(--color-bg-elevated)' }}
        >
          <div
            className="w-6 h-6 rounded-[5px] flex-shrink-0 flex items-center justify-center text-[10px] font-[var(--font-display)] font-700"
            style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-primary)', border: '1px solid rgba(0,212,180,0.2)' }}
          >
            {workspaceName?.[0]?.toUpperCase() ?? 'W'}
          </div>
          <span className="text-[13px] font-medium truncate flex-1" style={{ color: 'var(--color-text-primary)' }}>
            {workspaceName || 'My Workspace'}
          </span>
          <ChevronDown size={13} style={{ color: 'var(--color-text-tertiary)' }} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-[13px] font-medium',
                'transition-all duration-150',
                'relative',
                isActive
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]'
              )}
              style={
                isActive
                  ? {
                      background: 'var(--color-accent-subtle)',
                      color: 'var(--color-text-primary)',
                    }
                  : {}
              }
            >
              {/* Active indicator */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: 'var(--color-accent-primary)' }}
                />
              )}
              <Icon size={15} style={{ color: isActive ? 'var(--color-accent-primary)' : 'inherit' }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--color-bg-border)' }}>
        <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-medium"
            style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-bg-border)' }}
          >
            {userInitial}
          </div>
          <span className="text-[12px] truncate flex-1" style={{ color: 'var(--color-text-secondary)' }}>
            {userEmail}
          </span>
        </div>
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-[13px] transition-all duration-150"
          style={{ color: 'var(--color-text-tertiary)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--color-error)';
            e.currentTarget.style.background = 'rgba(248, 113, 113, 0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--color-text-tertiary)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-bg-border)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-bg-border)' }}
      >
        <Logo size="sm" />
        <button
          id="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-[8px] transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="md:hidden fixed left-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width: '280px',
              background: 'var(--color-bg-secondary)',
              borderRight: '1px solid var(--color-bg-border)',
            }}
          >
            <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'var(--color-bg-border)' }}>
              <Logo size="sm" />
              <button onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-text-tertiary)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
