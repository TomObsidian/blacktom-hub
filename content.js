// Rendu de l'architecture de contenu (catégories + contenus publiés),
// à partir de la source unique éditable dans BLACKTOM Admin : data/content.json.
// N'affiche que les contenus réellement publiés (jamais de liste "à venir" ni
// de message d'excuse) : une catégorie sans article publié n'affiche
// simplement rien ici, la section correspondante est masquée ci-dessous.

window.BLACKTOM_CONTENT_READY = fetch('/data/content.json')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    window.BLACKTOM_CONTENT = data.content || [];
    window.BLACKTOM_CATEGORIES = data.categories || [];
    return data;
  });

function categoryContentHTML(slug) {
  var items = (window.BLACKTOM_CONTENT || []).filter(function (c) {
    return c.category === slug && c.status === 'published' && c.url;
  });
  return items.map(function (c) {
    return '<a class="content-row" href="' + c.url + '">' + c.title + '</a>';
  }).join('');
}

// Variante utilisée par les hubs (ex. /developpe-couche) pour une section
// "Guides" qui ne doit lister QUE des articles réellement publiés — pas les
// outils (Bench Lab a déjà sa propre section dédiée sur ces pages) ni les
// pages commerciales, pour éviter la redite.
function articleListHTML(slug) {
  var items = (window.BLACKTOM_CONTENT || []).filter(function (c) {
    return c.category === slug && c.type === 'article' && c.status === 'published' && c.url;
  });
  return items.map(function (c) {
    return '<a class="content-row" href="' + c.url + '">' + c.title + '</a>';
  }).join('');
}

function hideEmptyContentBlock(el, html) {
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
}

document.addEventListener('DOMContentLoaded', function () {
  window.BLACKTOM_CONTENT_READY.then(function () {
    document.querySelectorAll('[data-content-category]').forEach(function (el) {
      hideEmptyContentBlock(el, categoryContentHTML(el.getAttribute('data-content-category')));
    });

    document.querySelectorAll('[data-guides-category]').forEach(function (el) {
      hideEmptyContentBlock(el, articleListHTML(el.getAttribute('data-guides-category')));
    });

    var grid = document.getElementById('category-grid');
    if (grid) {
      grid.innerHTML = (window.BLACKTOM_CATEGORIES || []).map(function (c) {
        return '' +
          '<a class="pcard" href="' + c.slug + '">' +
            '<div class="pcard-head"><div class="letter-mark">' + c.name.charAt(0) + '</div><div><div class="name">' + c.name + '</div><div class="tag">Catégorie</div></div></div>' +
            '<p class="desc">' + c.tagline + '</p>' +
          '</a>';
      }).join('');
    }
  });
});
