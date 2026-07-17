# How to push mahoneydigital.net updates

**Repo:** `C:\Users\Jeremy Mahoney\MahoneyDigital\Projects\mdsite`  
**Live:** https://mahoneydigital.net  
**GitHub:** `Biggs237/mahoney-digital` · branch `master`  
**Hosting:** Vercel project `mahoney-digital` (team Grok237), auto-deploys from GitHub

---

## Correct way (always use this)

GitHub is connected to Vercel. **Commit + push = production.**

### For AI agents (Grok / Composer / Cursor)

**You can and must run these commands yourself** via the shell/terminal tool. Do **not** tell the owner you “can’t” push, and do **not** only paste commands for them to run.

1. Working directory must be: `C:\Users\Jeremy Mahoney\MahoneyDigital\Projects\mdsite`
2. Request full permissions if the tool asks (`git_write` / network / `all`) — push needs network + write.
3. Then run:

```powershell
cd "C:\Users\Jeremy Mahoney\MahoneyDigital\Projects\mdsite"
git status
git pull origin master
# after your edits:
git add -A
git commit -m "Describe the site change clearly"
git push origin master
```

4. Confirm: `git status -sb` shows `master...origin/master` with no “ahead”.

### Manual (owner)

Same commands in PowerShell from that folder.

Wait ~30–60 seconds, then hard-refresh https://mahoneydigital.net (Ctrl+F5).

Optional check via Vercel MCP: `list_deployments` for project `prj_Nyv2KNqvZ3MnWfhw0vW514229ASZ`, team `team_mLJtakdtY16nQBg1UPrG5R0F`. Look for `state: READY` and `target: production`.

---

## Do NOT use (broken / unreliable)

| Method | Why it fails |
|--------|----------------|
| `deploy_to_vercel` MCP with a partial file list | Incomplete payloads → Vercel mis-detects Python → build ERROR |
| `scripts/vercel-deploy.mjs` with raw API token from `mcp_credentials.json` | Stored token often `invalidToken` / 403 |
| Uploading only a few HTML files | Same as incomplete MCP deploy |

`deploy_to_vercel` is fine for **tiny greenfield apps**, not this full static site. Prefer **git push**.

---

## What to edit

| Path | Purpose |
|------|---------|
| `site/` | Everything public (HTML, assets, examples, blog) |
| `vercel.json` | Rewrites, headers, static output (`outputDirectory: site`) |
| `middleware.js` | Edge auth (e.g. Casto's demo) |
| `site/assets/site.css` | Built CSS — regenerate with `npm run build:css` |

Outreach, docs, and notes do **not** need a deploy unless you also change `site/`.

---

## If push fails

1. Confirm cwd is `...\MahoneyDigital\Projects\mdsite` (not an old OneDrive/worktree path).
2. `git remote -v` should show `https://github.com/Biggs237/mahoney-digital.git`.
3. `git pull origin master` then resolve conflicts and push again.
4. In Vercel dashboard: GitHub integration enabled for this repo + production branch `master`.

---

*Updated: July 2026 — after failed MCP file deploys; git path confirmed working.*
