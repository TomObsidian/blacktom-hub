// Rendu de la page /complements à partir de la source unique éditable dans
// BLACKTOM Admin : data/supplements.json. Compact par design : une ligne par
// complément, pas de grosse carte — la page doit rester consultable
// rapidement sur mobile.

window.BLACKTOM_SUPPLEMENTS_READY = fetch('/data/supplements.json')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    window.BLACKTOM_SUPPLEMENTS = data.supplements || [];
    window.BLACKTOM_SUPPLEMENT_CATEGORIES = data.categories || [];
    return data;
  });

function suppRowHTML(s) {
  var metaHTML = '';
  var metaParts = [];
  if (s.dose) metaParts.push(s.dose);
  if (s.timing) metaParts.push(s.timing);
  if (metaParts.length) metaHTML = '<span class="supp-meta">' + metaParts.join(' · ') + '</span>';

  var noteHTML = s.note ? '<span class="supp-note">' + s.note + '</span>' : '';
  var nameHTML = s.articleUrl
    ? '<a class="supp-name-link" href="' + s.articleUrl + '">' + s.name + '</a>'
    : s.name;

  var desc = '';
  if (s.general) desc += '<p class="supp-desc">' + s.general + '</p>';
  if (s.personal) desc += '<p class="supp-desc supp-personal"><strong>Mon utilisation :</strong> ' + s.personal + '</p>';
  if (s.articleUrl && s.articleLinkText) desc += '<p class="supp-desc"><a href="' + s.articleUrl + '" style="color:var(--red-text);">' + s.articleLinkText + '</a></p>';

  var productLine = '';
  if (s.brand || s.product) {
    productLine = '<p class="supp-desc" style="color:var(--dim2);">' + [s.brand, s.product].filter(Boolean).join(' — ') + '</p>';
  }

  var cta = '';
  if (s.affiliateUrl) {
    cta = '<div class="supp-cta">' +
      '<a href="' + s.affiliateUrl + '" target="_blank" rel="noopener nofollow sponsored" class="btn btn-ghost" onclick="trackEvent(\'partner_click\',{partner:\'' + (s.partnerSlug || s.slug) + '\',source_page:\'complements\',placement:\'supplement_row\'})">Voir le produit →</a>' +
      (s.promoCode ? '<span class="supp-code">Code : ' + s.promoCode + '</span>' : '') +
      '</div>';
  }

  return '<div class="supp-row">' +
    '<div class="supp-head"><span class="supp-name">' + nameHTML + '</span>' + metaHTML + noteHTML + '</div>' +
    desc + productLine + cta +
    '</div>';
}

document.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('supp-list');
  if (!container) return;

  window.BLACKTOM_SUPPLEMENTS_READY.then(function () {
    var supplements = (window.BLACKTOM_SUPPLEMENTS || []).filter(function (s) { return s.active !== false; });
    var categories = window.BLACKTOM_SUPPLEMENT_CATEGORIES || [];

    container.innerHTML = categories.map(function (cat) {
      var items = supplements
        .filter(function (s) { return s.category === cat.slug; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      if (!items.length) return '';
      return '<section class="hub-section" style="padding-top:40px;">' +
        '<p class="section-eyebrow">' + cat.name + '</p>' +
        items.map(suppRowHTML).join('') +
        '</section>';
    }).join('');
  });
});
