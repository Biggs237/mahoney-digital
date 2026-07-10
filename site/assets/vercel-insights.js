// Vercel Web Analytics + Speed Insights (static HTML)
(function () {
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };

  function load(src) {
    var s = document.createElement('script');
    s.defer = true;
    s.src = src;
    document.head.appendChild(s);
  }

  load('/_vercel/insights/script.js');
  load('/_vercel/speed-insights/script.js');
})();