# Offres partenaires : plan d'action, composants et mode d'emploi

Branche `offres-partenaires`. Rien n'est publié : tout est visible en local (`npx eleventy`, puis un serveur statique sur `_site`).

## 1. Ce que j'ai constaté (état réel du site)

| Constat | Conséquence |
|---|---|
| `/partenaires` injectait ses cartes par JavaScript (`fetch('/data/partners.json')`). Le HTML livré était vide. | Les codes et réductions n'étaient pas dans le HTML lu par Google. **Corrigé** : la page est rendue au build. |
| Une seule fiche article montre des offres (créatine, en bas de page). Les quatre autres articles n'en montrent aucune (les « 7 mentions » partenaires sont le menu et le pied de page). | Le trafic qui lit un article ne voit jamais un code. |
| Sur l'accueil, le bloc partenaires était 7ᵉ sur 8, juste avant la newsletter. | Presque personne n'y arrive. **Remonté** en 4ᵉ position. |
| Le menu disait « Partenaires ». | Pas de mot-clé, pas d'intention d'achat. **Renommé** « Codes promo » (l'URL `/partenaires` ne change pas). |
| Seul Prozis a un vrai lien d'affiliation (`prozis.com/1SSlS`). Ragna, Zumub et VitaStrong pointent vers la page d'accueil de la marque. | **À vérifier par toi** : si ces programmes attribuent la vente grâce à un lien tracké (réseau d'affiliation), les commissions ne te sont pas créditées avec ces liens. Si seul le code BLACKTOM sert à l'attribution, c'est correct. Je ne peux pas le savoir depuis le site. |
| Le champ « Mettre en avant » n'avait aucun effet. Aucune date de vérification du code, aucune condition affichée. | **Corrigé** : « Mettre en avant » met la marque en tête, deux champs optionnels apparaissent dans l'admin. |
| GA4 est installé avec consentement (`analytics.js`), contrairement à ce que dit `SEO_BASELINE.md`. | Les événements `promo_code_copy` et `partner_click` sont mesurables. Voir §7. |

## 2. Ce qui est fait sur la branche

| Fichier | Rôle |
|---|---|
| `styles.css` (section « OFFRES PARTENAIRES ») | `.offre` (bande), `.bons-plans` (tableau), `.offre-bar` (barre collante), dans le langage « Registre » : chiffre monumental, filets, aucun arrondi, aucune ombre. |
| `_includes/components/offre.njk` | Macros `offre()` et `bonsPlans()`, rendues au build. |
| `partenaires.njk` (remplace `partenaires.html`) | H1, mention de collaboration commerciale, bande du partenaire en tête, tableau de tous les bons plans, mode d'emploi, FAQ (+ JSON-LD `FAQPage` identique au texte visible). |
| `partners.js` | Copier le code, mesurer, rafraîchir depuis `partners.json`, barre collante. Les anciennes fonctions sont intactes. |
| `eleventy.config.js` | Filtres `offerParts`, `activeOffers`, `frDate`. |
| `admin/config.yml` | « Mettre en avant » actif, champs « Conditions de l'offre » et « Code vérifié le ». |
| `data/pages/home.json` | Bloc « Mes codes promo » en 4ᵉ position, texte plus direct. |
| 26 pages | Libellé de menu « Codes promo ». |
| `nutrition/creatine-apres-40-ans.html` | Lien « Voir les 3 créatines et leurs codes » sous « En bref », ligne « Avantage » dans chaque fiche, barre collante. |
| `developpe-couche/apres-40-ans.html` | Lien contextuel vers les offres créatine dans « Et les compléments ? ». |
| `data/partners.json` | Prozis marqué `featured` (décision de Tom : la marque qui rapporte le plus). |

Principes tenus : aucune donnée inventée (un champ vide n'affiche rien), un partenaire arrêté ou expiré disparaît partout, chaque lien affilié porte `rel="noopener nofollow sponsored"`, la mention d'affiliation est visible **avant** le bouton.

## 3. Où placer les offres (emplacements exacts)

| Emplacement | Statut | Règle |
|---|---|---|
| Menu et pied de page : « Codes promo » | fait | Même libellé partout (ancre interne cohérente). |
| Accueil : bloc « Mes codes promo » en 4ᵉ position | fait | Juste après « Au sommaire » : le visiteur a vu qui tu es avant qu'on lui montre un code. |
| `/partenaires` : bande + tableau | fait | La bande en tête met en avant la marque `featured`, le tableau permet de comparer. |
| Article, sous « En bref » : lien « Voir les offres » | fait sur la créatine | Un lien texte, pas une boîte. Un seul. |
| Article, après la section qui crée le besoin : une bande `.offre` | seulement si une marque correspond | **Décision** : pas de bande de marque dans les articles bench et récupération. Aucune marque n'y correspond, et ton ton (« aucun complément ne compense… ») serait contredit par une offre plaquée. À la place, un lien contextuel vers les offres créatine depuis « Et les compléments ? » (fait). Maximum **une** bande par article, pour la marque réellement concernée. |
| Article, fin : fiches produit | existe (créatine) | Ne pas répéter la même marque deux fois de suite. |
| Barre collante | fait sur la créatine | Activée par `data-offer-bar="slug"` sur `<main>`. Apparaît après 30 % de lecture, disparaît quand une offre est à l'écran, se ferme et reste fermée. |
| Barre latérale | **non recommandé** | Le site est en une colonne, une sidebar casserait le « Registre » et ne sert à rien sur mobile, où elle passerait sous le contenu. |

À ne pas faire : compte à rebours, « offre exclusive » ou « dernières heures » sans preuve (ton code BLACKTOM est un code partenaire, pas forcément exclusif : n'écris « exclusif » que si la marque te l'a confirmé par écrit), fenêtre qui bloque la lecture, faux avis.

### Extraits à coller dans les pages HTML statiques

Bande d'offre (remplace `prozis`, le nom, le chiffre et le lien ; `partners.js` rafraîchit code, lien et expiration depuis `partners.json`) :

```html
<section class="offre sang" data-offer="prozis" aria-labelledby="offre-prozis-t">
  <p class="offre-flag">Collaboration commerciale · lien affilié</p>
  <div class="offre-grid">
    <p class="offre-num" data-offer-num aria-label="10 % de réduction"><span aria-hidden="true">−10<small>%</small></span></p>
    <div class="offre-txt">
      <h3 class="offre-t" id="offre-prozis-t">Prozis</h3>
      <p class="offre-sub">Vêtements et accessoires d’entraînement.</p>
      <div class="offre-code-row">
        <span class="offre-k">Code</span>
        <button type="button" class="offre-code" data-copy="BLACKTOM" data-partner="prozis" data-placement="article_mid" aria-label="Copier le code BLACKTOM (Prozis)"><span class="offre-code-v">BLACKTOM</span><span class="offre-copy" aria-hidden="true">Copier</span></button>
      </div>
      <span class="sr-only" role="status" data-copy-status></span>
    </div>
  </div>
  <div class="offre-act">
    <a class="btn btn-primary" href="https://prozis.com/1SSlS" target="_blank" rel="noopener nofollow sponsored" data-partner-link="prozis" data-placement="article_mid">Voir l'offre chez Prozis<span class="sr-only"> (lien affilié, nouvel onglet)</span></a>
    <a class="offre-more" href="/code-promo-prozis">Mode d'emploi et conditions</a>
  </div>
  <p class="offre-fine">Je peux toucher une commission si tu commandes via ce lien, sans surcoût pour toi. Vérifie la réduction dans ton panier avant de payer.</p>
</section>
```

La page doit charger `<script src="/partners.js"></script>` (déjà le cas sur l'article créatine) et son `<body>` doit porter `data-source-page="nom_de_la_page"` pour que les événements soient bien nommés.

Barre collante : ajouter `data-offer-bar="prozis"` à `<main id="main">`. Rien d'autre.

Dans une page `.njk` : `{% from "components/offre.njk" import offre, bonsPlans %}` puis `{{ offre(p, "article_mid", "nom_de_la_page") }}` ou `{{ bonsPlans(partnersData.partners, "top_table", "nom_de_la_page") }}`.

## 4. Structure d'un article d'affiliation (modèle)

Intention de recherche : informationnelle d'abord, transactionnelle ensuite. Un article qui ne répond qu'à « code promo » est faible face aux agrégateurs ; ton avantage est l'expérience réelle (tu utilises, tu t'entraînes, tu es daté et photographié).

```
H1   Sujet + qualificatif réel  (ex. « Créatine après 40 ans : utile pour continuer à progresser ? »)
     En bref (3 lignes, la réponse)                      ← lien « Voir les offres » ici
H2   Ce que c'est / pourquoi (définition courte)
H2   Ce que disent les données (sources numérotées, limites assumées)
H2   Comment l'utiliser (dose, moment, erreurs)
H2   Ce que j'utilise et pourquoi                        ← bande .offre de LA marque concernée
H2   Comment choisir (critères) / options chez mes partenaires   ← fiches produit
H2   Questions fréquentes (H3 = questions réelles)       ← FAQPage identique au texte visible
```

Règles : un H1 par page ; chaque H2 répond à une question que quelqu'un tape ; le CTA suit la preuve, il ne la précède pas ; une promesse santé ou de résultat est interdite (le site s'y tient déjà : « sans promesse ») ; date de dernière mise à jour visible (voir `dateModified` dans le JSON-LD `Article`).

Pages « code promo {marque} » : `/code-promo-prozis` existe. Pour Ragna, Zumub et VitaStrong, une page par marque n'a de sens que si tu fournis un vrai texte (ce que tu y achètes, depuis quand, ce que tu en penses) : sans cela, ce serait du contenu creux que Google déclasse. Dis-moi quand tu as ce texte, la mécanique (`partenaires/[slug]` générée depuis `partners.json`) est prête à brancher.

## 5. Données structurées : ce qui marche, ce qui n'existe pas

Vérifié dans la documentation Google (7 octobre 2026) :

- **Il n'existe aucun résultat enrichi pour les codes promo, coupons ou réductions** dans la galerie de recherche de Google (32 types listés sur la page consultée, aucun pour les coupons). Aucune balise `Offer`/« Coupon » ne fera apparaître « −10 % » dans les résultats. Ne pas en attendre.
- **Les étoiles** (extrait d'avis) existent pour `Product`, mais : l'avis doit être **vrai, visible sur la page**, écrit par une personne ou une organisation nommée ; la page doit porter sur **un seul produit** (pas une liste, pas ce tableau de bons plans) ; ne pas agréger d'avis d'autres sites. Inventer une note (`aggregateRating` sans vraies notes) expose à une action manuelle et casse ta règle « aucune donnée inventée ».
- `FAQPage` : valide, mais Google a restreint depuis 2023 l'affichage de ces résultats à très peu de sites (information que je n'ai pas revérifiée aujourd'hui). Garde-le (il décrit le contenu), n'en attends pas de visibilité.

Ce qui est déjà en place et reste : `Organization` (accueil), `Person` (à propos), `Article` (+ `Person` auteur, `Organization` éditeur), `BreadcrumbList`, `FAQPage`.

### Modèle à utiliser seulement pour une vraie fiche « avis sur un produit »

À n'utiliser que sur une page consacrée à **un** produit que tu as réellement utilisé, avec ton avis écrit visible, ta note (la tienne), et un prix réel. Sans prix, retire `offers`. Sans avis écrit, n'utilise pas ce bloc.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "NOM EXACT DU PRODUIT",
  "image": "https://blacktom.fr/assets/…",
  "brand": { "@type": "Brand", "name": "MARQUE" },
  "review": {
    "@type": "Review",
    "author": { "@type": "Person", "name": "BLACKTOM", "url": "https://blacktom.fr/a-propos" },
    "datePublished": "AAAA-MM-JJ",
    "reviewBody": "LE MÊME TEXTE QUE CELUI AFFICHÉ SUR LA PAGE",
    "reviewRating": { "@type": "Rating", "ratingValue": "4", "bestRating": "5" },
    "positiveNotes": { "@type": "ItemList", "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Point fort réel 1" },
      { "@type": "ListItem", "position": 2, "name": "Point fort réel 2" } ] },
    "negativeNotes": { "@type": "ItemList", "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Limite réelle 1" },
      { "@type": "ListItem", "position": 2, "name": "Limite réelle 2" } ] }
  },
  "offers": {
    "@type": "Offer",
    "url": "https://LIEN-DU-PRODUIT",
    "price": "00.00",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  }
}
</script>
```

Contraintes : au moins deux points (forts ou faibles) si tu utilises `positiveNotes`/`negativeNotes` ; la note doit être la tienne ; le texte doit être identique à ce que lit le visiteur.

## 6. Maillage interne et architecture

- **Menu** : Journal · Outils · **Codes promo** · Black Boar · Ultimate Method · À propos (fait).
- **Accueil** : hero → relevé → journal → **codes promo** → outils (fait). Option : un lien tertiaire « Mes codes promo » dans le hero (il faut ajouter un champ au bloc hero ; dis-moi si tu le veux).
- **Silo** : article → bande de la marque concernée → page « code promo {marque} » → `/partenaires` → retour aux articles liés. Chaque page « marque » renvoie vers 2 articles qui l'utilisent ; chaque article renvoie vers la page de la marque (ancre : « code promo Prozis », pas « cliquez ici »).
- **Liens entre articles** : un bloc « À lire ensuite » (2 liens) en fin d'article ; aujourd'hui seul le menu relie les contenus.
- `sitemap.xml` est statique : ajouter les nouvelles pages à la main (ou le générer) à chaque publication.

## 7. Mesure (sans elle, impossible d'« optimiser le CTR »)

GA4 reçoit déjà (après consentement) : `partner_click` (`partner`, `source_page`, `placement`) et `promo_code_copy` (`partner`, `promo_code`, `source_page`, `placement`). Les nouveaux composants utilisent des `placement` distincts : `partenaires_lead`, `partenaires_table`, `article_mid`, `sticky_bar`, `product_recommendation`. Dans GA4 : Rapports → Engagement → Événements, puis comparer par `placement` (dimension personnalisée sur le paramètre). Indicateurs à suivre : clics ÷ visites de la page, copies ÷ clics, placement gagnant. Une réserve : sans consentement, GA4 ne compte pas ; les chiffres sont donc un plancher.

La commission réelle (commandes, montants) ne vit que dans les tableaux de bord des programmes d'affiliation.

## 8. Conformité (France)

- **Collaboration commerciale visible avant le lien** : c'est ce que font les nouveaux composants (« Collaboration commerciale · lien affilié » en tête de bande, rappel sous le tableau). La loi du 9 juin 2023 impose la mention claire de l'intention commerciale pour l'influence rémunérée ; la DGCCRF a contrôlé 310 influenceurs en 2024 et une majorité était en infraction. Sources : [DGCCRF, bilan des contrôles](https://www.economie.gouv.fr/dgccrf/actualites-dgccrf/la-dgccrf-dresse-le-bilan-de-ses-controles-2022-et-2023-dans-le-secteur-de-linfluence-commerciale), [synthèse de la loi](https://lagbd.org/Influenceur_sur_les_reseaux_sociaux_et_la_Loi_du_9_juin_2023). D'après les synthèses consultées, une collaboration de plus de 1 000 € avec une marque exige un contrat écrit depuis le 1er janvier 2026 : à confirmer pour ta situation avec un juriste ou la DGCCRF.
- **`rel="sponsored"`** sur tous les liens affiliés : recommandé par Google ([documentation](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)). Fait.
- **Santé** : aucune promesse de résultat, sources citées (le site le fait déjà).

## 9. Ce dont j'ai besoin de toi

1. ~~Quelle marque mettre en avant~~ : Prozis (fait).
2. **Liens Ragna, Zumub, VitaStrong** : ont-ils un lien d'affiliation tracké (réseau d'affiliation) ? Si oui, colle-le dans l'admin (« Lien vers le partenaire ») en décochant « Ajouter des paramètres de suivi » si le réseau l'exige.
3. **« Code vérifié le »** : teste chaque code dans un panier et renseigne la date dans l'admin. Je ne l'ai pas renseignée : je ne peux pas tester les codes.
4. **« Exclusif »** : si une marque te confirme que le code est exclusif, dis-le-moi, j'ajouterai le badge. Sinon il reste « Code partenaire ».
5. **Textes réels** pour les pages « code promo {marque} » (ce que tu y achètes, depuis quand).

## 10. Mise en ligne

1. Relire la branche en local (`npx eleventy`, serveur statique sur `_site`, ouvrir `/`, `/partenaires`, `/nutrition/creatine-apres-40-ans`).
2. Décider du déploiement des bandes dans les autres articles (extraits §3) : une bande par article, la marque qui correspond.
3. Pull request, relecture, publication par le chemin habituel.
4. Après publication : Search Console → inspecter `/partenaires` (le tableau doit apparaître dans le HTML rendu), puis suivre les `placement` dans GA4 pendant 2 à 4 semaines avant de juger.
