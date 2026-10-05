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
      toggle.setAttribute('aria-label', 'Menu');
    };
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Menu');
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
    // Le sommaire plein écran garde le focus clavier à l'intérieur tant qu'il est ouvert.
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !menu.classList.contains('open')) return;
      var brand = document.querySelector('.nav .brand');
      var items = [brand, toggle].concat([].slice.call(menu.querySelectorAll('a'))).filter(Boolean);
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  // Révélation des images : un balayage net, une seule fois par image.
  // Sans IntersectionObserver ou avec « réduire les animations », rien n'est caché.
  var reveal = [].slice.call(document.querySelectorAll('.rv'));
  if (reveal.length && 'IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    document.documentElement.classList.add('js-rv');
    reveal.forEach(function (el) { io.observe(el); });
    setTimeout(function () { reveal.forEach(function (el) { el.classList.add('in'); }); }, 6000);
  }

  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      trackEvent(el.getAttribute('data-track'));
    });
  });
});
