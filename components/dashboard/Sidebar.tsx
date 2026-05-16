'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Search, Plug, Settings, LogOut, ChevronDown, Menu, X, CreditCard } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/dashboard',          label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/projects',           label: 'Projects',     icon: FolderKanban },
  { href: '/query',              label: 'Query',        icon: Search },
  { href: '/integrations',       label: 'Integrations', icon: Plug },
  { href: '/settings',           label: 'Settings',     icon: Settings },
  { href: '/settings/billing',   label: 'Billing',      icon: CreditCard },
];

interface Props {
  userEmail: string;
  workspaceName: string;
}

export default function Sidebar({ userEmail, workspaceName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initial = (userEmail?.[0] ?? 'U').toUpperCase();
  const wInitial = (workspaceName?.[0] ?? 'W').toUpperCase();

  const NavLinks = () => (
    <>
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            id={`nav-${label.toLowerCase()}`}
            className={`nav-link${active ? ' active' : ''}`}
            onClick={() => setOpen(false)}
          >
            <Icon size={15} strokeWidth={active ? 2 : 1.75} />
            <span>{label}</span>
          </Link>
        );
      })}
    </>
  );

  const SidebarInner = () => (
    <>
      {/* Logo */}
      <div className="sidebar-logo">
        <Logo size="sm" />
      </div>

      {/* Workspace */}
      <div className="sidebar-workspace">
        <button
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            borderRadius: '8px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--bg-border)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{
            width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
            fontSize: '11px', fontWeight: 700, color: 'var(--accent)',
            fontFamily: 'var(--font-display)',
          }}>
            {wInitial}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {workspaceName || 'My Workspace'}
          </span>
          <ChevronDown size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <NavLinks />
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', marginBottom: '4px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)',
            fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)',
          }}>
            {initial}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {userEmail}
          </span>
        </div>
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="nav-link"
          style={{ width: '100%', border: 'none', background: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.background = 'rgba(248,113,113,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = ''; e.currentTarget.style.background = ''; }}
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="dashboard-sidebar" aria-label="Sidebar">
        <SidebarInner />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <Logo size="sm" />
        <button
          id="mobile-menu-btn"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 39,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(2px)',
            }}
          />
          <aside
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
              width: '280px',
              background: 'var(--bg-secondary)',
              borderRight: '1px solid var(--bg-border)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px 16px', borderBottom: '1px solid var(--bg-border)' }}>
              <Logo size="sm" />
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              <div className="sidebar-workspace">
                <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', cursor: 'pointer' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>{wInitial}</div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>{workspaceName}</span>
                </button>
              </div>
              <nav className="sidebar-nav"><NavLinks /></nav>
            </div>
            <div className="sidebar-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', marginBottom: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{initial}</div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{userEmail}</span>
              </div>
              <button onClick={handleLogout} className="nav-link" style={{ width: '100%', border: 'none', background: 'none' }}>
                <LogOut size={14} /><span>Sign out</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
