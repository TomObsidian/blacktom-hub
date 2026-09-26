// Source unique de l'architecture de contenu BLACKTOM (SEO — Étape 6).
// Modifiez UNIQUEMENT ce fichier pour ajouter/retirer une catégorie ou faire
// passer un contenu de "planned" à "published" une fois l'article réellement
// écrit et mis en ligne. /contenus.html et les pages de catégorie lisent ces
// mêmes données — ne dupliquez pas cette liste ailleurs.
//
// Catégories : structure de navigation, toujours réelles (jamais de contenu inventé).
window.BLACKTOM_CATEGORIES = [
  {
    slug: 'developpe-couche',
    name: 'Développé couché',
    tagline: 'Progresser au bench, franchir les plateaux, préparer une compétition.'
  },
  {
    slug: 'entrainement',
    name: 'Entraînement',
    tagline: 'Force, hypertrophie et organisation des séances après 40 ans.'
  },
  {
    slug: 'nutrition',
    name: 'Nutrition',
    tagline: 'Protéines, compléments et alimentation autour de l’entraînement.'
  },
  {
    slug: 'recuperation',
    name: 'Récupération',
    tagline: 'Sommeil, gestion de la fatigue et prévention des blessures.'
  },
  {
    slug: 'equipement',
    name: 'Équipement',
    tagline: 'Ce que j’utilise vraiment à la salle et à la maison.'
  }
];

// Contenus : status "planned" = sujet identifié, pas encore rédigé (n'apparaît
// jamais comme un lien cliquable tant que url est null). status "published" =
// article réellement en ligne (url renseignée) — à ajouter au sitemap.xml au
// moment de la publication, jamais avant.
window.BLACKTOM_CONTENT = [
  { title: 'Musculation après 40 ans', type: 'pilier', category: null, status: 'planned', url: null },
  { title: 'Développé couché après 40 ans', type: 'article', category: 'developpe-couche', status: 'published', url: '/developpe-couche/apres-40-ans' },
  { title: 'Comment progresser au développé couché', type: 'article', category: 'developpe-couche', status: 'published', url: '/developpe-couche/progresser' },
  { title: 'Programme développé couché', type: 'article', category: 'developpe-couche', status: 'planned', url: null },
  { title: 'BLACKTOM Bench Lab (calculateur 1RM)', type: 'outil', category: 'developpe-couche', status: 'published', url: '/outils/calculateur-1rm-developpe-couche' },
  { title: 'Ratio développé couché / poids du corps', type: 'article', category: 'developpe-couche', status: 'planned', url: null },
  { title: 'Mes compléments', type: 'page', category: 'nutrition', status: 'published', url: 'complements.html' },
  { title: 'Créatine après 40 ans', type: 'article', category: 'nutrition', status: 'planned', url: null },
  { title: 'Combien de protéines après 40 ans', type: 'article', category: 'nutrition', status: 'planned', url: null },
  { title: 'Quelle whey choisir', type: 'article', category: 'nutrition', status: 'planned', url: null },
  { title: 'Code promo Prozis BLACKTOM', type: 'commercial', category: 'nutrition', status: 'published', url: 'code-promo-prozis.html' }
];
