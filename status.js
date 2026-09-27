// "Mes performances" — éditable dans BLACKTOM Admin : data/status.json.
// Une valeur laissée vide (null) n'est jamais affichée comme un tiret public
// inventé : la ligne ou le bloc correspondant est simplement masqué.

window.BLACKTOM_STATUS_READY = fetch('/data/status.json')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    window.BLACKTOM_STATUS = data || {};
    return window.BLACKTOM_STATUS;
  });

document.addEventListener('DOMContentLoaded', function () {
  window.BLACKTOM_STATUS_READY.then(function (s) {
    var map = {
      'status-poids': s.poids,
      'status-dc': s.developpe_couche,
      'status-objectif': s.objectif,
      'status-competition': s.prochaine_competition,
      'status-projet': s.projet_actuel
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = map[id] || '—';
    });

    // Bloc "Mon bench" (ex: /developpe-couche) : contrairement au bloc
    // ci-dessus, on ne montre jamais de tiret public — une ligne sans donnée
    // réelle est retirée, et si aucune donnée n'existe le bloc entier est masqué.
    var benchCard = document.getElementById('mon-bench-card');
    if (benchCard) {
      var visibleRows = 0;
      benchCard.querySelectorAll('[data-field]').forEach(function (row) {
        var value = s[row.getAttribute('data-field')];
        if (value) {
          row.querySelector('.v').textContent = value;
          visibleRows++;
        } else {
          row.style.display = 'none';
        }
      });
      if (!visibleRows) {
        var section = benchCard.closest('.hub-section');
        (section || benchCard).style.display = 'none';
      }
    }
  });
});
