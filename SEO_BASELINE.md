# SEO_BASELINE — BLACKTOM

Date : 2026-09-27
Domaine : https://blacktom.fr/

Ce document est un instantané de l'état technique au moment de l'audit. Il ne contient aucune donnée Search Console/Analytics inventée — ces sections restent "non disponible" tant que les outils ne sont pas connectés.

## URLs indexables (16, via sitemap.xml)

```
/
/a-propos
/contenus
/outils/
/outils/calculateur-1rm-developpe-couche
/developpe-couche
/developpe-couche/apres-40-ans
/developpe-couche/progresser
/nutrition
/complements
/partenaires
/code-promo-prozis
/black-boar
/ultimate-method
/mentions-legales
/confidentialite
```

## URLs volontairement non indexées

| URL | Statut | Raison |
|---|---|---|
| /entrainement | noindex,follow | Aucun contenu publié dessous, aucun lien entrant réel |
| /recuperation | noindex,follow | Idem |
| /equipement | noindex,follow | Idem |
| /merci-blacktom.html | noindex | Page de remerciement (cible de formulaire) |
| /merci-blackboar.html | noindex | Idem |
| /admin/ | noindex | CMS |
| /404.html | noindex | Page d'erreur |

## Nombre de contenus réellement publiés

- 2 articles longs (développé couché après 40 ans, comment progresser)
- 1 outil (BLACKTOM Bench Lab)
- 1 page commerciale (code promo Prozis)
- 1 page produit personnel (compléments)
- 5 pages "hub" (developpe-couche, contenus, nutrition, outils, partenaires)
- 2 pages marque (black-boar, ultimate-method)
- 1 page à propos

## Sitemap

Statique (`sitemap.xml`), mis à jour manuellement à ce jour. Aligné sur les URLs canoniques réelles (sans `.html`, `/outils/` avec slash final).

## Robots.txt

```
User-agent: *
Allow: /
Sitemap: https://blacktom.fr/sitemap.xml
```
Aucune ressource utile (CSS/JS/images) bloquée. `/admin/` n'est pas bloqué ici volontairement (le noindex sur la page suffit et est la méthode recommandée — un Disallow empêcherait Google de voir le noindex).

## Domaine canonique

- `http://blacktom.fr` → 301 → `https://blacktom.fr/` (déjà en place)
- `https://www.blacktom.fr` → 301 → `https://blacktom.fr/` (déjà en place)
- `https://blacktom-hub.netlify.app` → 301 → `https://blacktom.fr/` (ajouté dans cet audit)

## Structured data en place

- `Organization` (home)
- `Person` (à propos)
- `Article` + `Person` (author) + `Organization` (publisher) sur les 2 articles
- `BreadcrumbList` sur les pages profondes
- `FAQPage` sur les 2 articles et sur Bench Lab et Prozis (contenu correspond au texte visible)

## Core Web Vitals

Non mesuré — nécessite Search Console (données de terrain) ou un test PageSpeed Insights ponctuel. Ne pas inventer de chiffres.

## Search Console

Non connecté. Aucune balise de vérification trouvée dans le code. Voir la section "Actions pour Tom" du rapport.

## Analytics

Aucun (ni GA4, ni GTM, ni autre tracker) trouvé dans le code. Rien n'a été installé dans cet audit — nécessite une décision + un compte externe.

## Consentement

Sans analytics/marketing actif, aucun bandeau cookie n'est requis aujourd'hui. À revoir si GA4 est installé.
