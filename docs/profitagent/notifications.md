# Soft-book lead notifications

When someone soft-books in the site chat, `/api/lead` notifies you.

## Always on (no Vercel setup)

### 1. Phone push — **do this once (2 minutes)**

1. Install **[ntfy](https://ntfy.sh/)** (iOS / Android / web)
2. Subscribe to topic:

```text
md-softbook-jwm-7f3a9c2e1b84
```

3. Enable notifications for that topic

Every soft-book will push: name, phone, time windows, intent.

### 2. Email — hello@mahoneydigital.net

Uses FormSubmit. **First lead may send an activation email** — open it and click confirm once. After that, every lead emails automatically.

---

## Optional Vercel env vars

Project: `mahoney-digital` · team Grok237  
Dashboard → Settings → Environment Variables → Production

| Variable | Purpose |
|----------|---------|
| `LEAD_NOTIFY_EMAIL` | Override email (default `hello@mahoneydigital.net`) |
| `NTFY_TOPIC` | Override ntfy topic |
| `LEAD_WEBHOOK_URL` | Make.com / Zapier / SMS webhook |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_ALLOWED_USER_ID` | Telegram DM (same as OpenClaw tools) |
| `RESEND_API_KEY` | Prefer Resend over FormSubmit for email |
| `XAI_API_KEY` | Chat AI replies (already used by `/api/chat`) |

Redeploy after adding env vars (or wait for next git push).

---

## Test

1. Open https://mahoneydigital.net/ → chat → **Book a call**
2. Enter a test name, your cell, two time windows
3. You should get an ntfy push + email

---

*Wired 2026-08-01 — no LEAD_WEBHOOK_URL required for basic alerts.*
