/**
 * Mahoney Digital site chat widget.
 * Uses /api/chat (xAI) when configured; otherwise local FAQ answers.
 */
(function () {
  const PHONE = '(740) 530-8790';
  const PHONE_TEL = 'tel:7405308790';

  const FAQ = [
    {
      keys: ['price', 'cost', 'how much', 'pricing', 'package', 'essential', 'growth', 'signature'],
      answer:
        'Website packages (ranges — Jeremy confirms exact quotes in writing):\n\n• Essential: $1,450–$1,950 (most ~$1,650–$1,750)\n• Growth: $2,650–$3,450 (most ~$2,900–$3,200)\n• Signature: $4,850–$6,850\n\nDetails: mahoneydigital.net/websites',
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
        'Call or text ' +
        PHONE +
        ', email hello@mahoneydigital.net, or use the form at mahoneydigital.net/contact. Jeremy usually follows up within one business day.',
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
      keys: ['ai', 'chatbot', 'bot'],
      answer:
        'Websites are the core. Optional practical AI add-ons are listed at mahoneydigital.net/ai-services — no heavy “AI agency” hype. This chat is a simple helper for site questions.',
    },
    {
      keys: ['seo', 'google', 'rank'],
      answer:
        'We do solid on-page and local SEO setup (especially with Growth and care plans). We don’t promise “#1 on Google.” Happy to have Jeremy discuss what fits your shop.',
    },
  ];

  function localAnswer(text) {
    const q = text.toLowerCase();
    for (const item of FAQ) {
      if (item.keys.some((k) => q.includes(k))) return item.answer;
    }
    return (
      'I can help with packages, pricing ranges, care plans, demos, or how to reach Jeremy. ' +
      'For a custom quote or project talk, call/text ' +
      PHONE +
      ' or use mahoneydigital.net/contact.'
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
      '<div><h2>Mahoney Digital</h2><p>Quick answers · or call ' +
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

    function addBubble(role, text) {
      const b = el('div', 'md-chat-bubble ' + (role === 'user' ? 'user' : 'bot'));
      b.textContent = text;
      messagesEl.appendChild(b);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function openPanel() {
      panel.hidden = false;
      fab.setAttribute('aria-expanded', 'true');
      if (!welcomed) {
        welcomed = true;
        addBubble(
          'bot',
          'Hi — I can help with website packages, pricing ranges, care plans, and demos. What are you looking for?\n\nFor Jeremy directly: ' +
            PHONE +
            ' or the contact form.'
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

    ['Pricing', 'Packages', 'Care plans', 'Talk to Jeremy'].forEach((label) => {
      const chip = el('button', 'md-chat-chip');
      chip.type = 'button';
      chip.textContent = label;
      chip.addEventListener('click', () => {
        input.value =
          label === 'Talk to Jeremy'
            ? 'How do I contact Jeremy?'
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

      let answer = localAnswer(text);

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
        if (res.ok && data.reply) {
          answer = data.reply;
        } else if (data.message && res.status !== 503) {
          answer = data.message;
        }
        // 503 not_configured → keep localAnswer
      } catch {
        // offline / no API → localAnswer already set
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
