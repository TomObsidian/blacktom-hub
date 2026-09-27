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
