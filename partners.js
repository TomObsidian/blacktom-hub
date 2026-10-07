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

// ───────── Offres partenaires : composants .offre, .bons-plans et barre collante ─────────
// Le HTML contient déjà l'offre (rendu au build par partenaires.njk, ou collé en
// statique dans un article) : Google la lit sans JavaScript. Ce code ne fait que
//   1. rafraîchir code / lien / expiration depuis data/partners.json,
//   2. copier le code et mesurer les clics (mêmes événements que le reste du site),
//   3. afficher la barre collante sur les pages qui l'activent (data-offer-bar="slug").
// Un partenaire arrêté ou expiré ne montre jamais un code comme valide.

function offerSource(el) {
  var h = el.closest ? el.closest('[data-source-page]') : null;
  if (h) return h.getAttribute('data-source-page');
  var b = document.body.getAttribute('data-source-page');
  return b || (location.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home');
}

function copyOfferCode(btn) {
  var code = btn.getAttribute('data-copy');
  if (!code) return;
  var slug = btn.getAttribute('data-partner') || '';
  var placement = btn.getAttribute('data-placement') || 'offer';
  var scope = (btn.closest && btn.closest('[data-offer],.offre-bar')) || btn.parentNode;
  var status = scope ? scope.querySelector('[data-copy-status]') : null;
  var label = btn.querySelector('.offre-copy');
  var done = function () {
    trackEvent('promo_code_copy', { partner: slug, promo_code: code, source_page: offerSource(btn), placement: placement });
    btn.setAttribute('data-state', 'copied');
    if (label) label.textContent = 'Copié';
    if (status) status.textContent = 'Code ' + code + ' copié';
    setTimeout(function () {
      btn.removeAttribute('data-state');
      if (label) label.textContent = 'Copier';
      if (status) status.textContent = '';
    }, 1800);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(done).catch(function () { fallbackCopy(code); done(); });
  } else {
    fallbackCopy(code);
    done();
  }
}

document.addEventListener('click', function (ev) {
  var copy = ev.target.closest && ev.target.closest('[data-copy]');
  if (copy) { copyOfferCode(copy); return; }
  var link = ev.target.closest && ev.target.closest('a[data-partner-link]');
  if (link) {
    trackPartnerClick(link.getAttribute('data-partner-link'), offerSource(link), link.getAttribute('data-placement') || 'offer');
  }
});

function hydrateOffers() {
  document.querySelectorAll('[data-offer]').forEach(function (el) {
    var p = getPartner(el.getAttribute('data-offer'));
    var inTable = el.tagName === 'TR';
    if (!p || !isPartnerActive(p)) {
      if (inTable) { el.hidden = true; return; }
      el.classList.add('is-off');
      el.innerHTML = '<p class="offre-off">Ce partenariat n’est plus actif pour le moment.</p>';
      return;
    }
    el.querySelectorAll('[data-copy]').forEach(function (b) {
      if (!p.code) { b.hidden = true; return; }
      b.setAttribute('data-copy', p.code);
      var v = b.querySelector('.offre-code-v');
      if (v) v.textContent = p.code;
    });
    el.querySelectorAll('a[data-partner-link]').forEach(function (a) {
      a.href = buildPartnerUrl(p, offerSource(a), a.getAttribute('data-placement') || 'offer');
    });
  });
  var tables = document.querySelectorAll('.bons-plans');
  tables.forEach(function (t) { t.setAttribute('data-hydrated', ''); });
}

function initOfferBar() {
  var host = document.querySelector('[data-offer-bar]');
  if (!host) return;
  var p = getPartner(host.getAttribute('data-offer-bar'));
  if (!p || !isPartnerActive(p) || !p.code) return;
  try { if (sessionStorage.getItem('offre-bar-off') === '1') return; } catch (e) {}

  var m = String(p.offer || '').match(/^\s*[-−–]?\s*(\d+(?:[.,]\d+)?)\s*(%|€)?\s*$/);
  var lead = m ? ('−' + m[1].replace('.', ',') + (m[2] === '€' ? ' €' : ' %')) : (p.offer || 'Mon code');
  var source = offerSource(host);

  var bar = document.createElement('div');
  bar.className = 'offre-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Code promo ' + p.name);
  bar.setAttribute('data-source-page', source);
  bar.innerHTML =
    '<p class="offre-bar-t"><b>' + lead + '</b> chez ' + p.name + '</p>' +
    '<div class="offre-bar-act">' +
      '<button type="button" class="offre-code sm" data-copy="' + p.code + '" data-partner="' + p.slug + '" data-placement="sticky_bar" aria-label="Copier le code ' + p.code + ' (' + p.name + ')"><span class="offre-code-v">' + p.code + '</span><span class="offre-copy" aria-hidden="true">Copier</span></button>' +
      '<a class="offre-bar-go" href="' + buildPartnerUrl(p, source, 'sticky_bar') + '" target="_blank" rel="noopener nofollow sponsored" data-partner-link="' + p.slug + '" data-placement="sticky_bar">Voir<span class="sr-only"> l’offre ' + p.name + ' (lien affilié, nouvel onglet)</span></a>' +
      '<button type="button" class="offre-bar-x" aria-label="Fermer la barre du code promo">×</button>' +
    '</div>' +
    '<span class="sr-only" role="status" data-copy-status></span>';
  document.body.appendChild(bar);
  document.body.classList.add('has-offre-bar');

  var inlineVisible = false;
  var passed = false;
  var dismissed = false;
  var update = function () {
    var on = passed && !inlineVisible && !dismissed;
    bar.classList.toggle('on', on);
  };
  var onScroll = function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    passed = max > 0 && (window.scrollY / max) > 0.3;
    update();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { inlineVisible = e.isIntersecting; });
      // une offre est-elle encore à l'écran ?
      inlineVisible = Array.prototype.some.call(document.querySelectorAll('main [data-offer]:not(tr), main [data-offer-zone]'), function (n) {
        var r = n.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
      });
      update();
    }, { threshold: [0, 0.01] });
    document.querySelectorAll('main [data-offer]:not(tr), main [data-offer-zone]').forEach(function (n) { io.observe(n); });
  }

  bar.querySelector('.offre-bar-x').addEventListener('click', function () {
    dismissed = true;
    document.body.classList.remove('has-offre-bar');
    try { sessionStorage.setItem('offre-bar-off', '1'); } catch (e) {}
    update();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  window.BLACKTOM_PARTNERS_READY.then(function () {
    hydrateOffers();
    initOfferBar();
  });
});
