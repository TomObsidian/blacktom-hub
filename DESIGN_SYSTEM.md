# BLACKTOM, le Registre

La monographie d'un homme qui soulève lourd, mise en page comme un magazine et tenue comme une feuille de pesée. Ce document est la référence pour toute nouvelle page ou nouveau bloc.

Tout vit dans `styles.css`. Les valeurs sont des variables CSS en tête de fichier : changer l'accent ou une police ne demande de toucher qu'à `:root`.

## Trois idées

1. **Le chiffre est l'architecture.** Un nombre monumental, rogné par le bord de page, est la signature (le relevé, le résultat des outils). Le nom et l'âge, eux, restent discrets (voir « Discrétion »).
2. **Le noir et le rouge sont des matières.** Trois noirs, deux blancs cassés, une famille de rouge sang séché. Les sections alternent entre fonte (noir), papier (clair) et sang (rouge sang séché profond), jamais plus de deux de suite de la même matière.
3. **La photo est un document.** En couleur, noirs calés sur la fonte, grain cuit dans le fichier, légende factuelle (fichier, matériel, date).

## Matières et couleurs

| Variable | Valeur | Rôle |
|---|---|---|
| `--fonte` | `#0E0E0D` | fond principal, noir chaud |
| `--presse` | `#080807` | couverture, planches, pied de page, mast |
| `--bitume` | `#1C1B19` | surfaces rares sur noir |
| `--craie` | `#F2EFE8` | texte sur noir, boutons |
| `--papier` | `#E4DFD3` | sections claires |
| `--cendre` | `#A39F95` | texte secondaire sur noir (7,3:1) |
| `--acier` | `#57544E` | texte secondaire sur papier (5,8:1) |
| `--rouge` | `#6B0F14` | sang séché : accent sur papier, boutons, détails (9,3:1 sur papier) |
| `--rouge-vif` | `#8A141A` | sang séché clair : filets et chiffres sur noir |
| `--rouge-mot` | `#8A141A` | mot géant de la couverture (très grand format décoratif) |
| `--rouge-clair` | `#E4707B` | sang très clair : texte sur noir (6:1), erreurs, page courante |
| `--sang` | `#3A0709` | aplats de section, texte craie dessus (16:1) |
| `--sang-haut` | `#5A0E14` | détails |
| `--bordeaux` | `#260405` | presque noir : surfaces sur aplat |

Une classe de matière (`.fonte`, `.presse`, `.paper`, `.sang`) redéfinit `--bg`, `--fg`, `--fg2`, `--rule`, `--rule2`. Les composants ne lisent que ces variables, jamais une couleur en dur : ils fonctionnent donc sur toutes les matières. Les anciens noms (`--txt`, `--wht`, `--dim`, `--dim2`, `--line`, `--red-text`, `--ph`, `--pb`) restent définis pour les styles inline des pages statiques.

**Le rouge sang séché est la couleur de la marque.** Aplats profonds (`.sang`) pour les sections d'inscription, Food Lab et les rangées d'À propos ; filets de 4 px (`--bar`) ; le mot BLACKTOM géant ; le rapport au poids de corps. Jamais en texte courant : les liens de texte sont soulignés en rouge, pas colorés. Sur `.sang`, les boutons passent en craie.

## Typographie

Auto-hébergée dans `assets/fonts/` (licences OFL incluses), préchargée dans le `<head>`.

| Famille | Variable | Usage |
|---|---|---|
| Big Shoulders Display (700 à 900) | `--display` | numéraux, titres, toujours en majuscules |
| Newsreader (400 à 600, italique 400 à 500) | `--serif` | chapôs, texte d'article, citations, légendes longues |
| Archivo (400 à 700) | `--sans` | navigation, boutons, champs, légendes courtes |

Échelle volontairement brutale : 19 px de texte contre 168 px de titre.

| Usage | Réglage |
|---|---|
| Numéral monumental | display 900, 150 à 560 px, interligne .74 à .8 |
| Titre de page | display 800, 56 à 168 px (104 px max en article) |
| Titre de section | display 800, 34 à 136 px |
| Chapô | serif 400, 20 à 28 px, interligne 1,38 |
| Texte d'article | serif 400, 18 à 20 px, interligne 1,62, 44 rem maximum |
| Citation | serif italique 400, 30 à 60 px |
| Navigation, boutons | sans 600, 13 px, majuscules, suivi .1em |
| Légendes | sans 400, 12 à 13 px, casse normale |

Pas de police mono, pas de micro-libellés en majuscules espacées précédés d'un trait.

## Grille et espacement

Marges de page : 16 px sur mobile, 56 px dès 820 px (`--pad`), largeur maximale 1680 px. Sur desktop, le texte d'article s'aligne sur la colonne 4 d'une grille de 12, les titres partent de la colonne 1. Échelle d'espacement : 4, 8, 16, 24, 48, 72, 112, 176 px (`--s1` à `--s8`), `--section` pour l'espace entre sections. Serré dans un bloc, vide entre les blocs.

## Règles

1. Aucun contenu centré (sauf 404 et pages de remerciement).
2. Une idée dominante par écran : un chiffre, une photo ou un texte.
3. Chaque page contient un élément au moins 8 fois plus grand que le texte courant.
4. Pas plus de deux sections consécutives de la même matière.
5. Filets de 4 px en tête de bloc, 1 px en séparation. Des filets, pas des boîtes.
6. Rayon 0. Aucune ombre, aucun dégradé, aucun flou.
6 bis. Un grand chiffre garde de la place sous lui (virgules et jambages) : `padding-bottom` de .2em.
7. Les images sont bord à bord ou alignées sur la grille, légende dessous, jamais dans une carte.
8. Un seul élément encadré par page : le formulaire (champ souligné, case carrée).
9. Les verbes concrets remplacent les « Découvrir » et les « → » en suffixe.
10. Aucune donnée inventée : les chiffres viennent de `data/status.json`, les légendes de photos viennent des métadonnées.

Test de contrôle avant chaque page : y a-t-il un élément 8 fois plus grand que le texte ? du rouge foncé quelque part ? une photo non voilée ? aucun bloc encadré inutile ? aucun texte qui en touche un autre (virgules, accents, jambages) ?

## Composants

| Composant | Classes | Où |
|---|---|---|
| Mast | `.nav`, `.brand`, `.nav-links`, `.nav-toggle` | toutes les pages, collant, noir presse |
| Sommaire | `.mobile-menu` | plein écran sur mobile, Échap ferme, focus piégé |
| Couverture | `.cover`, `.cover-photo`, `.cover-quote`, `.cover-mark` | accueil, À propos, Black Boar (`.cover--bb`) |
| Relevé | `.releve`, `.fig` (`.n` `.u` `.d` `.s`) | accueil, sur papier |
| Dossier et entrées | `.dossier`, `.entries`, `.entry` | journal de l'accueil |
| Instruments | `.instruments`, `.instrument`, `.bar-fig` | accueil et page Outils |
| Planche contact | `.planche`, `.plate` | accueil |
| Univers | `.univers .row` | accueil |
| Colophon | `.colophon`, `.partner-row` | partenaires, logos blancs (inversés sur papier) |
| Offre | `.offre` (+ `.sang`), `.offre-num`, `.offre-code`, `.offre-act`, `.offre-fine` | `/partenaires` (en tête), articles : le chiffre de la réduction en monumental, le code en bouton, la mention d'affiliation avant le lien |
| Bons plans | `.bons-plans`, `.bp-num`, `.bp-code`, `.bp-go` | `/partenaires` : tableau marque / avantage / code / lien, empilé sur mobile |
| Barre collante | `.offre-bar` | pages qui portent `data-offer-bar="slug"` sur `<main>` : après 30 % de lecture, masquée quand une offre est visible, fermable |
| La liste | `.liste`, `.signup-card` | formulaires d'inscription |
| Bande photo | `.band-fig` | en-tête des articles |
| Corps d'article | `.bio-block` | texte, listes, tableaux, sources |
| Boutons | `.btn`, `.btn-primary`, `.btn-ghost`, `.link-line` | partout, inversion instantanée au survol |
| Pied de page | `footer` | le mot BLACKTOM, discret (30 % de la largeur), calé par `cqw` |

Le mot BLACKTOM (couverture, pied de page) est une signature discrète : `font-size: calc(100cqw / 3.9 * .3)`, 3,9 em étant la largeur réelle de « BLACKTOM » en Big Shoulders 900. Changer la police impose de re-mesurer ce nombre. Le mot n'est plus rogné ni monumental : le nom de Tom ne doit pas dominer la page. La page À propos garde « TOM. » à la même échelle.

## Animation

Mécanique, rare, jamais décorative. Les images apparaissent par un balayage net de haut en bas (400 ms, une seule fois, classe `.rv` activée par `app.js`). Le survol est une inversion instantanée. Le menu s'ouvre sans transition. Tout est coupé avec `prefers-reduced-motion`, et sans JavaScript rien n'est caché.

## Photos

`scripts/registre-photos.py` produit tous les visuels : recadrage dur, niveaux calés (noir sur `#0E0E0D`), courbe en S douce appliquée à tous les canaux (la teinte est conservée), grain gaussien appliqué après le redimensionnement, JPEG progressif. L'option `--bw` produit la version noir et blanc. Sorties dans `assets/registre/` (`nom.jpg` et `nom-sm.jpg`).

```bash
python3 scripts/registre-photos.py            # tout
python3 scripts/registre-photos.py cover about  # certains visuels
```

Pour ajouter une photo, ajouter une ligne au tableau `ASSETS` (source, recadrage en fractions, largeur principale, largeur mobile), puis lancer le script. Légendes : nom de fichier, matériel et date lus dans les métadonnées de la photo, rien d'autre.

Formats : couverture et portraits 2:3, détails 1:1, planche contact 4:5, bandes 21:9.

## Administration (Decap)

Chaque nouveau bloc ou champ doit être reflété dans `admin/config.yml` (`contact-sheet` l'a été avec cette refonte).

## Offres partenaires

Les composants d'offre suivent les mêmes règles (rayon 0, aucune ombre, aucun dégradé). Le code est un bouton à bord de 2 px, comme `.btn`. La mention « Collaboration commerciale · lien affilié » précède toujours le bouton. Mode d'emploi, extraits à coller et placement : `OFFRES_PARTENAIRES.md`.

## Discrétion : le nom et l'âge

Le nom (BLACKTOM, TOM.) et l'âge (« après 40 ans ») restent lisibles mais ne portent jamais la page. Le mot de couverture et celui du pied de page sont à 30 % de la largeur. « après 40 ans » reste dans les titres (lecture et référencement) mais en retrait : `<span class="age">après 40 ans</span>` (0,55 em, gris secondaire). Dans les gabarits Eleventy, le filtre `softAge` fait la même chose automatiquement (`{{ titre | softAge | safe }}`). Ne jamais écrire l'âge en chiffres (« 43 ans »).
