/**
 * Mahoney Digital site chat widget.
 * - FAQ + /api/chat (xAI) when configured
 * - Instant Lead Response soft-book: name/phone/time windows → /api/lead
 */
(function () {
  const PHONE = '(740) 530-8790';
  const PHONE_TEL = 'tel:7405308790';

  const FAQ = [
    {
      keys: ['price', 'cost', 'how much', 'pricing', 'package', 'essential', 'growth', 'signature'],
      answer:
        'Website packages (ranges — Jeremy confirms exact quotes in writing):\n\n• Essential: $1,450–$1,950 (most ~$1,650–$1,750)\n• Growth: $2,650–$3,450 (most ~$2,900–$3,200)\n• Signature: $4,850–$6,850\n\nDetails: mahoneydigital.net/websites\n\nWant Jeremy to follow up? Share your name, best phone, and two times that work this week.',
    },
    {
      keys: ['care', 'support', 'monthly', 'maintenance', 'hosting plan'],
      answer:
        'Optional care plans (month-to-month style):\n\n• Essential Care: about $59–$99/mo\n• Growth Partner: about $179–$279/mo\n• Signature Alliance: $399+/mo\n\nMore: mahoneydigital.net/care-plans',
    },
    {
      keys: ['example', 'demo', 'work', 'portfolio', 'sample'],
      answer:
        'See package demos at mahoneydigital.net/work — Riverside Lawn (Essential), Summit Comfort HVAC (Growth), and Heritage Home Partners (Signature).',
    },
    {
      keys: ['contact', 'call', 'phone', 'email', 'reach', 'talk', 'jeremy'],
      answer:
        'Call ' +
        PHONE +
        ' (voice only — no texts on that line), email hello@mahoneydigital.net, or use the form at mahoneydigital.net/contact. You can also soft-book here: name + phone + two time windows and Jeremy will confirm.',
    },
    {
      keys: ['where', 'location', 'chillicothe', 'ohio', 'area', 'ross'],
      answer:
        'Mahoney Digital is based in Chillicothe, Ohio, and serves Ross County, southern Ohio, and similar local service businesses.',
    },
    {
      keys: ['how long', 'timeline', 'weeks', 'fast'],
      answer:
        'Most Essential and Growth builds take about 2–4 weeks. Signature can take longer because of custom design and content depth.',
    },
    {
      keys: ['ai', 'chatbot', 'bot', 'agent', 'profitagent'],
      answer:
        'Websites are the core. Optional practical AI add-ons (lead response, after-hours soft-book) are at mahoneydigital.net/ai-services. This chat answers site questions and can soft-book a call with Jeremy.',
    },
    {
      keys: ['seo', 'google', 'rank'],
      answer:
        'We do solid on-page and local SEO setup (especially with Growth and care plans). We don’t promise “#1 on Google.” Happy to have Jeremy discuss what fits your shop.',
    },
    {
      keys: ['schedule', 'book', 'appointment', 'availability', 'meeting', 'call me'],
      answer:
        'I can soft-book a discovery chat — no calendar lock. Share your name, best phone number, and two time windows (day + morning/afternoon). Jeremy confirms during business hours (Mon–Fri 8–5).',
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

  function isBuyingIntent(text) {
    const q = text.toLowerCase();
    return /price|cost|how much|package|website|site|quote|proposal|start|hire|build|need a site|want a site|interested|schedule|book|call me|talk to jeremy|get started/.test(
      q,
    );
  }

  function localAnswer(text) {
    const q = text.toLowerCase();
    for (const item of FAQ) {
      if (item.keys.some((k) => q.includes(k))) return item.answer;
    }
    return (
      'I can help with packages, pricing ranges, care plans, demos, or soft-booking a call with Jeremy. ' +
      'For a custom quote: share your name, phone, and two times that work — or call ' +
      PHONE +
      ' / mahoneydigital.net/contact.'
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

    // Soft-book state (Instant Lead Response style)
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
          // maybe they pasted a full message — try phone
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
          'Hi — I can help with website packages, pricing ranges, care plans, and demos. I can also soft-book a call with Jeremy.\n\nWhat are you looking for?\n\nDirect line: ' +
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

    ['Pricing', 'Packages', 'Care plans', 'Book a call'].forEach((label) => {
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

      // Soft-book flow takes priority when active
      if (softStep && softStep !== 'done') {
        answer = await handleSoftBook(text);
      } else {
        const phoneInMsg = extractPhone(text);
        const wantsBook =
          /soft-?book|book a call|schedule|call with jeremy|get started|want a (website|site)|hire you|talk to jeremy/i.test(
            text,
          );

        if (phoneInMsg && !lead.phone) {
          lead.phone = phoneInMsg;
          lead.intent = lead.intent || text;
          if (!lead.name) {
            softStep = 'name';
            answer = 'Thanks — I have your number. What’s your name so Jeremy can soft-book a follow-up?';
          } else if (!lead.windows) {
            softStep = 'windows';
            answer = 'Got your number. Two time windows that work this week?';
          }
        } else if (wantsBook || (isBuyingIntent(text) && softStep !== 'done' && !lead.phone)) {
          lead.intent = text;
          answer = startSoftBook(text);
        }
      }

      if (!answer) {
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

        // After a pricing answer, nudge soft-book once
        if (
          softStep !== 'done' &&
          !lead.phone &&
          isBuyingIntent(text) &&
          !/soft-book|phone|time window/i.test(answer)
        ) {
          answer +=
            '\n\nIf you want, I can soft-book Jeremy to call you — just say “book a call” or send your name and phone.';
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
