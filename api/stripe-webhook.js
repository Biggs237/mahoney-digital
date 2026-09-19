/**
 * Stripe webhook for Mahoney Digital deposits.
 * Source of truth is the signed Stripe event, not the /pay/thanks page.
 *
 * Env:
 *  - STRIPE_WEBHOOK_SECRET  required (Vercel)
 *  - LEAD_NOTIFY_EMAIL      optional, default hello@mahoneydigital.net
 *  - RESEND_API_KEY         optional
 *  - NTFY_TOPIC             optional
 *  - LEAD_WEBHOOK_URL       optional Grok/Make hook after a paid event
 */

import crypto from "node:crypto";

export const config = {
  api: { bodyParser: false },
};

const DEFAULT_EMAIL = "hello@mahoneydigital.net";
const DEFAULT_NTFY_TOPIC = "md-softbook-jwm-7f3a9c2e1b84";

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function verifyStripeSignature(rawBody, header, secret) {
  if (!header || !secret) return null;
  const parts = Object.fromEntries(
    header.split(",").map((piece) => {
      const [k, ...rest] = piece.trim().split("=");
      return [k, rest.join("=")];
    })
  );
  const timestamp = parts.t;
  const expected = parts.v1;
  if (!timestamp || !expected) return null;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(Number(timestamp)) || age > 300) return null;

  const signed = `${timestamp}.${rawBody.toString("utf8")}`;
  const digest = crypto.createHmac("sha256", secret).update(signed).digest("hex");

  const a = Buffer.from(digest, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  return JSON.parse(rawBody.toString("utf8"));
}

function dollars(cents) {
  if (typeof cents !== "number") return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function formatPayment(event) {
  const obj = event.data?.object || {};
  const meta = obj.metadata || {};
  const amount = obj.amount_total ?? obj.amount_paid ?? obj.amount_due;
  return [
    `PAID EVENT — Mahoney Digital`,
    `Type: ${event.type}`,
    `Package: ${meta.package || "—"}`,
    `Kind: ${meta.kind || "—"}`,
    `Amount: ${dollars(amount)} ${obj.currency || "usd"}`,
    `Email: ${obj.customer_details?.email || obj.customer_email || "—"}`,
    `Name: ${obj.customer_details?.name || "—"}`,
    `Phone: ${obj.customer_details?.phone || "—"}`,
    `Session: ${obj.id || "—"}`,
    `Payment status: ${obj.payment_status || obj.status || "—"}`,
    `When: ${new Date().toISOString()}`,
  ].join("\n");
}

async function notifyNtfy(text, topic) {
  const res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
    method: "POST",
    headers: {
      Title: "Deposit paid",
      Priority: "high",
      Tags: "moneybag,white_check_mark",
      Click: "https://dashboard.stripe.com/payments",
    },
    body: text,
  });
  if (!res.ok) throw new Error(`ntfy ${res.status}`);
}

async function notifyResend(text, to, apiKey, subject) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Mahoney Digital Payments <onboarding@resend.dev>",
      to: [to],
      subject,
      text,
    }),
  });
  if (!res.ok) throw new Error(`resend ${res.status} ${await res.text()}`);
}

async function notifyFormSubmit(text, to, subject) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: subject,
      _template: "table",
      _captcha: "false",
      message: text,
    }),
  });
  if (!res.ok) throw new Error(`formsubmit ${res.status} ${await res.text()}`);
}

async function notifyWebhook(payload, url) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`webhook ${res.status}`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET missing");
    return res.status(500).json({ error: "webhook_not_configured" });
  }

  let raw;
  try {
    raw = await readRawBody(req);
  } catch (err) {
    console.error("read body failed", err);
    return res.status(400).json({ error: "invalid_body" });
  }

  let event;
  try {
    event = verifyStripeSignature(raw, req.headers["stripe-signature"], secret);
  } catch (err) {
    console.error("signature parse failed", err);
    return res.status(400).json({ error: "invalid_payload" });
  }
  if (!event) {
    return res.status(400).json({ error: "invalid_signature" });
  }

  const handled = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "invoice.paid",
    "invoice.payment_failed",
  ]);
  if (!handled.has(event.type)) {
    return res.status(200).json({ received: true, ignored: event.type });
  }

  const text = formatPayment(event);
  const failed = event.type.endsWith("failed");
  const subject = failed
    ? `Payment failed — Mahoney Digital`
    : `Deposit paid — Mahoney Digital`;
  const results = {};
  const notifyEmail = (process.env.LEAD_NOTIFY_EMAIL || DEFAULT_EMAIL).trim();
  const ntfyTopic = (process.env.NTFY_TOPIC || DEFAULT_NTFY_TOPIC).trim();
  const resendKey = (process.env.RESEND_API_KEY || "").trim();
  const extraHook = (process.env.LEAD_WEBHOOK_URL || "").trim();

  try {
    await notifyNtfy(text, ntfyTopic);
    results.ntfy = "ok";
  } catch (err) {
    console.error("ntfy failed", err);
    results.ntfy = "fail";
  }

  try {
    if (resendKey) {
      await notifyResend(text, notifyEmail, resendKey, subject);
      results.email = "resend";
    } else {
      await notifyFormSubmit(text, notifyEmail, subject);
      results.email = "formsubmit";
    }
  } catch (err) {
    console.error("email failed", err);
    results.email = "fail";
  }

  if (extraHook) {
    try {
      await notifyWebhook(
        {
          source: "stripe-webhook",
          type: event.type,
          id: event.id,
          object: event.data?.object || {},
        },
        extraHook
      );
      results.webhook = "ok";
    } catch (err) {
      console.error("forward webhook failed", err);
      results.webhook = "fail";
    }
  }

  console.log("[stripe webhook]", JSON.stringify({ type: event.type, id: event.id, results }));
  return res.status(200).json({ received: true, notify: results });
}
