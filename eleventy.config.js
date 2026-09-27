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

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
