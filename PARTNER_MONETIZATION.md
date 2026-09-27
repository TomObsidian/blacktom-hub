# PARTNER_MONETIZATION — BLACKTOM

Date : 2026-09-27

Ce document décrit l'architecture d'affiliation/partenaires de BLACKTOM : comment elle fonctionne, comment l'administrer, comment elle se mesure. Noir sur blanc, sans invention : ce qui est décrit ici est ce qui existe réellement dans le projet à cette date.

## 1. Vue d'ensemble

BLACKTOM ne connaît que deux types de liens sortants monétisés :

- **Partenaires** (`data/partners.json`) : marques externes, relation d'affiliation réelle (Prozis, Ragna, Zumub, VitaStrong aujourd'hui).
- **Produits propriétaires** (Black Boar, The Ultimate Method) : ce ne sont **pas** des partenaires. Ils ont leurs propres événements (`blackboar_waitlist_signup`, `ultimate_method_click`), jamais `partner_click`. C'est une distinction volontaire du modèle : les revenus externes (commission) et les actifs propriétaires (marque BLACKTOM) ne doivent jamais être mélangés dans les mesures.

## 2. Ajouter un nouveau partenaire (sans coder)

Dans BLACKTOM Admin (`/admin`) → collection **Partenaires** → fichier **Liste des partenaires** → ajouter une ligne. Champs disponibles :

| Champ | Rôle |
|---|---|
| Nom | Affiché tel quel |
| Afficher ce partenaire | Interrupteur général — décoché = invisible partout, sans perdre les données |
| Catégorie | Ligne affichée sous le nom (ex: "Nutrition · Compléments") |
| Mettre en avant | Réservé à un usage futur (aucun effet aujourd'hui) |
| Logo | Carré recommandé |
| Description courte / Ce que j'utilise chez eux | Texte libre, laisser vide plutôt qu'inventer |
| Mon avantage | Ex: "-10%" |
| Code promo | Ex: "BLACKTOM" |
| Lien vers le partenaire | Lien de base — les paramètres de suivi sont ajoutés automatiquement (voir §5) |
| Ajouter des paramètres de suivi au lien | Désactiver uniquement si le lien affilié du partenaire ne doit jamais être modifié (certains systèmes d'affiliation cassent si on ajoute des paramètres) |
| Date de fin du partenariat | Laisser vide tant que c'est actif. Une fois passée, le code/CTA disparaissent automatiquement (voir §3) — le partenaire reste dans l'historique, rien n'est supprimé |
| Notes internes | Non affiché publiquement, pour toi |

La publication passe par le workflow éditorial habituel (branche `cms/...` → PR → "Publier" dans l'admin).

## 3. Cycle de vie d'un partenariat

Pas de machine à états lourde (draft/active/paused/expired/archived) pour l'instant — avec 4 partenaires réels, ça aurait été de la sur-ingénierie. À la place, deux leviers suffisants et déjà câblés :

- **Afficher ce partenaire = non** → retiré immédiatement de partout (hub, page dédiée), données conservées.
- **Date de fin** → une fois dépassée, `isPartnerActive()` (dans `partners.js`) le traite comme inactif automatiquement, sans action manuelle. C'est ce qui répond au risque identifié dans l'audit : *"un partenaire expiré ne doit pas continuer à afficher un ancien code comme valide."*

Sur la page dédiée Prozis (`/code-promo-prozis`), si le partenaire devient inactif, le bloc code/CTA est remplacé par un message neutre ("Ce partenariat n'est plus actif pour le moment") plutôt que de supprimer la page — elle peut avoir de la valeur SEO à conserver.

## 4. Où vivent les partenaires

- **Hub `/partenaires`** : liste toutes les cartes actives (`partners.js` → `partnerCardHTML`).
- **`/code-promo-prozis`** : landing dédiée pour Prozis uniquement, avec sa propre intention de recherche transactionnelle ("code promo Prozis BLACKTOM"). Les autres partenaires n'ont pas de page dédiée aujourd'hui — un template générique `/partenaires/[slug]` est une option future documentée mais non construite (pas nécessaire tant qu'il n'y a que 4 partenaires et qu'un seul a une vraie intention de recherche transactionnelle propre).
- **`/complements`** : liste de compléments (`data/supplements.json`), avec des champs prêts pour lier un produit à un partenaire (`partnerSlug`, `promoCode`, `affiliateUrl`) — **actuellement tous vides**, à remplir par Tom (voir Actions).

## 5. UTM

Convention appliquée automatiquement par `buildPartnerUrl()` dans `partners.js`, sauf si le partenaire a "Ajouter des paramètres de suivi" désactivé (le lien part alors intact, sans jamais risquer de casser le tracking du partenaire) :

```
utm_source=blacktom
utm_medium=affiliate
utm_campaign=<slug du partenaire>
```

Pas de `utm_content` dynamique pour l'instant (pas encore de placement contextuel dans un article — voir Roadmap).

## 6. Événements de tracking (déjà implémentés, en attente de GA4)

Tous passent par `trackEvent(name, params)` (actuellement `console.debug` — voir `SEO_BASELINE.md` pour l'état GA4). Aucun ne transmet de donnée personnelle.

| Événement | Déclenché par | Paramètres |
|---|---|---|
| `partner_click` | Clic sur "Voir chez X" | `partner`, `source_page`, `placement`, `cta_type` (toujours `affiliate_link` aujourd'hui) |
| `promo_code_copy` | Clic sur "Copier le code" | `partner`, `promo_code`, `source_page`, `placement` |
| `newsletter_signup` | Formulaire BLACKTOM — La liste | `source_page` (jamais l'email) |
| `blackboar_waitlist_signup` | Formulaire Black Boar DROP 01 | `source_page`, `source_component` |
| `ultimate_method_click` | CTA "Accéder à l'application" (hero + bandeau CTA) | aucun paramètre — événement nommé simple |

`content_type` et `product` (prévus dans le brief business pour un futur module de recommandation contextuelle dans un article) ne sont pas encore émis : aucun article n'insère aujourd'hui de recommandation produit, donc rien à tracker sur ce point tant que ce module n'existe pas.

## 7. Ce qui n'est PAS mesurable automatiquement

BLACKTOM ne connaît jamais les commandes ni le montant des commissions réalisées chez un partenaire — cette donnée vit uniquement dans le dashboard de chaque programme d'affiliation. Aucune tentative d'attribution automatique n'a été implémentée ni ne doit l'être : ce serait une donnée inventée. Le rapprochement `clics → commandes → commission` reste manuel (copier les chiffres du dashboard partenaire à côté des clics/copies mesurés côté BLACKTOM).

## 8. Ce qui reste à construire (non fait, documenté pour plus tard)

- Module "Ce que j'utilise" réutilisable dans un article (le composant équivalent existe déjà sur `/complements`, mais rien ne l'insère dans un article de contenu) — à construire quand un premier article aura une vraie raison d'y recommander un produit précis.
- Template `/partenaires/[slug]` générique — seulement si un 2ᵉ partenaire mérite sa propre landing.
- `data/supplements.json` : structure prête, aucune ligne ne référence encore de marque/produit/code réel.
