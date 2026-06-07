#!/usr/bin/env python3
"""
OpenClaw Telegram Bot — Mahoney Digital

Talk to Coordinator from Telegram. Coordinator delegates to Sales,
LeadGenerator, and WebsiteBuilder (you never message them directly).

Run:
    python tools/openclaw_telegram_bot.py

Requires .env with TELEGRAM_BOT_TOKEN and TELEGRAM_ALLOWED_USER_ID.
"""

import os
import sys
import time
import subprocess
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).parent.parent.resolve()
TOOLS_DIR = Path(__file__).parent.resolve()
if str(TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(TOOLS_DIR))

load_dotenv(PROJECT_ROOT / ".env")

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ALLOWED_USER_ID = os.getenv("TELEGRAM_ALLOWED_USER_ID")
SESSION_ID = "openclaw-telegram-coordinator"

if not TOKEN or not ALLOWED_USER_ID:
    print("FATAL: Set TELEGRAM_BOT_TOKEN and TELEGRAM_ALLOWED_USER_ID in .env")
    sys.exit(1)

ALLOWED_USER_ID = str(ALLOWED_USER_ID)
BASE_URL = f"https://api.telegram.org/bot{TOKEN}"
OFFSET_FILE = PROJECT_ROOT / "tools" / ".telegram_offset"
LOCK_FILE = PROJECT_ROOT / "tools" / ".telegram_bot.lock"
LAST_REPLY_FILE = PROJECT_ROOT / "tools" / ".telegram_last_reply.txt"
BOT_VERSION = "2026-06-08-split-v2"
TELEGRAM_MAX_LEN = 4096
CHUNK_SIZE = 3900  # room for part labels and Telegram's 4096 cap


def get_offset() -> int:
    if OFFSET_FILE.exists():
        try:
            return int(OFFSET_FILE.read_text().strip())
        except Exception:
            pass
    return 0


def save_offset(offset: int):
    OFFSET_FILE.write_text(str(offset))


def split_text(text: str, max_len: int = CHUNK_SIZE) -> list[str]:
    """Split long text into Telegram-sized chunks, preferring paragraph/line breaks."""
    if len(text) <= max_len:
        return [text]

    chunks: list[str] = []
    remaining = text
    while remaining:
        if len(remaining) <= max_len:
            chunks.append(remaining)
            break

        cut = remaining.rfind("\n\n", 0, max_len + 1)
        if cut < max_len // 2:
            cut = remaining.rfind("\n", 0, max_len + 1)
        if cut < max_len // 2:
            cut = remaining.rfind(" ", 0, max_len + 1)
        if cut <= 0:
            cut = max_len

        chunk = remaining[:cut].rstrip()
        if not chunk:
            chunk = remaining[:max_len]
            cut = max_len

        chunks.append(chunk)
        remaining = remaining[cut:].lstrip()

    return chunks


def save_last_reply(text: str):
    try:
        LAST_REPLY_FILE.write_text(text, encoding="utf-8")
    except Exception as e:
        print(f"Could not save last reply: {e}")


def _send_single_message(
    chat_id: str, text: str, parse_mode: Optional[str] = "Markdown"
) -> bool:
    url = f"{BASE_URL}/sendMessage"
    text = text[:TELEGRAM_MAX_LEN]
    payloads = []
    if parse_mode:
        payloads.append({"chat_id": chat_id, "text": text, "parse_mode": parse_mode})
    payloads.append({"chat_id": chat_id, "text": text})

    for payload in payloads:
        payload["disable_web_page_preview"] = True
        for attempt in range(3):
            try:
                resp = requests.post(url, json=payload, timeout=15)
                if resp.ok:
                    return True
                if resp.status_code == 429:
                    retry_after = 2
                    try:
                        retry_after = int(resp.json().get("parameters", {}).get("retry_after", 2))
                    except Exception:
                        pass
                    print(f"Telegram rate limit — waiting {retry_after}s...")
                    time.sleep(retry_after)
                    continue
                if parse_mode and payload.get("parse_mode"):
                    print(f"Send markdown failed ({resp.status_code}), retrying plain text...")
                    break
                print(f"Send error: {resp.text}")
                return False
            except Exception as e:
                print(f"Send error: {e}")
                if attempt < 2:
                    time.sleep(1)
                    continue
                return False
    return False


def send_message(chat_id: str, text: str, parse_mode: Optional[str] = "Markdown"):
    if not text:
        return

    save_last_reply(text)
    chunks = split_text(text)
    total = len(chunks)
    # Markdown breaks easily across chunks — use plain text for multi-part replies.
    mode = parse_mode if total == 1 else None

    if total > 1:
        print(f"Sending {total} Telegram messages ({len(text)} chars)...")

    sent = 0
    for i, chunk in enumerate(chunks):
        part = chunk
        if total > 1:
            prefix = f"({i + 1}/{total})\n"
            if len(prefix) + len(part) > TELEGRAM_MAX_LEN:
                part = part[: TELEGRAM_MAX_LEN - len(prefix)]
            part = prefix + part

        if _send_single_message(chat_id, part, mode):
            sent += 1
        else:
            print(f"Failed chunk {i + 1}/{total}")

        if i < total - 1:
            time.sleep(0.5)

    if total > 1 and sent == total:
        print(f"Sent all {total} chunks.")
    elif total > 1 and sent < total:
        tail = (
            f"Some parts may not have sent ({sent}/{total}). "
            f"Full text saved to tools/.telegram_last_reply.txt"
        )
        _send_single_message(chat_id, tail, None)


DEFAULT_TIMEOUT = 300
COORDINATOR_TIMEOUT = 420
WEBSITE_BUILDER_TIMEOUT = 900


def call_agent(agent: str, prompt: str, timeout: int = DEFAULT_TIMEOUT) -> str:
    cmd = [
        "grok",
        "-p", prompt,
        "--cwd", str(PROJECT_ROOT),
        "--agent", agent,
        "-s", SESSION_ID if agent == "coordinator" else f"openclaw-telegram-{agent}",
        "--always-approve",
    ]
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT,
            timeout=timeout,
            encoding="utf-8",
            errors="replace",
        )
        output = (result.stdout or "") + (result.stderr or "")
        output = output.strip()
        return output or f"({agent} had no output)"
    except subprocess.TimeoutExpired:
        return (
            f"{agent} timed out after {timeout // 60} min.\n\n"
            "Try a smaller ask, use a shortcut (/sales, /leads), or run from desktop:\n"
            f"  .\\openclaw.ps1 {('sales' if agent == 'sales' else 'leads' if agent == 'leadgenerator' else '')}"
        ).rstrip()
    except Exception as e:
        return f"Error calling {agent}: {e}"


def normalize_substack_command(text: str) -> str:
    lower = text.strip().lower()
    aliases = {
        "/substacktest": "/substack test",
        "/substack-test": "/substack test",
        "/substackhelp": "/substack",
        "/substack compose": "/substack compose",
    }
    if lower in aliases:
        return aliases[lower]
    if lower.startswith("/substackcompose"):
        return "/substack compose" + text.strip()[len("/substackcompose") :]
    return text.strip()


def handle_substack_command(text: str) -> Optional[str]:
    from substack_client import (
        is_configured,
        load_pending,
        parse_title_from_markdown,
        preview_pending,
        publish_pending,
        push_draft,
        save_pending,
        test_connection,
    )

    text = normalize_substack_command(text)
    lower = text.lower()

    if lower == "/substack":
        return (
            "*Substack (unofficial API)*\n\n"
            "/substack test — verify credentials\n"
            "/substack compose <topic> — Mahoney Digital post\n"
            "/substack compose syas <topic> — SYAS (~1,000+ words)\n"
            "/substack compose syas long <topic> — SYAS extra long\n"
            "/substack preview — show pending post\n"
            "/substack draft — push pending to Substack as draft (no email)\n"
            "/substack publish yes — publish and email subscribers\n\n"
            "Configure SUBSTACK_PUBLICATION_URL + email/password or cookies in .env"
        )

    if lower == "/substack test":
        try:
            return test_connection()
        except Exception as e:
            return f"Substack test failed: {e}"

    if lower.startswith("/substack compose"):
        rest = text.strip()[len("/substack compose") :].strip()
        brand = "md"
        topic = rest
        long_form = False
        if rest.lower().startswith("syas long "):
            brand = "syas"
            long_form = True
            topic = rest[10:].strip()
        elif rest.lower().startswith("syas "):
            brand = "syas"
            topic = rest[5:].strip()
        elif rest.lower().startswith("md "):
            topic = rest[3:].strip()
        if not topic:
            return (
                "Usage:\n"
                "/substack compose <topic> — Mahoney Digital\n"
                "/substack compose syas <topic> — See You At Sunrise (longer)\n"
                "/substack compose syas long <topic> — SYAS extra long"
            )
        if brand == "syas":
            length_guide = (
                "Length: ~1,800–2,500 words. At least 5–7 ## sections. "
                "Let scenes breathe; use specific sensory detail and one slow narrative arc. "
                "End with a quiet landing — not a punchline."
                if long_form
                else
                "Length: ~1,000–1,500 words. At least 3–4 ## sections. "
                "Develop the idea fully — not a short note or caption."
            )
            prompt = (
                "Write a Substack newsletter post for *See You At Sunrise* (SYAS) "
                "in Markdown.\n\n"
                f"Topic: {topic}\n\n"
                f"{length_guide}\n\n"
                "Voice (Jeremy / SYAS — personal, not agency):\n"
                "- Reflective, warm, morning/light imagery; honest and unhurried\n"
                "- First person OK; literary but not pretentious\n"
                "- NOT sales copy — no Mahoney Digital pricing or client outreach\n"
                "- No Ohio trades prospecting; this is creative/personal writing\n"
                "- Title can include 'See You At Sunrise' when it fits naturally\n\n"
                "Format:\n"
                "- Start with a single # title line\n"
                "- Use ## subheads to structure longer sections\n"
                "- Return ONLY the markdown post (no preamble, no code fences)"
            )
            label = "See You At Sunrise (long)" if long_form else "See You At Sunrise"
            compose_timeout = 360 if long_form else 300
        else:
            prompt = (
                "Write a Substack newsletter post for Mahoney Digital in Markdown.\n\n"
                f"Topic: {topic}\n\n"
                "Before writing, read these for voice and positioning:\n"
                "- VISION_AND_SCOPE.md (who we serve, Essential tier, no hype)\n"
                "- Outreach/Activity_Log.md (real prospects and situations)\n"
                "- One or two Outreach/*/Follow_Up_Email_Draft.md files for Jeremy's tone\n\n"
                "Voice (Jeremy / Mahoney Digital):\n"
                "- Human, direct, Midwest-practical — not agency-speak or AI fluff\n"
                "- Short paragraphs; concrete examples (trades, lawn, HVAC, dead sites)\n"
                "- Honest pricing when relevant: Essential ~$1,650–$1,750 all-in\n"
                "- Serve overlooked small businesses; no bloat, no pressure\n"
                "- One clear CTA (reply, visit mahoneydigital.net, or book a call)\n\n"
                "Format:\n"
                "- Start with a single # title line\n"
                "- Optional ## subheads\n"
                "- Return ONLY the markdown post (no preamble, no code fences)"
            )
            label = "Mahoney Digital"
            compose_timeout = 240
        markdown = call_agent("coordinator", prompt, timeout=compose_timeout)
        title = parse_title_from_markdown(markdown, fallback=topic)
        save_pending(title, markdown, brand=brand)
        return (
            f"Composed ({label}): *{title}*\n\n"
            f"{preview_pending()}"
        )

    if lower == "/substack preview":
        return preview_pending()

    if lower == "/substack draft":
        if not is_configured():
            return (
                "Substack not configured. Add SUBSTACK_PUBLICATION_URL and "
                "SUBSTACK_EMAIL/PASSWORD (or cookies) to .env, then /substack test"
            )
        pending = load_pending()
        if not pending:
            return "No pending post. Use /substack compose <topic> first."
        try:
            return push_draft(
                pending.get("title", "Untitled"),
                pending.get("markdown", ""),
                pending.get("subtitle", ""),
            )
        except Exception as e:
            return f"Substack draft failed: {e}"

    if lower == "/substack publish":
        return (
            "Publishing emails your Substack list.\n"
            "To confirm, send exactly: /substack publish yes"
        )

    if lower == "/substack publish yes":
        if not is_configured():
            return (
                "Substack not configured. Add SUBSTACK_PUBLICATION_URL and "
                "SUBSTACK_EMAIL/PASSWORD (or cookies) to .env, then /substack test"
            )
        try:
            return publish_pending(send_email=True)
        except Exception as e:
            return f"Substack publish failed: {e}"

    return (
        "Unknown Substack command. Try /substack for help."
    )


def is_slow_command(text: str) -> bool:
    lower = text.lower().strip()
    if lower in SLOW_COMMANDS:
        return True
    if lower.startswith("/substack compose"):
        return True
    return lower.startswith("/build ")


def handle_command(text: str, chat_id: str) -> Optional[str]:
    cmd = text.lower().strip()

    if cmd in ("/start", "/help"):
        return (
            "*Mahoney Digital — OpenClaw*\n\n"
            "You talk to *Coordinator* only. Coordinator delegates to the team.\n\n"
            "*Commands:*\n"
            "/status — Pipeline from Activity Log\n"
            "/calls — Pending calls & follow-ups\n"
            "/run leads — Coordinator *delegates* to LeadGenerator (test this)\n"
            "/leads — LeadGenerator direct (shortcut, skips Coordinator)\n"
            "/sales — Sales follow-up queue\n"
            "/build <brief> — WebsiteBuilder (Essential/Growth site)\n"
            "/substack — Compose and publish to Substack\n"
            "/help — This message\n\n"
            "Or ask Coordinator: \"Run LeadGenerator as a test...\""
        )

    if cmd in ("/substack", "/substacktest", "/substack-test", "/substackhelp") or cmd.startswith(
        ("/substack ", "/substackcompose")
    ):
        return handle_substack_command(text)

    if cmd == "/status":
        return call_agent(
            "coordinator",
            "Read Outreach/Activity_Log.md and START_HERE.md. "
            "Give a concise status: pending calls, follow-ups, what's done, one next action. "
            "Note: Saturday — defer cold calls to weekday business hours unless owner overrides.",
            timeout=COORDINATOR_TIMEOUT,
        )

    if cmd == "/calls":
        return call_agent(
            "coordinator",
            "Read Outreach/Activity_Log.md, Calls_Tomorrow_Morning.md, and the follow-up queue. "
            "List pending calls with phone numbers and suggested order for *Monday AM*. "
            "Include email follow-ups that need phone first. Be brief.",
            timeout=COORDINATOR_TIMEOUT,
        )

    if cmd == "/run leads":
        return call_agent(
            "coordinator",
            "Owner requested a TEST via Telegram: delegate to LeadGenerator.\n\n"
            "1. Run LeadGenerator with a small task: find 3 Lane A trades prospects in "
            "Ross County NOT already in Outreach/ folders. Save to Outreach/Leads/ with "
            "today's date in the filename.\n"
            "2. Use shell: grok --agent leadgenerator -p \"...\" --always-approve\n"
            "3. Reply with a brief summary table for Telegram (business, issue, phone if known).",
            timeout=300,
        )

    if cmd == "/leads":
        return call_agent(
            "leadgenerator",
            "Summarize Outreach/Leads/ if any files exist; else scan Outreach/ quick status "
            "and name top 5 Lane A prospects not yet contacted. Brief table format.",
            timeout=240,
        )

    if cmd == "/sales":
        return call_agent(
            "sales",
            "Read Outreach/Activity_Log.md follow-up queue. For each, say business, last touch, "
            "and whether a follow-up email draft exists in their folder. List what's ready vs missing.",
            timeout=COORDINATOR_TIMEOUT,
        )

    if cmd == "/build" or cmd.startswith("/build "):
        brief = text.strip()[len("/build") :].strip()
        if not brief:
            return (
                "*WebsiteBuilder*\n\n"
                "Usage: /build Essential site for [business] — [trade], [town], phone [number]\n\n"
                "Example:\n"
                "/build Essential demo for Warner Lawn Care — lawn, Chillicothe, 740-637-1224\n\n"
                "Runs on your PC (up to ~15 min). Keep the bot window open.\n"
                "Reference demos: site/examples/riverside-lawn/, summit-comfort-hvac/"
            )
        return call_agent(
            "websitebuilder",
            "Owner requested a build via Telegram:\n\n"
            f"{brief}\n\n"
            "Read docs/Essential/Essential_Website_Build_Checklist.md and match the "
            "appropriate demo under site/examples/. Mobile-first Tailwind + Netlify forms. "
            "Summarize what you built and where files live when done.",
            timeout=WEBSITE_BUILDER_TIMEOUT,
        )

    return None


SLOW_COMMANDS = {"/status", "/calls", "/run leads", "/leads", "/sales"}


def process_update(update: dict):
    message = update.get("message") or update.get("edited_message")
    if not message:
        return

    chat_id = str(message.get("chat", {}).get("id"))
    user_id = str(message.get("from", {}).get("id", ""))
    text = (message.get("text") or "").strip()

    if user_id != ALLOWED_USER_ID:
        print(f"Ignoring message from unknown user {user_id}")
        return

    if not text:
        return

    print(f"[{chat_id}] User: {text[:80]}...")

    if is_slow_command(text):
        lower = text.lower().strip()
        if lower.startswith("/build "):
            ack = "_WebsiteBuilder started — can take up to ~15 minutes. Keep the bot window open on your PC._"
        else:
            ack = "_On it — often 3–7 minutes for big tasks (Sales drafts, leads). Grok is working on your PC._"
        send_message(chat_id, ack)

    reply = handle_command(text, chat_id)
    if reply:
        send_message(chat_id, reply)
        return

    send_message(chat_id, "_Thinking..._")
    response = call_agent(
        "coordinator",
        f"Message from owner via Telegram:\n\n{text}",
        timeout=COORDINATOR_TIMEOUT,
    )
    send_message(chat_id, response)


def acquire_lock() -> bool:
    """Ensure only one bot instance polls on this machine."""
    if LOCK_FILE.exists():
        try:
            old_pid = int(LOCK_FILE.read_text().strip())
            # Signal 0 = check if process exists (Windows/Linux)
            os.kill(old_pid, 0)
            print(f"FATAL: Another bot is already running (PID {old_pid}).")
            print("Stop it with Ctrl+C in that terminal, or Task Manager -> End Python.")
            return False
        except (ProcessLookupError, OSError, ValueError):
            LOCK_FILE.unlink(missing_ok=True)
    LOCK_FILE.write_text(str(os.getpid()))
    return True


def release_lock():
    try:
        if LOCK_FILE.exists() and LOCK_FILE.read_text().strip() == str(os.getpid()):
            LOCK_FILE.unlink()
    except Exception:
        pass


def clear_webhook():
    """Polling and an active webhook conflict (Telegram error 409)."""
    try:
        resp = requests.get(
            f"{BASE_URL}/deleteWebhook",
            params={"drop_pending_updates": True},
            timeout=15,
        )
        data = resp.json()
        if data.get("ok"):
            print("Webhook cleared (safe for polling).")
        else:
            print(f"deleteWebhook note: {data}")
    except Exception as e:
        print(f"deleteWebhook warning: {e}")


def main():
    print("OpenClaw Telegram Bot — Mahoney Digital")
    print(f"Version: {BOT_VERSION} (long replies split into multiple messages)")
    print(f"Project: {PROJECT_ROOT}")
    print(f"Allowed user: {ALLOWED_USER_ID}")
    if not acquire_lock():
        sys.exit(1)
    clear_webhook()
    print("Polling... Ctrl+C to stop.\n")

    offset = get_offset()

    try:
        run_poll_loop(offset)
    finally:
        release_lock()


def run_poll_loop(offset: int):
    while True:
        try:
            url = f"{BASE_URL}/getUpdates"
            params = {"offset": offset, "timeout": 25, "allowed_updates": ["message"]}
            resp = requests.get(url, params=params, timeout=30)

            if not resp.ok:
                print(f"getUpdates error: {resp.text}")
                if resp.status_code == 409:
                    print("409 conflict: waiting 35s (another poller may be releasing)...")
                    time.sleep(35)
                    clear_webhook()
                else:
                    time.sleep(5)
                continue

            data = resp.json()
            for update in data.get("result", []):
                process_update(update)
                offset = update["update_id"] + 1
                save_offset(offset)

        except KeyboardInterrupt:
            print("\nStopped.")
            break
        except Exception as e:
            print(f"Loop error: {e}")
            time.sleep(5)


if __name__ == "__main__":
    main()