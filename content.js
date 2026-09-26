// Rendu de l'architecture de contenu (catégories + contenus à venir),
// à partir de la source unique définie dans content-data.js.

function categoryContentHTML(slug) {
  var items = (window.BLACKTOM_CONTENT || []).filter(function (c) { return c.category === slug; });
  if (!items.length) {
    return '<p style="font-size:14px;color:var(--dim);">Les premiers contenus de cette catégorie sont en cours de sélection — rien n’est publié pour l’instant.</p>';
  }
  return items.map(function (c) {
    if (c.status === 'published' && c.url) {
      return '<a class="content-row" href="' + c.url + '">' + c.title + ' <span>→</span></a>';
    }
    return '<div class="content-row content-row-pending">' + c.title + '<span class="content-pending">À venir</span></div>';
  }).join('');
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-content-category]').forEach(function (el) {
    el.innerHTML = categoryContentHTML(el.getAttribute('data-content-category'));
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
