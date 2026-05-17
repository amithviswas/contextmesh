'use client';

import { Loader2, CheckCircle2, XCircle, AlertCircle, ExternalLink, Unplug } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';
import type { Integration } from '@/types';

interface ProviderMeta {
  name: string;
  icon: string;
  color: string;
  description: string;
  planRequired?: 'pro';
}

const PROVIDERS: Record<string, ProviderMeta> = {
  github: {
    name: 'GitHub',
    icon: '⌥',
    color: '#6e40c9',
    description: 'Auto-ingest commits and pull requests as context items.',
  },
  slack: {
    name: 'Slack',
    icon: '#',
    color: '#E01E5A',
    description: 'Capture decisions and blockers from team conversations.',
  },
  jira: {
    name: 'Jira',
    icon: 'J',
    color: '#0052CC',
    description: 'Sync issues, epics, and sprint data.',
    planRequired: 'pro',
  },
  linear: {
    name: 'Linear',
    icon: 'L',
    color: '#5E6AD2',
    description: 'Sync issues and project cycles.',
    planRequired: 'pro',
  },
};

interface Props {
  provider: string;
  integration: Integration | null; // null = not connected
  workspacePlan?: 'free' | 'pro' | 'team';
  connecting?: boolean;
  disconnecting?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function IntegrationCard({
  provider,
  integration,
  workspacePlan = 'free',
  connecting,
  disconnecting,
  onConnect,
  onDisconnect,
}: Props) {
  const meta = PROVIDERS[provider];
  if (!meta) return null;

  const isConnected = integration?.status === 'active';
  const isError = integration?.status === 'error';
  // Only lock if the integration requires Pro AND the workspace is still on Free plan
  const isLocked = Boolean(meta.planRequired) && workspacePlan === 'free';

  return (
    <div
      id={`integration-card-${provider}`}
      className="card"
      style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        opacity: isLocked ? 0.65 : 1,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Icon */}
        <div
          style={{
            width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${meta.color}18`, border: `1px solid ${meta.color}30`,
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '18px',
            color: meta.color,
          }}
        >
          {meta.icon}
        </div>

        {/* Name + desc */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {meta.name}
            </p>
            {isLocked && (
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                background: 'rgba(251,191,36,0.12)', color: '#FBBF24',
                border: '1px solid rgba(251,191,36,0.25)', fontFamily: 'var(--font-mono)',
              }}>
                PRO
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {meta.description}
          </p>
        </div>

        {/* Status pill */}
        <StatusPill integration={integration} isLocked={isLocked} />
      </div>

      {/* Stats row (only when connected) */}
      {isConnected && integration && (
        <div style={{
          display: 'flex', gap: '20px', padding: '10px 14px',
          background: 'var(--bg-elevated)', borderRadius: '8px',
          border: '1px solid var(--bg-border)',
        }}>
          <div>
            <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {integration.items_synced}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>items synced</p>
          </div>
          {integration.last_synced_at && (
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1 }}>
                {formatDistanceToNow(integration.last_synced_at)}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>last synced</p>
            </div>
          )}
          <ConfigStat label="account" value={integration.config?.github_login} prefix="@" />
          <ConfigStat label="workspace" value={integration.config?.team_name} />
        </div>
      )}

      {/* Error message */}
      {isError && integration?.error_message && (
        <div style={{
          padding: '8px 12px', borderRadius: '8px',
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
          fontSize: '12px', color: 'var(--color-error)',
        }}>
          {integration.error_message}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {isLocked ? (
          <button className="btn btn-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            🔒 Upgrade to Pro
          </button>
        ) : isConnected ? (
          <>
            <a
              href={`https://${provider}.com`}
              target="_blank"
              rel="noopener noreferrer"
              id={`open-${provider}`}
              className="btn btn-secondary"
              style={{ textDecoration: 'none' }}
            >
              <ExternalLink size={13} /> Open {meta.name}
            </a>
            <button
              id={`disconnect-${provider}`}
              onClick={onDisconnect}
              disabled={disconnecting}
              className="btn"
              style={{
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)',
                color: 'var(--color-error)',
              }}
            >
              {disconnecting ? (
                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Unplug size={13} />
              )}
              Disconnect
            </button>
          </>
        ) : (
          <button
            id={`connect-${provider}`}
            onClick={onConnect}
            disabled={connecting}
            className="btn btn-primary"
          >
            {connecting ? (
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              `Connect ${meta.name}`
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function StatusPill({
  integration,
  isLocked,
}: {
  integration: Integration | null;
  isLocked: boolean;
}) {
  if (isLocked) {
    return (
      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        🔒 Pro required
      </span>
    );
  }
  if (!integration || integration.status === 'disconnected') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--bg-border)', display: 'inline-block' }} />
        Not connected
      </span>
    );
  }
  if (integration.status === 'error') {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#F87171' }}>
        <AlertCircle size={12} /> Error
      </span>
    );
  }
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#34D399' }}>
      <CheckCircle2 size={12} /> Connected
    </span>
  );
}

function ConfigStat({ label, value, prefix = '' }: { label: string; value: unknown; prefix?: string }) {
  if (!value) return null;
  return (
    <div>
      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1 }}>
        {prefix}{String(value)}
      </p>
      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{label}</p>
    </div>
  );
}

