// Section "En ce moment" de la home — seul fichier à modifier pour la mettre à jour.
// Remplacez chaque valeur par la vraie donnée (garder null si inconnue : la home
// affiche alors "—" au lieu d'inventer une valeur).
window.BLACKTOM_STATUS = {
  poids: null,                  // ex: "82 kg"
  developpe_couche: null,       // ex: "120 kg x 1"
  objectif: null,               // ex: "130 kg au développé couché"
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
});
