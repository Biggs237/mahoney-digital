# Mahoney Digital — Website

This folder contains the live static site for mahoneydigital.net.

## Current Pages
- `index.html` — Homepage (hero, tiers, how it works, final CTA)
- `plans/` — Support Plans section (Essential Care, Growth Partner, Signature Alliance + comparison)

## How to View Locally
1. Open `index.html` in any browser
2. Navigate between pages using the links (they are relative)

## Next Steps
- Add real photos / case studies as projects complete (placeholders are clean for launch)
- Deploy to Netlify + connect mahoneydigital.net custom domain
- (Logo / brand assets can be added later per owner preference)

## Design Notes
- Built with Tailwind CSS (CDN version for simplicity)
- Clean, honest, professional aesthetic
- Fully responsive
- No hype — matches the brand voice

Last updated: May 2026 — SHOWTIME READY

Files included for clean Netlify deploy:
- index.html
- plans/ folder (multiple pages)
- 404.html
- netlify.toml (forms + security headers + 404 handling)
- robots.txt
- sitemap.xml
- .nojekyll (prevents Jekyll processing)
- DEPLOY.md (simple instructions)

## Deploying to Netlify (Production)

### Fastest: Drag & Drop
1. Go to https://app.netlify.com and log in (free account).
2. Drag the entire `site/` folder (this directory) onto the "Drag and drop your site folder here" area.
3. Netlify will instantly deploy. Note the auto-generated URL (e.g. `your-site-123.netlify.app`).
4. Test the contact form (it should appear in Netlify dashboard > Forms after first submission).

### Recommended: Connect Git (for future updates)
1. `git init` inside `MahoneyDigital/`
2. Commit the `site/` folder (or the whole project).
3. In Netlify: "Import an existing project" > GitHub/GitLab/etc.
4. Set publish directory to `site` (or root if you move files).

### Custom Domain (mahoneydigital.net)
1. After first deploy, go to Site settings > Domain management > "Add custom domain".
2. Enter `mahoneydigital.net` and `www.mahoneydigital.net`.
3. Netlify gives you exact DNS records to add at your registrar (Namecheap, Google, Cloudflare, etc.):
   - Usually a CNAME for `www` → your-site.netlify.app
   - An A record (or ALIAS/ANAME) for apex `@` to Netlify IPs (they list 4)
4. Wait for DNS propagation (5–60 min). Netlify will provision HTTPS automatically (Let's Encrypt).
5. Set primary domain to the non-www or www version you prefer.

### Post-Deploy Checklist
- [ ] Verify contact form submissions arrive in Netlify Forms dashboard
- [ ] Test on real mobile devices (iOS + Android)
- [ ] Check Google Search Console + submit sitemap later
- [ ] Update VISION_AND_SCOPE.md "Immediate Priorities" when live

The site is 100% static, zero dependencies at runtime besides the CDNs (Tailwind + Font Awesome). It will load fast and work reliably.

