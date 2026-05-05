import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY ?? 'contextmesh-default-dev-key-32ch';

// ── Token encryption ──────────────────────────────────────────────────────────

function getKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const key = getKey();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptToken(encrypted: string): string {
  const [ivHex, encryptedHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = getKey();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

// ── Webhook signature verification ───────────────────────────────────────────

export function verifyGitHubWebhook(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const expected = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ── GitHub API helpers ────────────────────────────────────────────────────────

export async function registerGitHubWebhook(
  accessToken: string,
  owner: string,
  repo: string,
  webhookUrl: string,
  secret: string
): Promise<number | null> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/hooks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'web',
      active: true,
      events: ['push', 'pull_request'],
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret,
        insecure_ssl: '0',
      },
    }),
  });

  if (!res.ok) {
    console.error('Failed to register GitHub webhook:', await res.text());
    return null;
  }

  const data = await res.json();
  return data.id as number;
}

export async function deleteGitHubWebhook(
  accessToken: string,
  owner: string,
  repo: string,
  hookId: number
): Promise<void> {
  await fetch(`https://api.github.com/repos/${owner}/${repo}/hooks/${hookId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getGitHubUser(accessToken: string) {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getGitHubRepos(accessToken: string) {
  const res = await fetch('https://api.github.com/user/repos?sort=pushed&per_page=50', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];
  return res.json();
}
