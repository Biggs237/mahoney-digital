#!/usr/bin/env python3
"""Send a one-off Telegram message (OpenClaw / Mahoney Digital)."""

import os
import sys
import requests
from pathlib import Path


def load_env():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip().strip('"\''))


def send_telegram(text: str, parse_mode: str = "Markdown") -> bool:
    load_env()
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_ALLOWED_USER_ID")

    if not token or not chat_id:
        print("ERROR: TELEGRAM_BOT_TOKEN and TELEGRAM_ALLOWED_USER_ID must be set in .env")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True,
    }

    try:
        r = requests.post(url, json=payload, timeout=15)
        if r.ok:
            return True
        print(f"Telegram error: {r.text}")
        return False
    except Exception as e:
        print(f"Failed to send: {e}")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python tools/send_telegram.py "Your message"')
        sys.exit(1)
    success = send_telegram(" ".join(sys.argv[1:]))
    sys.exit(0 if success else 1)