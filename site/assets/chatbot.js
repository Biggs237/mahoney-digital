/**
 * Mahoney Digital site chat widget.
 * - Local FAQ first (works without XAI_API_KEY)
 * - Optional /api/chat (xAI) when configured
 * - Soft-book only on explicit book intent → /api/lead + ntfy
 */
(function () {
  const PHONE = '(740) 208-2576';

  const FAQ = [
    {
      keys: [
        'price',
        'cost',
        'how much',
        'pricing',
        'package',
        'essential',
        'growth',
        'signature',
        'quote',
      ],
      answer:
        'Website packages (ranges — Jeremy confirms exact quotes in writing):\n\n• Essential: $1,450–$1,950 (most ~$1,650–$1,750)\n• Growth: $2,650–$3,450 (most ~$2,900–$3,200)\n• Signature: $4,850–$6,850\n\nDetails: mahoneydigital.net/websites\n\nWant a callback? Tap “Book a call” or say book a call.',
    },
    {
      keys: ['website', 'web site', 'site build', 'build a site', 'new site', 'redesign', 'what do you', 'services', 'offer', 'help with', 'what can you'],
      answer:
        'Mahoney Digital builds practical websites for local service businesses (plus tune-ups, care plans, and optional AI helpers).\n\n• Site Builds — Essential / Growth / Signature packages\n• Site Tune-Ups — improve an existing site\n• Care Plans — monthly updates & support\n• AI Helpers — lead response & soft-book (optional)\n\nBrowse: mahoneydigital.net/websites · mahoneydigital.net/ai-services',
    },
    {
      keys: ['tune', 'tune-up', 'fix', 'slow', 'mobile'],
      answer:
        'Site Tune-Ups are for businesses that already have a site but need it clearer, faster, or more mobile-friendly. See mahoneydigital.net/tune-ups or book a short call with Jeremy.',
    },
    {
      keys: ['care', 'support', 'monthly', 'maintenance', 'hosting plan'],
      answer:
        'Optional care plans (month-to-month style):\n\n• Essential Care: about $59–$99/mo\n• Growth Partner: about $179–$279/mo\n• Signature Alliance: $399+/mo\n\nMore: mahoneydigital.net/care-plans',
    },
    {
      keys: ['example', 'demo', 'work', 'portfolio', 'sample', 'riverside', 'summit', 'heritage'],
      answer:
        'Package demos: mahoneydigital.net/work\n\n• Riverside Lawn — Essential\n• Summit Comfort HVAC — Growth\n• Heritage Home Partners — Signature',
    },
    {
      keys: ['hours', 'open', 'when are you', 'business hours'],
      answer:
        'Jeremy is typically available Mon–Fri 8am–5pm (Chillicothe / eastern time). This chat can soft-book a call anytime — he confirms during business hours.',
    },
    {
      keys: ['contact', 'email', 'reach', 'phone number', 'call you'],
      answer:
        'Call ' +
        PHONE +
        ' (voice only — no texts on that line), email hello@mahoneydigital.net, or use mahoneydigital.net/contact.\n\nOr soft-book here: say “book a call.”',
    },
    {
      keys: ['where', 'location', 'chillicothe', 'ohio', 'area', 'ross', 'serve'],
      answer:
        'Mahoney Digital is based in Chillicothe, Ohio, and serves Ross County, southern Ohio, and similar local service businesses (remote-friendly for many projects).',
    },
    {
      keys: ['how long', 'timeline', 'weeks', 'fast', 'how soon'],
      answer:
        'Most Essential and Growth builds take about 2–4 weeks. Signature can take longer because of custom design and content depth.',
    },
    {
      keys: ['ai', 'chatbot', 'bot', 'agent', 'profitagent', 'after hours', 'lead response'],
      answer:
        'Websites are the core. Optional practical AI add-ons (instant lead response, after-hours soft-book) are at mahoneydigital.net/ai-services.\n\nThis chat answers questions and can soft-book a call with Jeremy — it does not hard-lock a calendar.',
    },
    {
      keys: ['seo', 'google', 'rank', 'search'],
      answer:
        'We do solid on-page and local SEO setup (especially with Growth and care plans). We don’t promise “#1 on Google.” Jeremy can discuss what fits your shop on a short call.',
    },
    {
      keys: ['facebook', 'ads', 'marketing', 'traffic'],
      answer:
        'We focus on the website and conversion (clear contact, mobile, optional lead chat). Ads and Facebook boosts can send traffic — the site’s job is to turn visits into calls and soft-books. Happy to talk fit on a call.',
    },
    {
      keys: ['veteran', 'military'],
      answer:
        'Mahoney Digital is veteran-owned, based in Chillicothe. Glad to help local shops with straightforward web work.',
    },
  ];

  function extractPhone(text) {
    const m = text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    return m ? m[0] : '';
  }

  function looksLikeName(text) {
    const t = text.trim();
    if (t.length < 2 || t.length > 60) return false;
    if (extractPhone(t)) return false;
    if (/\d{3}/.test(t)) return false;
    if (/\b(yes|no|ok|thanks|thank|hi|hello|hey)\b/i.test(t) && t.split(/\s+/).length < 2)
      return false;
    return /^[a-zA-Z][a-zA-Z\s.'-]{1,58}$/.test(t);
  }

  /** Soft nudge only — does NOT start soft-book by itself */
  function isBuyingIntent(text) {
    const q = text.toLowerCase();
    return /price|cost|how much|package|website|site|quote|proposal|interested|hire|build|need a site|want a site|get a site/.test(
      q,
    );
  }

  /** Only these start the name/phone/windows flow */
  function wantsSoftBook(text) {
    return /soft-?book|book a call|schedule a call|call with jeremy|talk to jeremy|hire you|get started|book jeremy|i want to book|set up a call|request a call|callback|call me back/i.test(
      text,
    );
  }

  function localAnswer(text) {
    const q = text.toLowerCase();
    // Prefer longer key matches first (already ordered roughly)
    let best = null;
    let bestLen = 0;
    for (const item of FAQ) {
      for (const k of item.keys) {
        if (q.includes(k) && k.length >= bestLen) {
          best = item.answer;
          bestLen = k.length;
        }
      }
    }
    if (best) return best;
    return (
      'I can help with:\n• Website packages & pricing ranges\n• Care plans & tune-ups\n• Demos / examples\n• Soft-booking a call with Jeremy\n\nTry a chip below, or ask a specific question. Direct line: ' +
      PHONE +
      ' (voice) · mahoneydigital.net/contact'
    );
  }

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function init() {
    if (document.getElementById('md-chat-root')) return;

    const root = el('div', 'md-chat-root');
    root.id = 'md-chat-root';

    const fab = el('button', 'md-chat-fab', '<i class="fas fa-comment-dots" aria-hidden="true"></i>');
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Open chat');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'md-chat-panel');

    const panel = el('div', 'md-chat-panel');
    panel.id = 'md-chat-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Mahoney Digital chat');

    panel.innerHTML =
      '<div class="md-chat-header">' +
      '<div><h2>Mahoney Digital</h2><p>Quick answers · soft-book a call · ' +
      PHONE +
      '</p></div>' +
      '<button type="button" class="md-chat-close" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="md-chat-messages" id="md-chat-messages"></div>' +
      '<div class="md-chat-chips" id="md-chat-chips"></div>' +
      '<form class="md-chat-form" id="md-chat-form">' +
      '<input type="text" id="md-chat-input" placeholder="Ask about websites, pricing…" autocomplete="off" maxlength="2000" />' +
      '<button type="submit" id="md-chat-send">Send</button>' +
      '</form>';

    root.appendChild(panel);
    root.appendChild(fab);
    document.body.appendChild(root);

    const messagesEl = panel.querySelector('#md-chat-messages');
    const form = panel.querySelector('#md-chat-form');
    const input = panel.querySelector('#md-chat-input');
    const sendBtn = panel.querySelector('#md-chat-send');
    const chipsEl = panel.querySelector('#md-chat-chips');
    const closeBtn = panel.querySelector('.md-chat-close');

    const history = [];
    let busy = false;
    let welcomed = false;

    const lead = { name: '', phone: '', windows: '', intent: '' };
    let softStep = null; // null | 'name' | 'phone' | 'windows' | 'done'

    function addBubble(role, text) {
      const b = el('div', 'md-chat-bubble ' + (role === 'user' ? 'user' : 'bot'));
      b.textContent = text;
      messagesEl.appendChild(b);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function submitLead() {
      try {
        await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: lead.name,
            phone: lead.phone,
            windows: lead.windows,
            intent: lead.intent,
            page: location.pathname,
          }),
        });
      } catch {
        /* still confirm to user */
      }
      try {
        const prev = JSON.parse(localStorage.getItem('md-softbook-leads') || '[]');
        prev.unshift({
          ...lead,
          at: new Date().toISOString(),
          page: location.pathname,
        });
        localStorage.setItem('md-softbook-leads', JSON.stringify(prev.slice(0, 20)));
      } catch {
        /* ignore */
      }
    }

    function startSoftBook(seedIntent) {
      if (seedIntent) lead.intent = seedIntent;
      if (!lead.name) {
        softStep = 'name';
        return 'Happy to soft-book a short call with Jeremy (no hard calendar lock). What’s your name?';
      }
      if (!lead.phone) {
        softStep = 'phone';
        return 'Thanks' + (lead.name ? ', ' + lead.name : '') + '. What’s the best phone number to reach you?';
      }
      if (!lead.windows) {
        softStep = 'windows';
        return 'Got it. Two time windows that work this week? (e.g. “Tue afternoon or Wed morning”)';
      }
      return null;
    }

    async function handleSoftBook(text) {
      if (softStep === 'name') {
        if (!looksLikeName(text) && text.trim().split(/\s+/).length > 4) {
          const p = extractPhone(text);
          if (p) {
            lead.phone = p;
            softStep = lead.windows ? null : 'windows';
            if (!lead.windows) {
              return 'Thanks. Two time windows that work this week? (day + morning/afternoon)';
            }
          }
        }
        lead.name = text.trim().slice(0, 80);
        softStep = 'phone';
        return 'Thanks, ' + lead.name + '. Best phone number?';
      }
      if (softStep === 'phone') {
        const p = extractPhone(text);
        if (!p) {
          return 'I need a 10-digit phone number so Jeremy can confirm. What’s the best number?';
        }
        lead.phone = p;
        softStep = 'windows';
        return 'Perfect. Two preferred time windows this week? (e.g. “Mon morning or Thu after 2”)';
      }
      if (softStep === 'windows') {
        lead.windows = text.trim().slice(0, 200);
        softStep = 'done';
        await submitLead();
        return (
          'Soft-booked. I’ve logged:\n• ' +
          (lead.name || '—') +
          '\n• ' +
          lead.phone +
          '\n• ' +
          lead.windows +
          '\n\nJeremy will confirm during business hours (Mon–Fri 8–5). You can also call ' +
          PHONE +
          ' anytime (voice only).'
        );
      }
      return null;
    }

    function openPanel() {
      panel.hidden = false;
      fab.setAttribute('aria-expanded', 'true');
      if (!welcomed) {
        welcomed = true;
        addBubble(
          'bot',
          'Hi — ask me about packages, pricing, care plans, or demos. When you’re ready, tap “Book a call” to soft-book time with Jeremy.\n\nDirect line: ' +
            PHONE +
            ' (voice) · mahoneydigital.net/contact',
        );
      }
      setTimeout(() => input.focus(), 50);
    }

    function closePanel() {
      panel.hidden = true;
      fab.setAttribute('aria-expanded', 'false');
    }

    fab.addEventListener('click', () => {
      if (panel.hidden) openPanel();
      else closePanel();
    });
    closeBtn.addEventListener('click', closePanel);

    ['Pricing', 'Packages', 'Care plans', 'Demos', 'Book a call'].forEach((label) => {
      const chip = el('button', 'md-chat-chip');
      chip.type = 'button';
      chip.textContent = label;
      chip.addEventListener('click', () => {
        input.value =
          label === 'Book a call'
            ? 'I want to soft-book a call with Jeremy'
            : label === 'Care plans'
              ? 'Tell me about care plans'
              : label === 'Packages'
                ? 'What website packages do you offer?'
                : label === 'Demos'
                  ? 'Show me demo examples'
                  : 'How much does a website cost?';
        form.requestSubmit();
      });
      chipsEl.appendChild(chip);
    });

    async function replyTo(text) {
      addBubble('user', text);
      history.push({ role: 'user', content: text });
      busy = true;
      sendBtn.disabled = true;
      const typing = el('div', 'md-chat-typing');
      typing.textContent = 'Thinking…';
      messagesEl.appendChild(typing);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      let answer = null;

      // Soft-book flow only when already in progress OR explicit book intent
      if (softStep && softStep !== 'done') {
        answer = await handleSoftBook(text);
      } else {
        const phoneInMsg = extractPhone(text);
        const bookNow = wantsSoftBook(text);

        if (phoneInMsg && !lead.phone && bookNow) {
          lead.phone = phoneInMsg;
          lead.intent = lead.intent || text;
          if (!lead.name) {
            softStep = 'name';
            answer = 'Thanks — I have your number. What’s your name so Jeremy can soft-book a follow-up?';
          } else if (!lead.windows) {
            softStep = 'windows';
            answer = 'Got your number. Two time windows that work this week?';
          }
        } else if (bookNow) {
          lead.intent = text;
          answer = startSoftBook(text);
        }
      }

      if (!answer) {
        // Always answer from local FAQ first (AI is optional)
        answer = localAnswer(text);
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              history: history.slice(0, -1),
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.reply && String(data.reply).trim()) {
            answer = String(data.reply).trim();
          }
        } catch {
          /* keep localAnswer */
        }

        // Light nudge after buying questions — do not force phone collection
        if (
          softStep !== 'done' &&
          !lead.phone &&
          isBuyingIntent(text) &&
          !/book a call|soft-book|phone number/i.test(answer)
        ) {
          answer +=
            '\n\nWant Jeremy to call you? Tap “Book a call” or say book a call.';
        }
      }

      typing.remove();
      addBubble('bot', answer);
      history.push({ role: 'assistant', content: answer });
      if (history.length > 16) history.splice(0, history.length - 16);
      busy = false;
      sendBtn.disabled = false;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (busy) return;
      const text = (input.value || '').trim();
      if (!text) return;
      input.value = '';
      replyTo(text);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
