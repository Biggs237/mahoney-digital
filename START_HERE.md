# Start here — Mahoney Digital

**Updated:** June 2026 · **Owner:** Jeremy Mahoney

Open this file when you sit down to work. Everything else in the repo supports what’s below.

---

## This week (sales focus)

**Today (Sat):** Skip cold calls — run **OpenClaw** follow-ups & prep (see below). **Monday AM:** top 3 calls + follow-up queue phones.

| Goal | Target |
|------|--------|
| **Calls** | 5–8 from Lane A list (trades / auto / handyman) — **weekdays** |
| **Follow-ups** | All Lane A emails sent May 31 – Jun 2 with no reply |
| **New cold emails** | Pause until follow-ups are done (or send ≤2 high-priority only) |
| **Facebook** | Monitor only — don’t wait on group posts for leads |

**Follow-up week details:** `Outreach/Activity_Log.md` → section **This week — follow-up queue**

**Call lists (archived snapshots):** `Outreach/Archive/` · **Walk-in (cards):** `Outreach/Walk_In_Script.md` · **Per-prospect scripts:** `Outreach/<Business>/Phone_Script.md`  
**Phone script in every prospect folder:** `Outreach/<Business>/Phone_Script.md`

**Log every touch:** `Outreach/Activity_Log.md` + that business’s `Outreach/<Folder>/Notes.md` (template: `Outreach/Notes_Log_Format.md`)

---

## Quick links

| What | Where |
|------|--------|
| Live site | https://mahoneydigital.net |
| Deploy / forms | `vercel.json` (Vercel) · contact form via FormSubmit.co |
| Business model (source of truth) | `VISION_AND_SCOPE.md` |
| Outreach pipeline | `Outreach/README.md` |
| Activity log | `Outreach/Activity_Log.md` |
| Ranked prospects (trades) | `Outreach/Archive/Chillicothe_Prospect_Rankings_2026-06-02.md` |
| Essential **website build** checklist (first client) | `docs/Essential/Essential_Website_Build_Checklist.md` |
| Essential **ongoing care** process | `docs/Essential/Essential_Care_Process.md` |
| Client-facing support docs | `docs/Client_Facing/` |
| Email / signature setup | `Outreach/Email_Setup_Guide.md` |
| OpenClaw agents + Telegram | `openclaw.ps1` · `.grok/agents/` · `tools/openclaw_telegram_bot.py` |

**Phone (all outreach):** (740) 492-8601  
**Email:** hello@mahoneydigital.net

---

## Naming cheat sheet (don’t mix these up)

| Website **build** (one-time project) | Demo example | Ongoing **support** (monthly) |
|-----------------------------------|--------------|-------------------------------|
| **Essential** ($1,450–$1,950) | Riverside Lawn (lawn) → `/examples/riverside-lawn/` (clean live Essential reference) · Casto's concept demo local-only (`Outreach/Castos_Auto_Repair/demo-site/`) — no public link | **Essential Care** → `site/plans/essential-care.html` |
| **Growth** ($2,650–$3,450) | Summit Comfort HVAC → `/examples/summit-comfort-hvac/` | **Growth Partner** → `site/plans/growth-partner.html` |
| **Signature** ($4,850–$6,850) | Heritage Home Partners → `/examples/heritage-home-partners/` | **Signature Alliance** → `site/plans/signature-alliance.html` |

After a good call, text the **demo link** for their trade — not the support-plan page unless they ask about maintenance.

**On-call tier differentiation (point this out on phone):** Essential = narrow scope (≤4 pages), one main CTA (phone), clean & fast, no dedicated service pages or reviews. Growth = 6–8 pages with dedicated service pages (e.g. AC/Heating), service areas for local SEO, reviews, multiple CTAs — built to capture leads. Signature = custom display serif typography, narrative Projects + Process pages, "Schedule consultation" framing, premium stats/trust signals, generous spacing. The live demos (riverside = Essential, summit = Growth, heritage = Signature) now include educational banners/footers that teach exactly this.

---

## Outreach: two lanes

### Lane A — First client (use now)

Trades, auto, handyman, lawn — weak or no website. Matches the homepage and demos.

**Top folders:** `Castos_Auto_Repair`, `Baughman_Lawncare_LLC`, `GH_Handyman_LLC`, `Southern_Ohio_Lawn_Maintenance`, `Lowes_Odd_Jobs`, `Clemmons_Son_Plumbing`, `Cralls_One_Stop_Shop`, `M_Work_LLC`, `Perfection_Edge_Landscaping`, `KP_Plumbing_Services_LLC`

**Pitch:** Essential tier · honest quote · demo on their phone.

### Lane B — Later

Restaurants, hospitality, cautious upgrades (e.g. `Lievita`), B&B — more content, slower decisions. Folders stay in `Outreach/`; don’t prioritize until Lane A has momentum or a clear inbound ask.

**Audit reference:** `Outreach/Chillicothe_Restaurant_Hospitality_Audit_2026.md`

---

## OpenClaw (Coordinator + team)

You only talk to **Coordinator** (desktop `grok` or Telegram). Coordinator delegates:

| Agent | Job | Run today (Saturday) |
|-------|-----|----------------------|
| **Coordinator** | Boss, status, routing | `.\openclaw.ps1` or Telegram |
| **Sales** | Follow-up email drafts | `.\openclaw.ps1 sales` |
| **LeadGenerator** | New Lane A prospects | `.\openclaw.ps1 leads` |
| **WebsiteBuilder** | Client sites after yes | `.\openclaw.ps1 build "brief"` |

**Telegram bot:** `.\openclaw.ps1 telegram` · Commands: `/status` `/calls` `/sales` `/leads`  
**Secrets:** copy `.env.example` → `.env` (already set if Coordinator works)

---

## When someone says yes

1. Create **`Clients/<BusinessName>/`** outside this repo (contracts, deposit, content).
2. Run **`docs/Essential/Essential_Website_Build_Checklist.md`** (or Growth/Signature when you add those checklists).
3. Keep `Outreach/<Folder>/Notes.md` as the pre-sale history.

---

## Repo map (short)

```
site/           → Deploy to Netlify (mahoneydigital.net)
Outreach/       → Prospects, scripts, Activity_Log
docs/           → Processes + client-facing materials
assets/         → Brand files (also copy share images into site/ when deploying)
VISION_AND_SCOPE.md
```

---

## Rules (from root README)

- One main project at a time  
- Document decisions in repo docs  
- Client delivery folders live outside this repo in `/Clients`  
- Archive old experiments in `/Archive`