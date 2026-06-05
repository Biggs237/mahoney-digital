#!/usr/bin/env python3
"""Generate Phone_Script.md for each Outreach/* folder with Contact.md."""

from __future__ import annotations

import re
from pathlib import Path

OUTREACH = Path(__file__).resolve().parent
SKIP_OVERWRITE = {
    "Baughman_Lawncare_LLC",
    "Castos_Auto_Repair",
    "Southern_Ohio_Lawn_Maintenance",
}

GROWTH_FOLDERS = {
    "M_Work_LLC",
    "Indoors_and_Beyond_LLC",
    "Antecks_Renovation",
    "BMG_Property_Services",
    "Total_Remodeling_Service",
}

CAUTIOUS_FOLDERS = {"Lievita"}

FOLLOWUP_EMAIL_FOLDERS = {
    "Payless_Plumbing",
    "Foster_Farmstead_Marketplace",
    "Haulin_Grass_LLC",
    "Chillicothe_Comfort_Heating_and_Air",
    "Scotts_Landscaping_LLC",
    "Roberts_Allens_Handyman_Services",
    "Laurelville_Auto_Service_LLC",
    "The_Coop",
    "First_Capital_Nutrition",
}

HOSPITALITY_KEYWORDS = (
    "restaurant",
    "saloon",
    "pizzeria",
    "coffee",
    "kitchen",
    "breakfast",
    "nutrition",
    "coop",
    "farmstead",
    "marketplace",
    "goodwin",
)

LAWN_KEYWORDS = ("lawn", "grass", "landscape", "mow", "haulin")
AUTO_KEYWORDS = ("auto", "garage", "mechanic", "diesel", "car", "zars", "laurelville_auto", "casto")
HVAC_KEYWORDS = ("hvac", "comfort", "heating", "air")
PLUMBING_KEYWORDS = ("plumb", "payless", "clemmons", "kp_plumbing")


def parse_contact(contact_path: Path) -> dict:
    text = contact_path.read_text(encoding="utf-8", errors="replace")
    business = ""
    m = re.search(r"\*\*Business:\*\*\s*(.+)", text)
    if m:
        business = m.group(1).strip()
    phone = ""
    for line in text.splitlines():
        if re.search(r"\*\*Phone:\*\*", line, re.I):
            pm = re.search(r"\(?\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}", line)
            if pm:
                phone = pm.group(0).strip()
                break
    hook = ""
    for line in text.splitlines():
        if "Rank" in line or "audit" in line.lower() or "score" in line.lower():
            hook = line.strip().lstrip("- ").strip()
            break
    if not hook:
        for line in text.splitlines():
            if "website" in line.lower() or "domain" in line.lower() or "facebook" in line.lower():
                if line.strip().startswith("-") or "**" in line:
                    hook = line.strip().lstrip("- ").strip()
                    break
    return {"business": business, "phone": phone or "_See Contact.md_", "hook": hook or "See Contact.md and Notes.md for web audit details."}


def classify(folder: str, contact_text: str) -> str:
    key = folder.lower()
    blob = (folder + " " + contact_text).lower()
    if folder in CAUTIOUS_FOLDERS:
        return "cautious"
    if folder in GROWTH_FOLDERS:
        return "growth"
    if any(k in key for k in HVAC_KEYWORDS) or "hvac" in blob:
        return "hvac"
    if any(k in key for k in AUTO_KEYWORDS) or "auto repair" in blob:
        return "auto"
    if any(k in key for k in LAWN_KEYWORDS) or "lawn" in blob or "landscape" in blob:
        return "lawn"
    if any(k in key for k in PLUMBING_KEYWORDS) or "plumb" in blob:
        return "plumbing"
    if any(k in key for k in HOSPITALITY_KEYWORDS):
        return "hospitality"
    if "handyman" in blob or "remodel" in blob or "renovation" in blob or "property" in blob:
        return "trades"
    return "trades"


def pricing_block(kind: str) -> tuple[str, str, str]:
    if kind == "growth":
        return (
            "Growth",
            "most projects land around **$2,900–$3,200** one-time",
            "https://mahoneydigital.net/examples/summit-comfort-hvac/",
        )
    if kind == "cautious":
        return (
            "Upgrade (cautious)",
            "scoped honestly after reviewing what you already have",
            "https://mahoneydigital.net/",
        )
    return (
        "Essential",
        "most projects land around **$1,650–$1,750** one-time",
        "https://mahoneydigital.net/examples/riverside-lawn/",
    )


def hook_line(kind: str, business: str, raw_hook: str) -> str:
    if raw_hook and len(raw_hook) > 20 and "See Contact" not in raw_hook:
        return f"> “I was looking at {business} online — {raw_hook.replace('**', '')} That’s the kind of thing I help with.”"
    defaults = {
        "lawn": f"> “A lot of lawn companies do great work but only show up on Facebook — when someone searches on their phone, a real website with click-to-call wins the call.”",
        "auto": f"> “Shops like {business} often have no simple website when someone searches on their phone — just listings and social.”",
        "hvac": f"> “HVAC companies lose calls when the site is outdated or hard to use on a phone — I help make it clear: services, area, click-to-call.”",
        "plumbing": f"> “Plumbers get a lot of emergency searches on phones — a fast, clear site with click-to-call pays for itself fast.”",
        "hospitality": f"> “Restaurants and local spots lose walk-ins and calls when the menu, hours, or mobile experience isn’t easy — I help without big-agency pricing.”",
        "trades": f"> “Trades businesses like yours often rely on word of mouth — a simple professional site catches the people who don’t know you yet.”",
        "growth": f"> “You’ve got strong reviews — the gap is usually an owned website that matches that reputation and turns searches into calls.”",
        "cautious": f"> “You already have a web presence — I only reach out when I see a specific, honest upgrade that would help — not a full rebuild pitch.”",
    }
    return defaults.get(kind, defaults["trades"])


def followup_note(folder: str) -> str:
    if folder in FOLLOWUP_EMAIL_FOLDERS:
        return "\n**Note:** Prior email sent — this is a **follow-up call**, not a cold pitch. Reference the email; keep it short.\n"
    return ""


def build_script(folder: str, info: dict, kind: str) -> str:
    tier, price, demo = pricing_block(kind)
    biz = info["business"] or folder.replace("_", " ")
    phone = info["phone"]
    trade_label = {
        "lawn": "lawn and landscape",
        "auto": "auto repair and mechanics",
        "hvac": "HVAC and home services",
        "plumbing": "plumbing and trades",
        "hospitality": "local restaurants and hospitality",
        "trades": "contractors and trades",
        "growth": "established trades",
        "cautious": "local businesses",
    }[kind]

    care_line = (
        "> **Updates:** optional **Essential Care** or **Growth Partner** — a **nominal monthly fee** "
        "(typically **under a hundred a month** for Essential Care, more for Growth) — security, backups, "
        "and small changes so you’re not maintaining the site yourself. Details: https://mahoneydigital.net/plans/"
    )
    if kind == "growth":
        care_line = (
            "> **Updates:** optional **Growth Partner** — monthly support for updates, local visibility, "
            "and hands-on help — fair monthly fee, scoped upfront. https://mahoneydigital.net/plans/"
        )
    if kind == "cautious":
        care_line = "> **Updates:** only discuss if they ask — focus on one specific improvement, not a hard sell."

    benefits = f"""> **Benefit:** look professional online, make it easy to call or request service from a phone, and stop losing customers to the next listing.
>
> **Cost ({tier}):** {price} — **low** compared to **$3,000+** template sites that don’t bring calls. No long contract; honest quote in writing first.
>
> **High value for the money:** more trust on the first click, more calls from people who didn’t already know you.
>
{care_line}"""

    return f"""# Phone script — {biz}

**Folder:** `{folder}` · **Call:** **{phone}** · **From:** 614-636-5248  
**Tier:** {tier} · **Demo:** {demo}  
**Master talk track:** `../Phone_Script_Essential.md`
{followup_note(folder)}
---

## Opener

> “Hi, this is Jeremy Mahoney with Mahoney Digital — I’m local to the Chillicothe area. I help small {trade_label} businesses get an affordable website that works on a customer’s phone. Do you have thirty seconds, or is this a bad time?”

---

## Custom hook

{hook_line(kind, biz, info["hook"])}

---

## Benefits + low cost + updates

{benefits}

---

## Close

> “I’m not trying to close you on the phone. Want me to text a quick example link? Ten-minute call later only if it’s useful — no pressure.”

---

## Voicemail

> “Hi, Jeremy Mahoney with Mahoney Digital — Chillicothe area. I help local businesses get an affordable mobile-friendly website. 614-636-5248. Thanks.”

---

## In-person / walk-in (business card)

> “I’m Jeremy — local, I help small businesses with simple websites and optional low-cost monthly updates. Here’s my card — no pressure. If you ever want a ten-minute look at what it would cost, give me a call.”

---

## After a warm response

Text from **614-636-5248:**

> Jeremy – Mahoney Digital. Example: {demo} · Info: https://mahoneydigital.net · 614-636-5248

Log in `Notes.md` and `Activity_Log.md`.
"""


def main() -> None:
    created = updated = skipped = 0
    for contact in sorted(OUTREACH.glob("*/Contact.md")):
        folder = contact.parent.name
        out = contact.parent / "Phone_Script.md"
        if folder in SKIP_OVERWRITE and out.exists():
            skipped += 1
            continue
        contact_text = contact.read_text(encoding="utf-8", errors="replace")
        info = parse_contact(contact)
        kind = classify(folder, contact_text)
        content = build_script(folder, info, kind)
        exists = out.exists()
        out.write_text(content, encoding="utf-8", newline="\n")
        if exists:
            updated += 1
        else:
            created += 1
    print(f"Phone scripts: {created} created, {updated} updated, {skipped} skipped (hand-tuned)")


if __name__ == "__main__":
    main()