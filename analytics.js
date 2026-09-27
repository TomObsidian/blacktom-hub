// GA4 — chargement conditionné au consentement (RGPD).
// Rien n'est envoyé à Google tant que l'utilisateur n'a pas explicitement
// accepté : le script gtag.js lui-même n'est chargé qu'après acceptation,
// jamais avant, jamais par défaut. Le choix (accepté/refusé) est mémorisé
// en localStorage et peut être changé à tout moment depuis /confidentialite.
(function () {
  var GA_ID = 'G-J8Y7M8DNG1';
  var CONSENT_KEY = 'blacktom_consent';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  });

  function getConsent() {
    try { return window.localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { window.localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  var loaded = false;
  function loadGA() {
    if (loaded) return;
    loaded = true;
    gtag('consent', 'update', { 'analytics_storage': 'granted' });
    gtag('js', new Date());
    gtag('config', GA_ID);
    window.BLACKTOM_ANALYTICS_CONSENTED = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function removeBanner() {
    var el = document.getElementById('cookie-banner');
    if (el) el.remove();
  }

  function renderBanner() {
    if (document.getElementById('cookie-banner')) return;
    var el = document.createElement('div');
    el.id = 'cookie-banner';
    el.className = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Gestion des cookies');
    el.innerHTML =
      '<p>BLACKTOM utilise des cookies de mesure d’audience (Google Analytics) pour comprendre ce qui vous intéresse. Rien n’est envoyé sans votre accord. <a href="/confidentialite">En savoir plus</a></p>' +
      '<div class="cookie-banner-actions">' +
        '<button type="button" class="btn btn-ghost" data-consent="refuse">Refuser</button>' +
        '<button type="button" class="btn btn-primary" data-consent="accept">Accepter</button>' +
      '</div>';
    document.body.appendChild(el);
    el.querySelector('[data-consent="accept"]').addEventListener('click', function () {
      setConsent('granted');
      loadGA();
      removeBanner();
    });
    el.querySelector('[data-consent="refuse"]').addEventListener('click', function () {
      setConsent('denied');
      removeBanner();
    });
  }

  // Point d'entrée pour rouvrir le choix depuis /confidentialite.
  window.blacktomOpenCookieBanner = function () {
    removeBanner();
    renderBanner();
  };

  document.addEventListener('DOMContentLoaded', function () {
    var consent = getConsent();
    if (consent === 'granted') {
      loadGA();
    } else if (consent !== 'denied') {
      renderBanner();
    }
  });
})();
