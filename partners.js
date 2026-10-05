// Rendu des cartes partenaires + tracking des clics/copies, à partir de la
// source unique éditable dans BLACKTOM Admin : data/partners.json.
// trackEvent() est défini globalement dans app.js (chargé sur toutes les pages).

window.BLACKTOM_PARTNERS_READY = fetch('/data/partners.json')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    window.BLACKTOM_PARTNERS = data.partners || [];
    return window.BLACKTOM_PARTNERS;
  });

function getPartner(slug) {
  return (window.BLACKTOM_PARTNERS || []).find(function (p) { return p.slug === slug; });
}

// Un partenaire reste dans les données même arrêté (historique, SEO) mais ne
// doit plus jamais afficher un code ou un CTA comme valides une fois désactivé
// ou expiré : c'est cette fonction qui doit être utilisée partout, pas p.active
// seul.
function isPartnerActive(p) {
  if (!p || p.active === false) return false;
  if (p.expires) {
    var expiry = new Date(p.expires);
    if (!isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) return false;
  }
  return true;
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

function trackPartnerClick(slug, sourcePage, placement, extra) {
  var params = { partner: slug, source_page: sourcePage, placement: placement, cta_type: 'affiliate_link' };
  if (extra) { for (var k in extra) { if (extra[k] != null) params[k] = extra[k]; } }
  trackEvent('partner_click', params);
}

function copyPromoCode(slug, code, btn, sourcePage, placement) {
  var done = function () {
    trackEvent('promo_code_copy', { partner: slug, promo_code: code, source_page: sourcePage, placement: placement || 'unknown' });
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
    ? '<img src="' + p.logo + '" alt="' + p.name + '" width="144" height="48" loading="lazy" decoding="async">'
    : '<div class="letter-mark">' + p.name.charAt(0) + '</div>';
  var tag = p.category || 'Lien affilié';
  var desc = p.description ? '<p class="desc">' + p.description + '</p>' : '';
  var usage = p.usage ? '<p class="usage"><span class="k">Ce que j’utilise</span>' + p.usage + '</p>' : '';
  var offerRow = p.offer ? '<div class="code-row"><span class="k">Mon avantage</span><span class="v">' + p.offer + '</span></div>' : '';
  var codeRow = p.code ? '<div class="code-row"><span class="k">Code promo</span><span class="v">' + p.code + '</span></div>' : '';
  var url = buildPartnerUrl(p, sourcePage, 'partenaires_page');
  var copyBtn = p.code
    ? '<button type="button" class="btn btn-ghost btn-block" onclick="copyPromoCode(\'' + p.slug + '\',\'' + p.code + '\',this,\'' + sourcePage + '\',\'partenaires_page\')">Copier le code</button>'
    : '';
  var voirBtn = '<a href="' + url + '" class="btn btn-primary btn-block" target="_blank" rel="noopener nofollow sponsored" onclick="trackPartnerClick(\'' + p.slug + '\',\'' + sourcePage + '\',\'partenaires_page\')">Voir chez ' + p.name + '</a>';
  var prozisLink = p.slug === 'prozis' ? '<a class="pc-more" href="/code-promo-prozis">Voir la page complète du code Prozis</a>' : '';

  return '' +
    '<div class="pcard">' +
      '<div class="pcard-head">' + logo + '<div><div class="name' + (p.logo ? ' sr-only' : '') + '">' + p.name + '</div><div class="tag">' + tag + '</div></div></div>' +
      '<div class="pc-body">' + desc + usage + offerRow + codeRow + '</div>' +
      '<div class="pc-actions">' + copyBtn + voirBtn + prozisLink + '</div>' +
    '</div>';
}

document.addEventListener('DOMContentLoaded', function () {
  window.BLACKTOM_PARTNERS_READY.then(function () {
    var active = (window.BLACKTOM_PARTNERS || []).filter(isPartnerActive);

    var list = document.getElementById('partners-list');
    if (list) {
      var sourcePage = list.getAttribute('data-source-page') || 'partenaires';
      list.innerHTML = active.map(function (p) { return partnerCardHTML(p, sourcePage); }).join('');
    }

    var logos = document.getElementById('partners-logos');
    if (logos) {
      logos.innerHTML = active.map(function (p) {
        return p.logo
          ? '<img src="' + p.logo + '" alt="' + p.name + '" width="40" height="40" loading="lazy" decoding="async" style="width:40px;height:40px;border-radius:2px;object-fit:cover;">'
          : '<div class="letter-mark" style="width:40px;height:40px;font-size:16px;">' + p.name.charAt(0) + '</div>';
      }).join('');
    }
  });
});
