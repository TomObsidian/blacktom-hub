// Source unique des partenaires BLACKTOM.
// Modifiez UNIQUEMENT ce fichier pour changer un code, une offre, un lien ou
// activer/désactiver un partenaire — toutes les pages (accueil, /partenaires,
// /code-promo-prozis) lisent ces mêmes données.
//
// Champs :
//   slug         identifiant (utilisé dans l'URL/les événements de tracking)
//   name         nom affiché
//   logo         chemin vers le logo, ou null pour utiliser une pastille-lettre
//   active       false = le partenaire n'apparaît nulle part (ex: infos pas encore prêtes)
//   description  courte description de la marque (null = pas encore rédigée)
//   usage        "Ce que j'utilise chez eux" (null = pas encore confirmé)
//   offer        "Mon avantage actuel" (null = pas d'offre confirmée pour l'instant)
//   code         code promo réel, ou null
//   url          lien vers le partenaire (lien affilié si applicable), ou null
//   utm          true = on peut ajouter des paramètres UTM à `url` sans risque ;
//                false = ne jamais modifier `url` (le tracking du lien affilié prime)
//   expires      date d'expiration de l'offre (format libre), ou null
//   legal        mention légale spécifique si besoin (sinon la mention générique du site s'applique)
window.BLACKTOM_PARTNERS = [
  {
    slug: 'prozis',
    name: 'Prozis',
    logo: 'assets/partenaire-prozis-16ed36ea.png',
    active: true,
    description: null,
    usage: 'Vêtements et accessoires d’entraînement.',
    offer: '-10%',
    code: 'BLACKTOM',
    url: 'https://www.prozis.com/1SSIS',
    utm: true,
    expires: null,
    legal: null
  },
  {
    slug: 'ragna',
    name: 'Ragna',
    logo: 'assets/partenaire-ragna-fe63d166.png',
    active: false, // en attente du code promo et du lien affilié réels (offre -20% déjà confirmée)
    description: null,
    usage: null,
    offer: '-20%',
    code: null,
    url: null,
    utm: true,
    expires: null,
    legal: null
  },
  {
    slug: 'zumub',
    name: 'Zumub',
    logo: 'assets/partenaire-zumub.webp',
    active: true,
    description: null,
    usage: null,
    offer: '-10%',
    code: 'BLACKTOM',
    url: 'https://www.zumub.com/FR/',
    utm: true,
    expires: null,
    legal: null
  },
  {
    slug: 'vitastrong',
    name: 'VitaStrong',
    logo: 'assets/partenaire-vitastrong.png',
    active: true,
    description: null,
    usage: null,
    offer: '-10%',
    code: 'BLACKTOM',
    url: 'https://vitastrong.fr/fr/',
    utm: true,
    expires: null,
    legal: null
  }
];
