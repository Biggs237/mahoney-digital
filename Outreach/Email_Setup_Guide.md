# Mahoney Digital - hello@mahoneydigital.net Email Setup Guide

**SUCCESS:** Email signature (HTML version) successfully set up in Porkbun Webmail on [current]. User confirmed: "It works now. Looks great."

**Email Address:** hello@mahoneydigital.net  
**Hosting:** Porkbun Hosted Email  
**Primary Access:** Porkbun Webmail (recommended) + Gmail client where possible

## Important Note on Gmail Integration (as of 2026)

Google has deprecated support for "Check mail from other accounts" (POP3 import) in the web version of Gmail as of January 1, 2026. 

This means the full "forwarding + send as" experience in desktop Gmail web may not work reliably anymore.

**Recommended approach:**
- Use Porkbun's webmail at https://webmail.porkbun.com as your main inbox for composing and reading.
- Use the Gmail app on mobile (iOS/Android) for checking mail if desired – mobile apps still support external accounts better in some cases.
- For desktop, consider Thunderbird (free) or Outlook as alternative clients.

## Porkbun Webmail (Recommended Primary)

1. Log in at [https://webmail.porkbun.com](https://webmail.porkbun.com) using your full email address and password.
2. To set up signature:
   - Click the Settings gear icon on the left.
   - Go to "Identities".
   - Select hello@mahoneydigital.net.
   - Scroll to "Signature" section.
   - Paste your signature (plain text or switch to HTML mode for formatting/links).
   - Save.

**Signature to use (copy from Email_Signature_Final.txt):**

Use the FULL HTML version from section 3 of Email_Signature_Final.txt (the one with <div style=...>).

**SUCCESS: Implemented in Porkbun Webmail (HTML mode) - user confirmed it works and looks great.**

**Exact steps in Porkbun Webmail (this is where you are):**
1. Log in at https://webmail.porkbun.com.
2. Settings gear (left sidebar) → Identities.
3. Select hello@mahoneydigital.net.
4. Scroll to Signature.
5. Click the HTML icon (<>) above the box to enable HTML mode.
6. Paste the full <div> HTML block.
7. Save.

It should render with bold name, styled links, no raw code. See the "What it should look like" description and troubleshooting in Email_Signature_Final.txt.

## Setting Up in Gmail (Limited / Mobile Focused)

### For "Send Mail As" (to send from hello@ when composing in Gmail)

1. In Gmail (web or app), go to Settings > See all settings > Accounts and Import.
2. Under "Send mail as", click "Add another email address".
3. Enter:
   - Name: Jeremy Mahoney
   - Email address: hello@mahoneydigital.net
   - Treat as alias: (check if prompted)
4. Next, enter SMTP settings:
   - SMTP Server: smtp.porkbun.com
   - Port: 587
   - Username: hello@mahoneydigital.net (full address)
   - Password: Your Porkbun email password
   - Secure connection: Use TLS (recommended)
5. Gmail will send a verification code to hello@ – check in Porkbun webmail or wherever you receive it, and confirm.
6. In "Send mail as", set "When replying to a message" to "Reply from the same address the message was sent to".

### For Receiving in Gmail (POP3 - May be limited on web)

1. Settings > See all settings > Accounts and Import > "Check mail from other accounts" > "Add a mail account".
2. Enter hello@mahoneydigital.net.
3. Choose "Import emails from my other account (POP3)".
4. Settings:
   - Username: hello@mahoneydigital.net
   - Password: Your password
   - POP Server: pop.porkbun.com
   - Port: 995
   - Security: Always use a secure connection (SSL)
   - Check: "Leave a copy of retrieved message on the server"
   - Label incoming messages (optional, e.g., "Porkbun")
5. Add account.

**Note:** This feature may not work well on desktop Gmail web anymore. Test and fall back to webmail if issues.

## Full IMAP Setup in Other Clients (Recommended for Desktop if not using Webmail)

Use these settings in Thunderbird, Outlook, Apple Mail, etc.:

**IMAP (Incoming):**
- Server: imap.porkbun.com
- Port: 993
- Security: SSL/TLS
- Username: hello@mahoneydigital.net
- Password: Your password

**SMTP (Outgoing):**
- Server: smtp.porkbun.com
- Port: 587
- Security: STARTTLS
- Username: hello@mahoneydigital.net
- Password: Your password

Alternative SMTP: Port 465, Implicit TLS.

## Password Management
- If you forget the password, reset it in your Porkbun account dashboard under Email Hosting.

## Signature
Use the exact block from `Email_Signature_Final.txt`.

**Critical for Gmail:** Never paste the FULL HTML <div> version directly into Gmail's signature editor — it will show as raw code/tags. 

Instead:
- Paste the plain text block from section 1 or 2 of the Final file.
- Use Gmail's toolbar to bold the name and turn the contact lines into links (chain icon).
- Expected result: Clean text with bold name, clickable email/phone/websites, no HTML visible.

For Porkbun Webmail: You can paste the full HTML version after clicking the HTML icon in the signature field — it supports it properly.

See the full details and "what it should look like" in Email_Signature_Final.txt.

## Troubleshooting
- Connection refused / wrong port: Use 993 for IMAP, 587 for SMTP (STARTTLS). Never use 143 or 25.
- Authentication failed: Double-check full email as username and correct password. Reset if needed.
- "Send mail as" not working: Ensure "Treat as alias" is handled correctly, and verify the confirmation link.
- Emails not arriving: Check spam, or Porkbun webmail directly.

## Current Recommendation for You
Since Gmail web integration is flaky now, primarily use **Porkbun Webmail** for hello@. Set your signature there. Use Gmail app on phone for convenience if it pulls mail.

If you want a unified desktop experience, install Mozilla Thunderbird and set it up with the IMAP settings above.

Let me know what client you're using or what specific error you're seeing, and I can give more targeted steps or update this guide.

Last updated: June 2026
