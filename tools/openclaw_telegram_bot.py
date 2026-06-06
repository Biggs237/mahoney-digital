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


def get_offset() -> int:
    if OFFSET_FILE.exists():
        try:
            return int(OFFSET_FILE.read_text().strip())
        except Exception:
            pass
    return 0


def save_offset(offset: int):
    OFFSET_FILE.write_text(str(offset))


def send_message(chat_id: str, text: str, parse_mode: Optional[str] = "Markdown"):
    url = f"{BASE_URL}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text[:4096],
        "parse_mode": parse_mode,
        "disable_web_page_preview": True,
    }
    try:
        requests.post(url, json=payload, timeout=10)
    except Exception as e:
        print(f"Send error: {e}")


def call_agent(agent: str, prompt: str, timeout: int = 180) -> str:
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
        if len(output) > 3500:
            output = output[:3400] + "\n\n... (truncated)"
        return output or f"({agent} had no output)"
    except subprocess.TimeoutExpired:
        return f"{agent} timed out. Try again or use desktop Grok."
    except Exception as e:
        return f"Error calling {agent}: {e}"


def handle_command(text: str, chat_id: str) -> Optional[str]:
    cmd = text.lower().strip()

    if cmd in ("/start", "/help"):
        return (
            "*Mahoney Digital — OpenClaw*\n\n"
            "You talk to *Coordinator* only. Coordinator delegates to the team.\n\n"
            "*Commands:*\n"
            "/status — Pipeline from Activity_Log\n"
            "/calls — Pending calls & follow-ups\n"
            "/leads — LeadGenerator summary\n"
            "/sales — Sales follow-up queue\n"
            "/help — This message\n\n"
            "Or type normally — e.g. \"draft follow-up for Payless Plumbing\"."
        )

    if cmd == "/status":
        return call_agent(
            "coordinator",
            "Read Outreach/Activity_Log.md and START_HERE.md. "
            "Give a concise status: pending calls, follow-ups, what's done, one next action. "
            "Note: Saturday — defer cold calls to weekday business hours unless owner overrides.",
        )

    if cmd == "/calls":
        return call_agent(
            "coordinator",
            "Read Outreach/Activity_Log.md, Calls_Tomorrow_Morning.md, and the follow-up queue. "
            "List pending calls with phone numbers and suggested order for *Monday AM*. "
            "Include email follow-ups that need phone first. Be brief.",
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
            timeout=240,
        )

    return None


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

    reply = handle_command(text, chat_id)
    if reply:
        send_message(chat_id, reply)
        return

    send_message(chat_id, "_Thinking..._")
    response = call_agent(
        "coordinator",
        f"Message from owner via Telegram:\n\n{text}",
    )
    send_message(chat_id, response)


def main():
    print("OpenClaw Telegram Bot — Mahoney Digital")
    print(f"Project: {PROJECT_ROOT}")
    print(f"Allowed user: {ALLOWED_USER_ID}")
    print("Polling... Ctrl+C to stop.\n")

    offset = get_offset()

    while True:
        try:
            url = f"{BASE_URL}/getUpdates"
            params = {"offset": offset, "timeout": 25, "allowed_updates": ["message"]}
            resp = requests.get(url, params=params, timeout=30)

            if not resp.ok:
                print(f"getUpdates error: {resp.text}")
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