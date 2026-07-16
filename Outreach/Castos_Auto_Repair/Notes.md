# Casto's Auto Repair — Outreach Notes

**Rank:** #1 Monday call (score 1/10)
**Audit date:** 2026-06-02

## Status

- [x] Facebook About checked 2026-06-03 — **no email** on page
- [ ] First outreach (phone / in-person — no email to send)
- [ ] **In-person visit planned** — owner heading to shop AM (see hours: Mon–Fri 9:30–6 only)
- [ ] FB message alternative prepared (see FB_Message_Draft.md)
- [ ] Reply received
- [ ] Follow-up

## Conversation log

**2026-06-03** — User harvest: castosautorepair FB, no email, (740) 637-3099, no website.

**2026-06-05** — Queued for tomorrow AM call. No owned site; US-23 location.

---

**Next action:** **In-person visit** — 3364 US-23 S. Bring card. **Unlisted demo** (password + noindex, not on homepage/sitemap): https://mahoneydigital.net/examples/castos-auto-repair — share login only after warm conversation. Log outcome here + `Activity_Log.md` after. **Hours: Mon–Fri 9:30 AM–6 PM — closed Sat/Sun.**

**2026-06-08 (Telegram):** Owner: "Let's hold off on deploying. Let me sleep on it." Deploy of tailored Casto's demo + site updates (homepage integrations, etc.) paused. Local files intact. Will decide after review.

**2026-06-08 (Telegram):** Owner: "I like it. We'd need to change the website to match." Positive feedback on the tailored Essential demo + homepage updates. Deploy pending to make public site match local. (Superseded by later hold instruction.)

**2026-06-08 (Coordinator implementation per latest Telegram):** "I like your ideas. ... Implement the changes you think will benefit Mahoneydigital the most. Leave Casto's demo alone for now." Updated all marketing (site/index.html portfolio + tier cards now feature live riverside-lawn as Essential example; education banners/footers + teaching copy added to riverside/summit/heritage indexes; plans/essential-care fixed; Calls + Casto's Phone_Script/FB/Outreach_Draft adjusted to use riverside-lawn for Monday call). No files under site/examples/castos-auto-repair/ were touched. Activity_Log updated. Ready for 9-11AM calls using live demos.

**2026-06-07 (prep):** WebsiteBuilder tailored build complete. Demo integrated locally to site/ (portfolio + Essential tier card now feature Casto's as the real Essential auto example with US-23 copy). Redirects + docs + outreach files updated.

**2026-07-10:** Demo briefly deployed live on Vercel (later removed).

**2026-07-15:** Owner request — Casto's demo briefly fully offline (homepage link removed).

**2026-07-15 (later):** Demo restored as **unlisted** at https://mahoneydigital.net/examples/castos-auto-repair — `noindex` on pages, `X-Robots-Tag` header, `robots.txt` Disallow, not in sitemap or homepage. Direct-link only; share after first conversation. Source copy also in `Outreach/Castos_Auto_Repair/demo-site/`.

**2026-07-15 (auth):** HTTP Basic Auth via Vercel Edge Middleware. Username: `castos` (env `CASTOS_DEMO_USER`). Password in Vercel env `CASTOS_DEMO_PASSWORD` — not stored in git.