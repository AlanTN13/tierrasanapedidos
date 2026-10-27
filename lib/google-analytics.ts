export const GOOGLE_ANALYTICS_ID = "G-QKBQWT7D0K";

export const GOOGLE_ANALYTICS_BOOTSTRAP = `
(function () {
  var host = window.location.hostname;
  if (host !== 'www.tierrasanadietetica.com' && host !== 'tierrasanadietetica.com') return;
  if (/^\\/admin(?:\\/|$)/.test(window.location.pathname)) return;
  if (window.__tierraSanaGaInitialized) return;
  window.__tierraSanaGaInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', '${GOOGLE_ANALYTICS_ID}');
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}';
  document.head.appendChild(script);
})();
`;
