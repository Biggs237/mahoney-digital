/**
 * Soft-book / Instant Lead capture endpoint.
 * Optional: set LEAD_WEBHOOK_URL in Vercel to forward to Make/Zapier/SMS.
 */

const ALLOWED_ORIGINS = new Set([
  'https://mahoneydigital.net',
  'https://www.mahoneydigital.net',
]);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+-biggs237\.vercel\.app$/i.test(origin)) return true;
  return false;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = isAllowedOrigin(origin);

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(allowed ? 204 : 403).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (origin && !allowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }
  body = body || {};

  const lead = {
    name: String(body.name || '').slice(0, 120),
    phone: String(body.phone || '').slice(0, 40),
    windows: String(body.windows || '').slice(0, 240),
    intent: String(body.intent || body.message || '').slice(0, 500),
    page: String(body.page || '').slice(0, 300),
    source: 'site-chat-softbook',
    at: new Date().toISOString(),
  };

  if (!lead.phone || lead.phone.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ error: 'phone_required' });
  }

  const webhook = (process.env.LEAD_WEBHOOK_URL || '').trim();
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
    } catch (err) {
      console.error('lead webhook failed', err);
    }
  } else {
    console.log('[soft-book lead]', JSON.stringify(lead));
  }

  return res.status(200).json({
    ok: true,
    message:
      'Got it — soft-booked. Jeremy will confirm during business hours (Mon–Fri 8–5).',
  });
}
