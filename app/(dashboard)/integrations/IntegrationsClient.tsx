'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import IntegrationCard from '@/components/integrations/IntegrationCard';
import { integrationsApi } from '@/lib/api';
import type { Integration } from '@/types';

const PROVIDERS = ['github', 'slack', 'jira', 'linear'] as const;

export default function IntegrationsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [workspacePlan, setWorkspacePlan] = useState<'free' | 'pro' | 'team'>('free');

  const load = useCallback(async () => {
    setLoading(true);
    const [intResult, settingsResult] = await Promise.all([
      integrationsApi.list(),
      fetch('/api/settings/workspace').then(r => r.json()).catch(() => null),
    ]);
    if (!intResult.error) setIntegrations(intResult.data ?? []);
    if (settingsResult?.data?.workspace?.plan) {
      setWorkspacePlan(settingsResult.data.workspace.plan as 'free' | 'pro' | 'team');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Handle OAuth return params
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected) {
      showToast(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`, 'success');
      router.replace('/integrations');
      load();
    } else if (error) {
      const messages: Record<string, string> = {
        github_not_configured: 'GitHub integration is not configured yet. Add GITHUB_INTEGRATION_CLIENT_ID to .env.local',
        slack_not_configured: 'Slack integration is not configured yet. Add SLACK_CLIENT_ID to .env.local',
        github_denied: 'GitHub authorization was denied.',
        slack_denied: 'Slack authorization was denied.',
        github_token_failed: 'Failed to get GitHub access token.',
        slack_token_failed: 'Failed to get Slack access token.',
      };
      showToast(messages[error] ?? `Connection error: ${error}`, 'error');
      router.replace('/integrations');
    }
  }, [searchParams]);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }

  function getIntegration(provider: string): Integration | null {
    return integrations.find((i) => i.provider === provider && i.status !== 'disconnected') ?? null;
  }

  function handleConnect(provider: string) {
    setConnecting(provider);
    window.location.href = `/api/integrations/${provider}/connect`;
  }

  async function handleDisconnect(provider: 'github' | 'slack') {
    if (!confirm(`Disconnect ${provider}? Existing context items will be kept.`)) return;
    setDisconnecting(provider);
    const result = await integrationsApi.disconnect(provider);
    setDisconnecting(null);
    if (result.error) {
      showToast(`Failed to disconnect: ${result.error}`, 'error');
    } else {
      showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected.`, 'success');
      setIntegrations((prev) =>
        prev.map((i) => i.provider === provider ? { ...i, status: 'disconnected' } : i)
      );
    }
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Integrations
        </p>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '4px' }}>
          Integrations
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Connect your tools to automatically ingest context into your projects.
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 200,
          padding: '12px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
          background: toast.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
          color: toast.type === 'success' ? '#34D399' : '#F87171',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {toast.message}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={24} style={{ color: 'var(--text-tertiary)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {PROVIDERS.map((provider) => (
            <IntegrationCard
              key={provider}
              provider={provider}
              integration={getIntegration(provider)}
              workspacePlan={workspacePlan}
              connecting={connecting === provider}
              disconnecting={disconnecting === provider}
              onConnect={() => handleConnect(provider)}
              onDisconnect={() => handleDisconnect(provider as 'github' | 'slack')}
            />
          ))}
        </div>
      )}

      {/* Info box */}
      <div style={{
        marginTop: '24px', borderRadius: '10px', padding: '16px 20px',
        background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
      }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          🔒 All integration tokens are <strong style={{ color: 'var(--text-primary)' }}>AES-256 encrypted</strong> before storage.
          Jira and Linear require a Pro plan. Webhooks are verified with HMAC signatures.
        </p>
      </div>
    </>
  );
}
