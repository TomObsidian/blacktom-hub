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
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

  eleventyConfig.setTemplateFormats(["njk"]);

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
