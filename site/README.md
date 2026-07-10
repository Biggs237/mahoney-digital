# Mahoney Digital — Website

This folder contains the live static site for mahoneydigital.net.

## Current Pages
- `index.html` — Homepage (hero, tiers, how it works, final CTA)
- `plans/` — Support Plans section (Essential Care, Growth Partner, Signature Alliance + comparison)

## How to View Locally
1. Open `index.html` in any browser
2. Navigate between pages using the links (they are relative)

## Next Steps
- Real photos / case studies: Main site portfolio cards (desktop grid + mobile scroll) now use 3 controlled, web-optimized local images in /assets/images/ (heritage kitchen, HVAC install, residential lawn — all Ohio residential service aesthetic). Signature projects.html gallery uses 2 of them (plus overlays/captions per existing comments) to model premium imagery direction. Growth recent-work strip lightly upgraded with 1. Picsum remaining only in a few demo interiors; all are placeholders — swap for real client project photos after first deliveries. Total new image payload ~390KB. Essential card stays clean/minimal.
- Deploy via Vercel (GitHub → auto-deploy; see `../vercel.json`)
- Logo & brand assets: see `../assets/brand/` (SVG source of truth) + `../assets/logo/`. Site nav/footer/favicon updated to match (June 2026).

## Design Notes
- Built with Tailwind CSS (CDN version for simplicity)
- Clean, honest, professional aesthetic
- Fully responsive
- No hype — matches the brand voice

Last updated: June 2026 — controlled images added to main portfolio + Signature gallery model

## Deploying (Production)

Production deploys via **Vercel** from the repo root (`vercel.json` sets `outputDirectory` to `site/`). Push to `master` on GitHub to deploy.

- **Contact form:** FormSubmit.co (not Netlify Forms)
- **DNS:** Porkbun → Vercel (`76.76.21.21` apex, `www` CNAME `cname.vercel-dns.com`)
- **Cutover script:** `tools/cutover-dns-porkbun.ps1`

### Post-Deploy Checklist
- [ ] Verify contact form redirects to `/thank-you`
- [ ] Test on real mobile devices (iOS + Android)
- [ ] Check Google Search Console + submit sitemap

The site is 100% static, zero dependencies at runtime besides the CDNs (Tailwind + Font Awesome). It will load fast and work reliably.

