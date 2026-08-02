# Meta Pixel on mahoneydigital.net

## How it works

| Piece | Role |
|--------|------|
| `site/assets/meta-pixel.js` | Loads fbevents.js, `PageView`, optional `Lead` |
| `api/meta-config.js` | Serves pixel ID from Vercel env (no hard-coded secret in HTML) |
| `site/assets/vercel-insights.js` | Loads meta-pixel on every page that already includes analytics |

**PageView** — every page that loads `vercel-insights.js` / `meta-pixel.js`.

**Lead** — **only** on `/thank-you` (after FormSubmit accepts the contact form and redirects). Not on `/contact` load.

Contact form already posts to FormSubmit with `_next` → thank-you page. That redirect is the success signal.

## Pixel ID

**Active pixel:** `914276838392424`

Built into `meta-pixel.js` / `api/meta-config.js` as a fallback (pixel IDs are public in the browser).

Optional: still set in Vercel → **Settings → Environment Variables**:
- Name: `NEXT_PUBLIC_META_PIXEL_ID`
- Value: `914276838392424`
- Environments: Production (+ Preview if you want)

Redeploy after changing env.

## Test with Meta Pixel Helper

1. Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) (Chrome).
2. Visit homepage → Helper should show your Pixel + **PageView**.
3. Visit `/contact` → **PageView** only (no Lead).
4. Submit the form for real → land on `/thank-you` → **Lead** + **PageView**.
5. Optional: Events Manager → **Test events** while browsing.

## Ads optimization

In Ads Manager, optimize lead campaigns for the standard **Lead** event (not only landing-page views).

## Note on stack

This site is **static HTML on Vercel**, not Next.js App Router. The setup mirrors the same goals (env-based ID, site-wide PageView, Lead after form success) without `next/script`.
