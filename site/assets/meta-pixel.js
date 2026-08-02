/**
 * Meta (Facebook) Pixel — base PageView + optional Lead.
 *
 * Pixel ID from (first match wins):
 *   1. window.META_PIXEL_ID (manual override)
 *   2. GET /api/meta-config  → Vercel env NEXT_PUBLIC_META_PIXEL_ID | META_PIXEL_ID
 *   3. Built-in fallback (Mahoney Digital pixel)
 *
 * Lead fires only on successful contact form completion (thank-you page after FormSubmit).
 * Does NOT fire Lead on /contact page load.
 */
(function () {
  "use strict";

  var FALLBACK_PIXEL_ID = "914276838392424";
  var LEAD_PATH = /\/thank-you(\.html)?\/?$/i;

  function initFbq() {
    if (window.fbq) return;
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  }

  function trackPageView() {
    window.fbq("track", "PageView");
  }

  function trackLeadOnce() {
    try {
      if (sessionStorage.getItem("md_meta_lead_fired") === "1") return;
      sessionStorage.setItem("md_meta_lead_fired", "1");
    } catch (_) {
      /* private mode — still fire once per page load */
    }
    window.fbq("track", "Lead");
  }

  function boot(pixelId) {
    if (!pixelId || !/^\d{5,20}$/.test(String(pixelId))) {
      if (typeof console !== "undefined" && console.debug) {
        console.debug("[meta-pixel] No valid pixel ID — tracking skipped.");
      }
      return;
    }

    initFbq();
    window.fbq("init", String(pixelId));
    trackPageView();

    if (LEAD_PATH.test(window.location.pathname)) {
      trackLeadOnce();
    }

    // Public helper if you ever need a client-side success callback elsewhere
    window.mdMetaTrackLead = function () {
      if (!window.fbq) return;
      trackLeadOnce();
    };
  }

  function resolveId() {
    if (window.META_PIXEL_ID) {
      return Promise.resolve(String(window.META_PIXEL_ID).trim());
    }
    return fetch("/api/meta-config", { credentials: "same-origin" })
      .then(function (r) {
        return r.ok ? r.json() : { pixelId: FALLBACK_PIXEL_ID };
      })
      .then(function (data) {
        return (data && data.pixelId) || FALLBACK_PIXEL_ID;
      })
      .catch(function () {
        return FALLBACK_PIXEL_ID;
      });
  }

  resolveId().then(boot);
})();

