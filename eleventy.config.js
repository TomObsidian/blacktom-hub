module.exports = function (eleventyConfig) {
  // Fichiers/dossiers déjà finis en HTML statique : copiés tels quels, jamais
  // passés dans un moteur de template. Seules les pages migrées vers un
  // système de blocs (ex: index.njk) sont traitées par Eleventy.
  eleventyConfig.addPassthroughCopy("*.html");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("data");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("outils");
  eleventyConfig.addPassthroughCopy("developpe-couche");
  eleventyConfig.addPassthroughCopy("nutrition");
  eleventyConfig.addPassthroughCopy("recuperation");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("app.js");
  eleventyConfig.addPassthroughCopy("content.js");
  eleventyConfig.addPassthroughCopy("partners.js");
  eleventyConfig.addPassthroughCopy("supplements.js");
  eleventyConfig.addPassthroughCopy("status.js");
  eleventyConfig.addPassthroughCopy("newsletter.js");
  eleventyConfig.addPassthroughCopy("analytics.js");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("_redirects");

  eleventyConfig.setTemplateFormats(["njk"]);

  // Découpe un texte libre en paragraphes (une ligne vide = un nouveau <p>).
  eleventyConfig.addFilter("splitParagraphs", function (text) {
    return (text || "").split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
  });

  // Découpe un texte libre en lignes simples (un saut de ligne = une ligne).
  eleventyConfig.addFilter("splitLines", function (text) {
    return (text || "").split(/\n/).map(function (p) { return p.trim(); }).filter(Boolean);
  });

  // Lecture des chiffres saisis dans "Mes performances" (ex: "140kg", "77 kg").
  // Rien n'est inventé : si la valeur ne contient pas de nombre, le filtre
  // renvoie la valeur brute et le rapport n'est pas calculé.
  function parseStat(v) {
    var m = String(v == null ? "" : v).match(/(\d+(?:[.,]\d+)?)\s*(.*)$/);
    if (!m) return null;
    return { raw: m[1], n: parseFloat(m[1].replace(",", ".")), unit: (m[2] || "").trim() };
  }
  eleventyConfig.addFilter("statNumber", function (v) {
    var p = parseStat(v);
    return p ? p.raw : (v || "");
  });
  eleventyConfig.addFilter("statUnit", function (v) {
    var p = parseStat(v);
    return p ? p.unit : "";
  });
  // Rapport entre deux valeurs saisies (ex: développé couché / poids de corps),
  // arrondi à 0,1 — chaîne vide si l'une des deux données manque.
  eleventyConfig.addFilter("statRatio", function (value, ref) {
    var a = parseStat(value), b = parseStat(ref);
    if (!a || !b || !(b.n > 0)) return "";
    return (a.n / b.n).toFixed(1).replace(".", ",");
  });

  // Miroir exact de isPartnerActive() dans partners.js — un partenaire
  // désactivé ou dont la date de fin est passée ne doit jamais être rendu,
  // y compris dans les pages où les partenaires sont affichés au build.
  eleventyConfig.addFilter("isPartnerActive", function (p) {
    if (!p || p.active === false) return false;
    if (p.expires) {
      var expiry = new Date(p.expires);
      if (!isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) return false;
    }
    return true;
  });

  // Miroir exact de buildPartnerUrl() dans partners.js (sans source_page/
  // placement, qui ne concernent que le tracking, pas l'URL elle-même).
  eleventyConfig.addFilter("partnerUrl", function (p) {
    if (!p || !p.url) return "#";
    if (p.utm === false) return p.url;
    try {
      var u = new URL(p.url);
      u.searchParams.set("utm_source", "blacktom");
      u.searchParams.set("utm_medium", "affiliate");
      u.searchParams.set("utm_campaign", p.slug);
      return u.toString();
    } catch (e) {
      return p.url;
    }
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
