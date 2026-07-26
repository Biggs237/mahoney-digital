/**
 * Vercel serverless chat — SpaceXAI / xAI (OpenAI-compatible).
 * Set XAI_API_KEY in Vercel → Project → Environment Variables.
 */

const SYSTEM = `You are the website chat assistant for Mahoney Digital (mahoneydigital.net), Jeremy Mahoney's solo website consulting business in Chillicothe, Ohio (Ross County / southern Ohio).

Tone: calm, professional, direct, no hype. Short answers (2–4 sentences unless listing packages). You are not Jeremy; you can take interest and point people to contact.

Facts:
- Phone (voice only, no texts): (740) 530-8790
- Email: hello@mahoneydigital.net
- Contact form: https://mahoneydigital.net/contact/
- Packages page: https://mahoneydigital.net/websites/
- Work/demos: https://mahoneydigital.net/work/
- Care plans: https://mahoneydigital.net/care-plans/

Website packages (ranges only — never invent a firm custom quote):
- Essential: $1,450–$1,950 (most ~$1,650–$1,750). Clean mobile site, up to ~4 pages, contact form, basic SEO, 30 days edits.
- Growth: $2,650–$3,450 (most ~$2,900–$3,200). More pages, service pages, local SEO setup, analytics, 60 days edits. Popular for leads.
- Signature: $4,850–$6,850. Fully custom, premium. ~90 days edits.

Care plans: Essential Care ~$59–$99/mo; Growth Partner ~$179–$279/mo; Signature Alliance $399+/mo.

Timeline: most Essential/Growth builds ~2–4 weeks. Client keeps domain. No long-term contract required just to get a site built.

Demos: Riverside Lawn (Essential), Summit Comfort HVAC (Growth), Heritage Home Partners (Signature) under /examples/.

Never: invent discounts, guarantee rankings, collect card/SSN, pretend to be Jeremy, or close a custom deal. For ready-to-buy or complex questions: suggest calling (740) 530-8790 or the contact form so Jeremy can follow up. Never tell users to text this number — it does not receive SMS.`;

const ALLOWED_ORIGINS = new Set([
  'https://mahoneydigital.net',
  'https://www.mahoneydigital.net',
]);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // Allow Vercel preview deployments for this project
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
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(allowed ? 204 : 403).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Block obvious cross-origin abuse when Origin is present and not allowed
  if (origin && !allowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const key = (process.env.XAI_API_KEY || '').trim();
  if (!key) {
    return res.status(503).json({
      error: 'not_configured',
      message: 'Chat AI is not configured yet. Please call (740) 530-8790 or use the contact form.',
    });
  }

  let body = req.body;
  if (body == null || typeof body === 'string') {
    try {
      const raw =
        typeof body === 'string'
          ? body
          : typeof req.body === 'string'
            ? req.body
            : '';
      if (raw) body = JSON.parse(raw);
      else if (body == null) body = {};
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }

  const userMessage = (body?.message || body?.content || '').toString().trim().slice(0, 2000);
  const history = Array.isArray(body?.history) ? body.history.slice(-8) : [];

  if (!userMessage) {
    return res.status(400).json({ error: 'Empty message' });
  }

  const messages = [
    { role: 'system', content: SYSTEM },
    ...history
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .map((m) => ({
        role: m.role,
        content: String(m.content).slice(0, 2000),
      })),
    { role: 'user', content: userMessage },
  ];

  try {
    const upstream = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.XAI_CHAT_MODEL || 'grok-4.5',
        messages,
        temperature: 0.4,
        max_tokens: 500,
      }),
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      console.error('xAI error', upstream.status, data);
      const detail = data?.error || data?.message || '';
      return res.status(502).json({
        error: 'upstream',
        detail: typeof detail === 'string' ? detail : JSON.stringify(detail),
        message:
          'Assistant temporarily unavailable. Call (740) 530-8790 or use the contact form.',
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      'Sorry — try again, or call (740) 530-8790.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'server',
      message: 'Something went wrong. Please call (740) 530-8790.',
    });
  }
}
