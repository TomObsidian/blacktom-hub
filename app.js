document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Mesure des clics — stub prêt pour un outil d'analytics futur (aucun outil
  // n'est branché pour l'instant : on se contente de journaliser localement).
  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      console.debug('[track]', el.getAttribute('data-track'));
    });
  });
});
