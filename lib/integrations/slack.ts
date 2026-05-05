import crypto from 'crypto';
export { encryptToken, decryptToken } from '@/lib/integrations/github';

// ── Slack webhook signature verification ─────────────────────────────────────

export function verifySlackSignature(
  body: string,
  headers: Headers
): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) return false;

  const timestamp = headers.get('x-slack-request-timestamp');
  const signature = headers.get('x-slack-signature');
  if (!timestamp || !signature) return false;

  // Reject requests older than 5 minutes
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
  if (parseInt(timestamp, 10) < fiveMinutesAgo) return false;

  const sigBase = `v0:${timestamp}:${body}`;
  const expected = `v0=${crypto
    .createHmac('sha256', secret)
    .update(sigBase)
    .digest('hex')}`;

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ── Message filtering ─────────────────────────────────────────────────────────

interface SlackMessage {
  text: string;
  thread_ts?: string;
  reply_count?: number;
  reactions?: Array<{ name: string }>;
  bot_id?: string;
}

export function isContextWorthy(message: SlackMessage): boolean {
  if (message.bot_id) return false;
  if (!message.text) return false;

  const text = message.text.toLowerCase();

  const signals = [
    message.reactions?.some((r) =>
      ['white_check_mark', 'memo', 'brain', 'bulb', 'warning'].includes(r.name)
    ),
    text.includes('decided'),
    text.includes('decision:'),
    text.includes('agreed'),
    text.includes('blocker'),
    text.includes('architecture'),
    text.includes('todo'),
    text.includes('action item'),
    text.includes('we will'),
    text.includes('going with'),
    Boolean(message.thread_ts && (message.reply_count ?? 0) > 2),
  ];

  return signals.filter(Boolean).length >= 1;
}

// ── Slack API helpers ─────────────────────────────────────────────────────────

export async function getSlackChannels(botToken: string) {
  const res = await fetch(
    'https://slack.com/api/conversations.list?types=public_channel&limit=100',
    { headers: { Authorization: `Bearer ${botToken}` } }
  );
  const data = await res.json();
  if (!data.ok) return [];
  return (data.channels as Array<{ id: string; name: string }>) ?? [];
}

export async function joinSlackChannel(botToken: string, channelId: string) {
  await fetch('https://slack.com/api/conversations.join', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel: channelId }),
  });
}
