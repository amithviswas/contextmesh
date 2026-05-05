'use client';

import { useState } from 'react';
import type { Workspace, Member, Invite } from '@/types';

interface UserData { id: string; email: string; display_name: string | null }

interface Props {
  user: UserData;
  workspace: Workspace | null;
  myRole: 'owner' | 'admin' | 'member';
}

type Tab = 'profile' | 'workspace' | 'team' | 'danger';

export default function SettingsClient({ user, workspace, myRole }: Props) {
  const [tab, setTab] = useState<Tab>('profile');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'team', label: 'Team' },
    { id: 'danger', label: 'Danger Zone' },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--bg-border)', marginBottom: '28px' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 500,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'color 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab user={user} />}
      {tab === 'workspace' && <WorkspaceTab workspace={workspace} myRole={myRole} />}
      {tab === 'team' && <TeamTab workspaceId={workspace?.id ?? null} myRole={myRole} />}
      {tab === 'danger' && <DangerTab workspace={workspace} myRole={myRole} />}
    </div>
  );
}

// ── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user }: { user: UserData }) {
  const [name, setName] = useState(user.display_name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch('/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: name }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Field label="Display Name" id="display-name">
        <input
          id="display-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={inputStyle}
        />
      </Field>
      <Field label="Email" id="profile-email">
        <input id="profile-email" value={user.email} readOnly style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Email is managed by your auth provider.</p>
      </Field>
      <button onClick={save} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </div>
  );
}

// ── Workspace Tab ────────────────────────────────────────────────────────────
function WorkspaceTab({ workspace, myRole }: { workspace: Workspace | null; myRole: string }) {
  const [name, setName] = useState(workspace?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const canEdit = ['owner', 'admin'].includes(myRole);

  async function save() {
    setSaving(true);
    await fetch('/api/settings/workspace', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!workspace) return <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No workspace found.</p>;

  return (
    <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Field label="Workspace Name" id="ws-name">
        <input
          id="ws-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!canEdit}
          style={{ ...inputStyle, opacity: canEdit ? 1 : 0.6, cursor: canEdit ? 'text' : 'not-allowed' }}
        />
      </Field>
      <Field label="Slug" id="ws-slug">
        <input id="ws-slug" value={workspace.slug} readOnly style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed', fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
      </Field>
      <Field label="Current Plan" id="ws-plan">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            {workspace.plan}
          </span>
          <a href="/pricing" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }}>View plans →</a>
        </div>
      </Field>
      {canEdit && (
        <button onClick={save} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      )}
    </div>
  );
}

// ── Team Tab ─────────────────────────────────────────────────────────────────
function TeamTab({ workspaceId, myRole }: { workspaceId: string | null; myRole: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const canManage = ['owner', 'admin'].includes(myRole);

  async function loadTeam() {
    setLoading(true);
    const [mRes, iRes] = await Promise.all([
      fetch('/api/team/members').then(r => r.json()),
      fetch('/api/team/invite').then(r => r.json()),
    ]);
    setMembers(mRes.data ?? []);
    setInvites(iRes.data ?? []);
    setLoaded(true);
    setLoading(false);
  }

  if (!loaded) {
    return (
      <button onClick={loadTeam} disabled={loading} className="btn" style={{ border: '1px solid var(--bg-border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: '13px' }}>
        {loading ? 'Loading…' : 'Load Team Members'}
      </button>
    );
  }

  async function sendInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteMsg('');
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    });
    const data = await res.json();
    setInviting(false);
    if (res.ok) {
      setInviteMsg(`✓ Invite sent to ${inviteEmail.trim()}`);
      setInviteEmail('');
      loadTeam();
    } else {
      setInviteMsg(`✗ ${data.error ?? 'Failed to send invite'}`);
    }
  }

  async function removeMember(userId: string) {
    if (!confirm('Remove this member?')) return;
    await fetch(`/api/team/members?user_id=${userId}`, { method: 'DELETE' });
    setMembers(prev => prev.filter(m => m.user_id !== userId));
  }

  async function revokeInvite(id: string) {
    await fetch(`/api/team/invite?id=${id}`, { method: 'DELETE' });
    setInvites(prev => prev.filter(i => i.id !== id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '600px' }}>
      {/* Members table */}
      <div>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>Members ({members.length})</p>
        <div className="card" style={{ overflow: 'hidden' }}>
          {members.map((m, i) => (
            <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: i < members.length - 1 ? '1px solid var(--bg-border)' : 'none' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
                {(m.display_name ?? m.email)[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.display_name ?? m.email}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{m.email}</p>
              </div>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: m.role === 'owner' ? 'var(--accent-subtle)' : 'var(--bg-elevated)', color: m.role === 'owner' ? 'var(--accent)' : 'var(--text-tertiary)', border: '1px solid var(--bg-border)', fontFamily: 'var(--font-mono)', textTransform: 'capitalize' }}>
                {m.role}
              </span>
              {canManage && m.role !== 'owner' && (
                <button onClick={() => removeMember(m.user_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--text-tertiary)', padding: '4px 8px', borderRadius: '4px' }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#F87171'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--text-tertiary)'; }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite section */}
      {canManage && (
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>Invite Member</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
              type="email"
              onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
              style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin')}
              style={{ ...inputStyle, width: 'auto' }}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={sendInvite} disabled={inviting} className="btn btn-primary" style={{ opacity: inviting ? 0.6 : 1 }}>
              {inviting ? '…' : 'Send Invite'}
            </button>
          </div>
          {inviteMsg && <p style={{ fontSize: '12px', marginTop: '8px', color: inviteMsg.startsWith('✓') ? 'var(--accent)' : '#F87171' }}>{inviteMsg}</p>}
        </div>
      )}

      {/* Pending invites */}
      {invites.length > 0 && (
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>Pending Invites</p>
          <div className="card" style={{ overflow: 'hidden' }}>
            {invites.map((inv, i) => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: i < invites.length - 1 ? '1px solid var(--bg-border)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{inv.email}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Expires {new Date(inv.expires_at).toLocaleDateString()}</p>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', textTransform: 'capitalize' }}>{inv.role}</span>
                {canManage && (
                  <button onClick={() => revokeInvite(inv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--text-tertiary)', padding: '2px 8px' }}>
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Danger Zone Tab ──────────────────────────────────────────────────────────
function DangerTab({ workspace, myRole }: { workspace: Workspace | null; myRole: string }) {
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (myRole !== 'owner') {
    return <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Only the workspace owner can perform these actions.</p>;
  }

  async function deleteWorkspace() {
    if (confirmName !== workspace?.name) return;
    if (!confirm('This is irreversible. Are you absolutely sure?')) return;
    setDeleting(true);
    // Placeholder — actual delete would cascade via Supabase RLS
    alert('Workspace deletion would be triggered here. Implement via service role in production.');
    setDeleting(false);
  }

  return (
    <div style={{ maxWidth: '480px' }}>
      <div style={{ padding: '20px', borderRadius: '10px', border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.04)' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#F87171', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Delete Workspace</p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
          This will permanently delete <strong style={{ color: 'var(--text-primary)' }}>{workspace?.name}</strong> and all its data. This cannot be undone.
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
          Type <code style={{ color: '#F87171', fontFamily: 'var(--font-mono)' }}>{workspace?.name}</code> to confirm:
        </p>
        <input
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          placeholder={workspace?.name}
          style={{ ...inputStyle, borderColor: 'rgba(248,113,113,0.3)', marginBottom: '12px' }}
        />
        <button
          onClick={deleteWorkspace}
          disabled={confirmName !== workspace?.name || deleting}
          style={{ padding: '8px 18px', borderRadius: '7px', border: 'none', cursor: confirmName === workspace?.name ? 'pointer' : 'not-allowed', background: '#F87171', color: '#fff', fontSize: '13px', fontWeight: 600, opacity: confirmName === workspace?.name ? 1 : 0.4 }}
        >
          {deleting ? 'Deleting…' : 'Delete Workspace'}
        </button>
      </div>
    </div>
  );
}

// ── Helper components ────────────────────────────────────────────────────────
function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid var(--bg-border)',
  background: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};
