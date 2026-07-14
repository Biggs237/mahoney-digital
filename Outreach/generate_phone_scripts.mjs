import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const OUTREACH = path.dirname(fileURLToPath(import.meta.url));
const SKIP = new Set([
  "Baughman_Lawncare_LLC",
  "Castos_Auto_Repair",
  "Southern_Ohio_Lawn_Maintenance",
]);
const GROWTH = new Set([
  "M_Work_LLC",
  "Indoors_and_Beyond_LLC",
  "Antecks_Renovation",
  "BMG_Property_Services",
  "Total_Remodeling_Service",
]);
const CAUTIOUS = new Set(["Lievita"]);
const FOLLOWUP = new Set([
  "Payless_Plumbing",
  "Foster_Farmstead_Marketplace",
  "Haulin_Grass_LLC",
  "Chillicothe_Comfort_Heating_and_Air",
  "Scotts_Landscaping_LLC",
  "Roberts_Allens_Handyman_Services",
  "Laurelville_Auto_Service_LLC",
  "The_Coop",
  "First_Capital_Nutrition",
]);

function parseContact(text) {
  const business = (text.match(/\*\*Business:\*\*\s*(.+)/) || [])[1]?.trim() || "";
  let phone = "_See Contact.md_";
  for (const line of text.split("\n")) {
    if (/phone/i.test(line)) {
      const m = line.match(/\(?\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}/);
      if (m) phone = m[0].trim();
    }
  }
  let hook = "";
  for (const line of text.split("\n")) {
    if (/rank|audit|score/i.test(line) && line.trim()) {
      hook = line.replace(/^[-*#\s]+/, "").trim();
      break;
    }
  }
  if (!hook) {
    for (const line of text.split("\n")) {
      if (/website|domain|facebook/i.test(line) && line.trim()) {
        hook = line.replace(/^[-*#\s]+/, "").trim();
        break;
      }
    }
  }
  return { business, phone, hook: hook || "See Contact.md and Notes.md for web audit details." };
}

function classify(folder, blob) {
  const key = folder.toLowerCase();
  if (CAUTIOUS.has(folder)) return "cautious";
  if (GROWTH.has(folder)) return "growth";
  if (/hvac|comfort|heating/.test(key) || /hvac/.test(blob)) return "hvac";
  if (/auto|garage|diesel|car|zars|casto|laurelville/.test(key) || /auto repair/.test(blob)) return "auto";
  if (/lawn|grass|landscape|mow|haulin|baughman|scott/.test(key) || /lawn|landscape/.test(blob)) return "lawn";
  if (/plumb|payless|clemmons|kp_plumbing/.test(key) || /plumb/.test(blob)) return "plumbing";
  if (/restaurant|saloon|pizzeria|coffee|kitchen|breakfast|nutrition|coop|farmstead|goodwin|lunch/.test(key))
    return "hospitality";
  return "trades";
}

function pricing(kind) {
  if (kind === "growth")
    return ["Growth", "most projects land around **$2,900–$3,200** one-time", "https://mahoneydigital.net/examples/summit-comfort-hvac/"];
  if (kind === "cautious")
    return ["Upgrade (cautious)", "scoped honestly after reviewing what you already have", "https://mahoneydigital.net/"];
  return ["Essential", "most projects land around **$1,650–$1,750** one-time", "https://mahoneydigital.net/examples/riverside-lawn/"];
}

function hookLine(kind, business, raw) {
  if (raw && raw.length > 20 && !raw.includes("See Contact"))
    return `> “I was looking at ${business} online — ${raw.replace(/\*\*/g, "")} That’s the kind of thing I help with.”`;
  const d = {
    lawn: "> “A lot of lawn companies do great work but only show up on Facebook — when someone searches on their phone, a real website with click-to-call wins the call.”",
    auto: `> “Shops like ${business} often have no simple website when someone searches on their phone — just listings and social.”`,
    hvac: "> “HVAC companies lose calls when the site is outdated or hard to use on a phone — I help make services and click-to-call obvious.”",
    plumbing: "> “Plumbers get emergency searches on phones — a fast, clear site with click-to-call pays for itself.”",
    hospitality: "> “Local food businesses lose calls when hours, menu, or mobile aren’t easy — I help without big-agency pricing.”",
    trades: "> “Trades businesses often rely on word of mouth — a simple site catches people who don’t know you yet.”",
    growth: "> “Strong reviews — the gap is usually an owned website that matches that reputation.”",
    cautious: "> “You already have a site — I only suggest specific, honest upgrades — not a hard rebuild pitch.”",
  };
  return d[kind] || d.trades;
}

function build(folder, info, kind) {
  const [tier, price, demo] = pricing(kind);
  const biz = info.business || folder.replace(/_/g, " ");
  const trade = {
    lawn: "lawn and landscape",
    auto: "auto repair and mechanics",
    hvac: "HVAC and home services",
    plumbing: "plumbing and trades",
    hospitality: "local restaurants and hospitality",
    trades: "contractors and trades",
    growth: "established trades",
    cautious: "local businesses",
  }[kind];
  const follow = FOLLOWUP.has(folder)
    ? "\n**Note:** Prior email sent — **follow-up call**. Reference the email; keep it short.\n"
    : "";
  let care =
    "> **Updates:** optional **Essential Care** — **nominal monthly fee** (typically **under a hundred a month**) for security, backups, and small text changes. https://mahoneydigital.net/plans/";
  if (kind === "growth")
    care =
      "> **Updates:** optional **Growth Partner** — monthly support for updates and local visibility — fair monthly fee, scoped upfront. https://mahoneydigital.net/plans/";
  if (kind === "cautious") care = "> **Updates:** only if they ask — one honest improvement at a time.";

  return `# Phone script — ${biz}

**Folder:** \`${folder}\` · **Call:** **${info.phone}** · **From:** (740) 492-8601  
**Tier:** ${tier} · **Demo:** ${demo}  
**Master talk track:** \`../Phone_Script_Essential.md\`
${follow}
---

## Opener

> “Hi, this is Jeremy Mahoney with Mahoney Digital — I’m local to the Chillicothe area. I help small ${trade} businesses get an affordable website that works on a customer’s phone. Do you have thirty seconds, or is this a bad time?”

---

## Custom hook

${hookLine(kind, biz, info.hook)}

---

## Benefits + low cost + updates

> **Benefit:** look professional online, make it easy to call or request service from a phone, and stop losing customers to the next listing.
>
> **Cost (${tier}):** ${price} — **low** compared to **$3,000+** template sites that don’t bring calls. No long contract; honest quote in writing first.
>
> **High value for the money:** more trust on the first click, more calls from people who didn’t already know you.
>
${care}

---

## Close

> “I’m not trying to close you on the phone. Want me to text a quick example link? Ten-minute call later only if it’s useful — no pressure.”

---

## Voicemail

> “Hi, Jeremy Mahoney with Mahoney Digital — Chillicothe area. I help local businesses get an affordable mobile-friendly website. (740) 492-8601. Thanks.”

---

## In-person / walk-in (business card)

> “I’m Jeremy — local. I help small businesses with simple websites and optional low-cost monthly updates. Here’s my card — no pressure. Ten-minute chat anytime if useful.”

---

## After a warm response

Text from **(740) 492-8601:**

> Jeremy – Mahoney Digital. Example: ${demo} · Info: https://mahoneydigital.net · (740) 492-8601

Log in \`Notes.md\` and \`Activity_Log.md\`.
`;
}

let created = 0,
  updated = 0,
  skipped = 0;
for (const ent of fs.readdirSync(OUTREACH, { withFileTypes: true })) {
  if (!ent.isDirectory()) continue;
  const folder = ent.name;
  const contactPath = path.join(OUTREACH, folder, "Contact.md");
  const outPath = path.join(OUTREACH, folder, "Phone_Script.md");
  if (!fs.existsSync(contactPath)) continue;
  if (SKIP.has(folder) && fs.existsSync(outPath)) {
    skipped++;
    continue;
  }
  const text = fs.readFileSync(contactPath, "utf8");
  const info = parseContact(text);
  const kind = classify(folder, (folder + text).toLowerCase());
  const content = build(folder, info, kind);
  const exists = fs.existsSync(outPath);
  fs.writeFileSync(outPath, content, "utf8");
  exists ? updated++ : created++;
}
console.log(`Phone scripts: ${created} created, ${updated} updated, ${skipped} skipped (hand-tuned)`);