// Source unique des compléments BLACKTOM — /complements.html lit ces
// données. Ne modifier QUE ce fichier pour ajouter/désactiver un complément,
// changer une dose, une marque, un produit ou un lien partenaire.
//
// Champs :
//   slug          identifiant stable (tracking, futur lien d'article)
//   name          nom affiché
//   category      référence à un slug de BLACKTOM_SUPPLEMENT_CATEGORIES
//   general       explication générale et établie, non personnelle (ou null)
//   personal      raison personnelle réelle SI fournie pour publication (ou
//                 null — ne jamais inventer un motif médical/personnel)
//   timing        moment de prise si connu (ou null)
//   dose          dose personnelle réelle si fournie (ou null — jamais inventée)
//   note          précision d'usage courte, ex. "Ponctuel / si besoin" (ou null)
//   brand         marque utilisée si renseignée (ou null)
//   product       nom exact du produit si renseigné (ou null)
//   partnerSlug   slug vers partners-data.js si un partenaire vend ce produit (ou null)
//   promoCode     code promo si applicable à ce produit précis (ou null)
//   affiliateUrl  lien affilié direct vers LE produit exact (ou null — tant
//                 que ce champ est null, aucun bouton "Voir le produit" ne
//                 s'affiche : ne jamais deviner un lien Prozis)
//   articleUrl    futur article BLACKTOM dédié (ou null pour l'instant)
//   active        false = masqué partout
//   order         ordre d'affichage dans sa catégorie
window.BLACKTOM_SUPPLEMENT_CATEGORIES = [
  { slug: 'performance', name: 'Performance' },
  { slug: 'recuperation', name: 'Récupération' },
  { slug: 'micronutriments', name: 'Micronutriments' },
  { slug: 'autres', name: 'Autres' },
  { slug: 'pratique', name: 'Nutrition pratique' }
];

window.BLACKTOM_SUPPLEMENTS = [
  { slug: 'creatine', name: 'Créatine', category: 'performance', order: 1,
    general: 'Un des compléments les plus étudiés pour soutenir la force et la puissance à l’entraînement.',
    personal: null, timing: null, dose: '5 g/jour', note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'whey', name: 'Whey', category: 'performance', order: 2,
    general: 'Une source de protéines pratique pour couvrir les apports du quotidien autour de l’entraînement.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'pre-workout', name: 'Pré-workout', category: 'performance', order: 3,
    general: 'Un stimulant, souvent à base de caféine, pris avant l’entraînement.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'magnesium', name: 'Magnésium', category: 'recuperation', order: 1,
    general: 'Un minéral impliqué dans de nombreuses fonctions musculaires et nerveuses.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'glycine', name: 'Glycine', category: 'recuperation', order: 2,
    general: 'Un acide aminé parfois utilisé en fin de journée.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'collagene', name: 'Collagène', category: 'recuperation', order: 3,
    general: 'Une protéine structurale, parfois utilisée pour la peau, les tendons et les articulations.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'vitamine-c', name: 'Vitamine C', category: 'recuperation', order: 4,
    general: 'Une vitamine antioxydante, notamment impliquée dans la synthèse du collagène.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'vitamine-d', name: 'Vitamine D', category: 'micronutriments', order: 1,
    general: 'Une vitamine dont les apports sont souvent plus faibles en hiver ou avec peu d’exposition au soleil.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'zinc', name: 'Zinc', category: 'micronutriments', order: 2,
    general: 'Un oligo-élément impliqué dans de nombreuses fonctions de l’organisme, dont le système immunitaire.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'selenium', name: 'Sélénium', category: 'micronutriments', order: 3,
    general: 'Un oligo-élément antioxydant, présent en petites quantités dans l’alimentation.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'omega-3', name: 'Oméga-3', category: 'micronutriments', order: 4,
    general: 'Des acides gras essentiels, notamment présents dans les poissons gras.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'coq10', name: 'Coenzyme Q10', category: 'autres', order: 1,
    general: 'Un composé impliqué dans la production d’énergie au niveau cellulaire.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'rhodiola', name: 'Rhodiola', category: 'autres', order: 2,
    general: 'Une plante adaptogène, parfois utilisée en période de fatigue ou de stress.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'ashwagandha', name: 'Ashwagandha', category: 'autres', order: 3,
    general: 'Une plante adaptogène, parfois utilisée ponctuellement en période de stress ou de fatigue.',
    personal: null, timing: null, dose: null, note: 'Ponctuel / si besoin',
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true },

  { slug: 'barres-proteinees', name: 'Barres protéinées', category: 'pratique', order: 1,
    general: 'Une option pratique pour un apport en protéines en dehors des repas.',
    personal: null, timing: null, dose: null, note: null,
    brand: null, product: null, partnerSlug: null, promoCode: null, affiliateUrl: null,
    articleUrl: null, active: true }
];
