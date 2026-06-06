# Mahoney Digital — Deploy to Netlify (Showtime)

**Goal:** Get mahoneydigital.net live tonight or first thing tomorrow.

---

## Easiest Way (Recommended Right Now)

1. Go to https://app.netlify.com
2. Log in (or create free account)
3. **Drag this entire folder** (`site/`) onto the big drop area
4. Wait 30 seconds — you'll get a live URL like `random-name.netlify.app`
5. Test it on your phone (especially the contact form and mobile menu)

---

## Add Your Real Domain (mahoneydigital.net)

After the first deploy:

1. In Netlify, click **Domain settings** → **Add custom domain**
2. Type `mahoneydigital.net`
3. Follow the DNS instructions Netlify shows you (they give you the exact records)
4. Add the records at your domain registrar (Namecheap, Google, etc.)
5. Come back in 10–30 mins — it will be live with HTTPS

---

## GitHub auto-deploy (repo root)

This project’s site files are in **`site/`**. The repo root **`netlify.toml`** sets `base = "site"` so Netlify uses `site/netlify.toml` (forms, redirects, headers).

In Netlify → **Site configuration → Build & deploy**:

1. **Linked repository** should be `Biggs237/mahoney-digital` (branch `master`).
2. **Build command** — leave empty (static site).
3. **Publish directory** — leave empty or `.` (root `netlify.toml` handles `site/`).
4. After a push, open **Deploys** — you should see a new deploy from GitHub within ~1 minute.

If pushes don’t trigger deploys, the site may still be on an old **drag-and-drop** deploy. Re-link GitHub or use **Deploys → Trigger deploy → Deploy site**.

## After It's Live

- Go to **Forms** tab in Netlify → confirm **contact** appears (may take one deploy after adding the hidden form in `index.html`).
- After submit, visitors should land on **/thank-you.html** (not a 404).
- If form submit still 404s, trigger a fresh deploy from the latest `master` commit.
- You can delete this `DEPLOY.md` file after launch if you want

---

**You're ready.** The site is clean, fast, and production-ready.

Just drag the folder. That's it.
