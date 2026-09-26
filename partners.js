// Rendu des cartes partenaires + tracking des clics/copies, à partir de la
// source unique définie dans partners-data.js.
// trackEvent() est défini globalement dans app.js (chargé sur toutes les pages).

function getPartner(slug) {
  return (window.BLACKTOM_PARTNERS || []).find(function (p) { return p.slug === slug; });
}

function buildPartnerUrl(partner, sourcePage, placement) {
  if (!partner.url) return '#';
  if (partner.utm === false) return partner.url; // lien affilié prioritaire, jamais modifié
  try {
    var u = new URL(partner.url);
    u.searchParams.set('utm_source', 'blacktom');
    u.searchParams.set('utm_medium', 'affiliate');
    u.searchParams.set('utm_campaign', partner.slug);
    return u.toString();
  } catch (e) {
    return partner.url;
  }
}

function trackPartnerClick(slug, sourcePage, placement) {
  trackEvent('partner_click', { partner: slug, source_page: sourcePage, placement: placement });
}

function copyPromoCode(slug, code, btn, sourcePage) {
  var done = function () {
    trackEvent('promo_code_copy', { partner: slug, source_page: sourcePage });
    var original = btn.textContent;
    btn.textContent = 'Copié !';
    btn.disabled = true;
    setTimeout(function () { btn.textContent = original; btn.disabled = false; }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(done).catch(function () { fallbackCopy(code); done(); });
  } else {
    fallbackCopy(code);
    done();
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
}

function partnerCardHTML(p, sourcePage) {
  var logo = p.logo
    ? '<img src="' + p.logo + '" alt="' + p.name + '" loading="lazy" decoding="async" style="width:48px;height:48px;border-radius:12px;object-fit:cover;">'
    : '<div class="letter-mark">' + p.name.charAt(0) + '</div>';
  var desc = p.description ? '<p class="desc">' + p.description + '</p>' : '';
  var usage = p.usage ? '<div class="code-row"><span class="k">Ce que j’utilise</span></div><p style="margin:-8px 0 12px;font-size:13px;color:var(--dim);">' + p.usage + '</p>' : '';
  var offerRow = p.offer ? '<div class="code-row"><span class="k">Mon avantage</span><span class="v">' + p.offer + '</span></div>' : '';
  var codeRow = p.code ? '<div class="code-row"><span class="k">Code promo</span><span class="v">' + p.code + '</span></div>' : '';
  var url = buildPartnerUrl(p, sourcePage, 'partenaires_page');
  var copyBtn = p.code
    ? '<button type="button" class="btn btn-ghost btn-block" style="margin-bottom:8px;" onclick="copyPromoCode(\'' + p.slug + '\',\'' + p.code + '\',this,\'' + sourcePage + '\')">Copier le code</button>'
    : '';
  var voirBtn = '<a href="' + url + '" class="btn btn-primary btn-block" target="_blank" rel="noopener nofollow sponsored" onclick="trackPartnerClick(\'' + p.slug + '\',\'' + sourcePage + '\',\'partenaires_page\')">Voir chez ' + p.name + ' →</a>';
  var prozisLink = p.slug === 'prozis' ? '<div class="url-hint" style="margin-top:10px;"><a href="code-promo-prozis.html" style="color:var(--red);">Voir la page complète du code Prozis →</a></div>' : '';

  return '' +
    '<div class="pcard">' +
      '<div class="pcard-head">' + logo + '<div><div class="name">' + p.name + '</div><div class="tag">Lien affilié</div></div></div>' +
      desc + usage + offerRow + codeRow + copyBtn + voirBtn + prozisLink +
    '</div>';
}

document.addEventListener('DOMContentLoaded', function () {
  var active = (window.BLACKTOM_PARTNERS || []).filter(function (p) { return p.active !== false; });

  var list = document.getElementById('partners-list');
  if (list) {
    var sourcePage = list.getAttribute('data-source-page') || 'partenaires';
    list.innerHTML = active.map(function (p) { return partnerCardHTML(p, sourcePage); }).join('');
  }

  var logos = document.getElementById('partners-logos');
  if (logos) {
    logos.innerHTML = active.map(function (p) {
      return p.logo
        ? '<img src="' + p.logo + '" alt="' + p.name + '" loading="lazy" decoding="async" style="width:40px;height:40px;border-radius:10px;object-fit:cover;">'
        : '<div class="letter-mark" style="width:40px;height:40px;font-size:16px;">' + p.name.charAt(0) + '</div>';
    }).join('');
  }
});
