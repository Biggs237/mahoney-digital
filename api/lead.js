/**
 * Soft-book / Instant Lead capture + owner notify.
 *
 * Always-on (no Vercel env required):
 *  1) ntfy.sh push — subscribe on your phone (topic below)
 *  2) email to LEAD_NOTIFY_EMAIL (default hello@mahoneydigital.net) via FormSubmit
 *
 * Optional env (Vercel → Settings → Environment Variables):
 *  - LEAD_WEBHOOK_URL     Make/Zapier/custom webhook
 *  - LEAD_NOTIFY_EMAIL    override notify email
 *  - NTFY_TOPIC           override push topic
 *  - TELEGRAM_BOT_TOKEN + TELEGRAM_ALLOWED_USER_ID  Telegram DM
 *  - RESEND_API_KEY       Resend email (preferred over FormSubmit if set)
 */

const DEFAULT_EMAIL = 'hello@mahoneydigital.net';
// Private-ish topic — subscribe in the free ntfy app / ntfy.sh
const DEFAULT_NTFY_TOPIC = 'md-softbook-jwm-7f3a9c2e1b84';

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

function formatLeadText(lead) {
  return [
    'SOFT-BOOK LEAD — Mahoney Digital',
    `Name: ${lead.name || '—'}`,
    `Phone: ${lead.phone}`,
    `Windows: ${lead.windows || '—'}`,
    `Intent: ${lead.intent || '—'}`,
    `Page: ${lead.page || '—'}`,
    `When: ${lead.at}`,
  ].join('\n');
}

async function notifyNtfy(lead, topic) {
  const body = formatLeadText(lead);
  const res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
    method: 'POST',
    headers: {
      Title: 'Soft-book lead',
      Priority: 'high',
      Tags: 'telephone_receiver,briefcase',
      Click: 'https://mahoneydigital.net/contact/',
    },
    body,
  });
  if (!res.ok) throw new Error(`ntfy ${res.status}`);
}

async function notifyResend(lead, to, apiKey) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Mahoney Digital Leads <onboarding@resend.dev>',
      to: [to],
      subject: `Soft-book: ${lead.name || 'Lead'} · ${lead.phone}`,
      text: formatLeadText(lead),
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`resend ${res.status} ${t}`);
  }
}

async function notifyFormSubmit(lead, to) {
  // Free email gateway — first use may require one confirmation click in inbox
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      _subject: `Soft-book lead: ${lead.name || 'Visitor'} · ${lead.phone}`,
      _template: 'table',
      _captcha: 'false',
      name: lead.name || '—',
      phone: lead.phone,
      windows: lead.windows || '—',
      intent: lead.intent || '—',
      page: lead.page || '—',
      when: lead.at,
      message: formatLeadText(lead),
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`formsubmit ${res.status} ${t}`);
  }
}

async function notifyTelegram(lead, token, chatId) {
  const text = formatLeadText(lead);
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`telegram ${res.status} ${t}`);
  }
}

async function notifyWebhook(lead, url) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error(`webhook ${res.status}`);
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

  const results = {};
  const ntfyTopic = (process.env.NTFY_TOPIC || DEFAULT_NTFY_TOPIC).trim();
  const notifyEmail = (process.env.LEAD_NOTIFY_EMAIL || DEFAULT_EMAIL).trim();
  const webhook = (process.env.LEAD_WEBHOOK_URL || '').trim();
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const tgToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const tgChat = (process.env.TELEGRAM_ALLOWED_USER_ID || '').trim();

  // 1) Phone push (always)
  try {
    await notifyNtfy(lead, ntfyTopic);
    results.ntfy = 'ok';
  } catch (err) {
    console.error('ntfy failed', err);
    results.ntfy = 'fail';
  }

  // 2) Email
  try {
    if (resendKey) {
      await notifyResend(lead, notifyEmail, resendKey);
      results.email = 'resend';
    } else {
      await notifyFormSubmit(lead, notifyEmail);
      results.email = 'formsubmit';
    }
  } catch (err) {
    console.error('email notify failed', err);
    results.email = 'fail';
  }

  // 3) Optional Telegram
  if (tgToken && tgChat) {
    try {
      await notifyTelegram(lead, tgToken, tgChat);
      results.telegram = 'ok';
    } catch (err) {
      console.error('telegram failed', err);
      results.telegram = 'fail';
    }
  }

  // 4) Optional custom webhook
  if (webhook) {
    try {
      await notifyWebhook(lead, webhook);
      results.webhook = 'ok';
    } catch (err) {
      console.error('webhook failed', err);
      results.webhook = 'fail';
    }
  }

  console.log('[soft-book lead]', JSON.stringify({ lead, results }));

  return res.status(200).json({
    ok: true,
    message:
      'Got it — soft-booked. Jeremy will confirm during business hours (Mon–Fri 8–5).',
    notify: results,
  });
}
