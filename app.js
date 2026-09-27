// Point d'entrée analytics unique, appelé par tout le site. Journalise
// toujours en local ; transmet aussi à GA4 (analytics.js) une fois — et
// seulement une fois — le consentement donné. Ne jamais passer de donnée
// personnelle (email, nom, poids, performance...) dans params.
function trackEvent(name, params) {
  console.debug('[track]', name, params || {});
  if (window.BLACKTOM_ANALYTICS_CONSENTED && typeof gtag === 'function') {
    gtag('event', name, params || {});
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    var closeMenu = function () {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      trackEvent(el.getAttribute('data-track'));
    });
  });
});
