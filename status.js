// Section "En ce moment" de la home — seul fichier à modifier pour la mettre à jour.
// Remplacez chaque valeur par la vraie donnée (garder null si inconnue : la home
// affiche alors "—" au lieu d'inventer une valeur).
window.BLACKTOM_STATUS = {
  poids: null,                  // ex: "82 kg"
  developpe_couche: null,       // ex: "120 kg x 1"
  objectif: null,               // ex: "130 kg au développé couché"
  objectif_long_terme: null,    // ex: "150 kg au développé couché"
  prochaine_competition: null,  // ex: "Mars 2027"
  projet_actuel: null,          // ex: "Préparation compétition"
};

document.addEventListener('DOMContentLoaded', function () {
  var s = window.BLACKTOM_STATUS || {};
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
