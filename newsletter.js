// Formulaires "BLACKTOM — La liste".
// Collecte via Netlify Forms (déjà disponible avec l'hébergement actuel,
// aucun compte ni clé API à créer). L'envoi de newsletters n'est pas encore
// branché : c'est une étape séparée, avec un vrai service, quand vous serez prêt.

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('form[data-newsletter]').forEach(function (form) {
    form.addEventListener('submit', function () {
      // Netlify traite la requête normalement ; on journalise juste l'intention
      // avant la redirection vers la page de confirmation.
      if (typeof trackEvent === 'function') {
        trackEvent('newsletter_signup', {
          source_page: form.getAttribute('data-source-page') || 'unknown',
          source_component: form.getAttribute('data-source-component') || 'unknown'
        });
      }
    });
  });
});
