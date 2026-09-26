// Rendu de l'architecture de contenu (catégories + contenus publiés),
// à partir de la source unique définie dans content-data.js.
// N'affiche que les contenus réellement publiés (jamais de liste "à venir" ni
// de message d'excuse) : une catégorie sans article publié n'affiche
// simplement rien ici, la section correspondante est masquée ci-dessous.
function categoryContentHTML(slug) {
  var items = (window.BLACKTOM_CONTENT || []).filter(function (c) {
    return c.category === slug && c.status === 'published' && c.url;
  });
  return items.map(function (c) {
    return '<a class="content-row" href="' + c.url + '">' + c.title + ' <span>→</span></a>';
  }).join('');
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-content-category]').forEach(function (el) {
    var html = categoryContentHTML(el.getAttribute('data-content-category'));
    el.innerHTML = html;
    if (!html) {
      var prev = el.previousElementSibling;
      var hasEyebrow = prev && prev.classList.contains('section-eyebrow');
      var section = el.closest('.hub-section');
      var sectionHasOnlyThis = section && section.children.length === (hasEyebrow ? 2 : 1);
      if (sectionHasOnlyThis) {
        section.style.display = 'none';
      } else {
        el.style.display = 'none';
        if (hasEyebrow) prev.style.display = 'none';
      }
    }
  });

  var grid = document.getElementById('category-grid');
  if (grid) {
    grid.innerHTML = (window.BLACKTOM_CATEGORIES || []).map(function (c) {
      return '' +
        '<a class="pcard" href="' + c.slug + '.html">' +
          '<div class="pcard-head"><div class="letter-mark">' + c.name.charAt(0) + '</div><div><div class="name">' + c.name + '</div><div class="tag">Catégorie</div></div></div>' +
          '<p class="desc">' + c.tagline + '</p>' +
        '</a>';
    }).join('');
  }
});
