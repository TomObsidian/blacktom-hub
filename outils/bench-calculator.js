// BLACKTOM BENCH LAB — 1RM développé couché, force relative, objectif,
// pourcentages, échauffement et chargement de barre.
// Tout le calcul est fait côté client : aucune donnée n'est envoyée à un
// serveur, aucune API, aucune base de données, aucun compte.
//
// Formule 1RM principale : Epley — 1RM = charge x (1 + reps / 30).
// Justification détaillée dans la page. À 1 répétition, la charge saisie
// EST le 1RM (pas de formule appliquée).

var CALC_PERCENTAGES = [100, 95, 90, 85, 80, 75, 70, 65, 60, 50];
var CALC_BAR_WEIGHT_DEFAULT = 20;

// Progression d'échauffement : pourcentages de la charge cible + répétitions
// décroissantes à mesure que la charge augmente, pour limiter la fatigue
// avant la tentative. La barre à vide n'est incluse que si elle représente
// moins de la moitié de la charge cible (sinon elle n'a pas de sens comme
// "échauffement" séparé). Schéma courant en préparation physique, pas une
// prescription individualisée.
var CALC_WARMUP_STEPS = [
  { pct: 0.40, reps: 5 },
  { pct: 0.55, reps: 3 },
  { pct: 0.70, reps: 2 },
  { pct: 0.80, reps: 1 },
  { pct: 0.90, reps: 1 }
];

function calcParseNumber(raw) {
  if (typeof raw !== 'string') return NaN;
  var normalized = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return NaN;
  return parseFloat(normalized);
}

function calcRoundToStep(value, step) {
  return Math.round(value / step) * step;
}

function calcFormatKg(value) {
  // Jusqu'à 2 décimales seulement si nécessaire (disques 1,25 kg / 0,25 kg) :
  // arrondir directement à 1 décimale ferait afficher "1,3 kg" pour un
  // disque de 1,25 kg, ce qui ne correspond à aucun disque réel.
  var rounded2 = Math.round(value * 100) / 100;
  var decimals = 0;
  if (Math.abs(rounded2 - Math.round(rounded2)) > 0.001) {
    var rounded1 = Math.round(value * 10) / 10;
    decimals = Math.abs(rounded2 - rounded1) > 0.001 ? 2 : 1;
  }
  return rounded2.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + ' kg';
}

function calcEstimate1RM(weight, reps) {
  if (reps <= 1) return weight;
  return weight * (1 + reps / 30);
}

function calcBuildTable(oneRM, step) {
  return CALC_PERCENTAGES.map(function (pct) {
    var exact = oneRM * pct / 100;
    return { pct: pct, exact: exact, rounded: calcRoundToStep(exact, step) };
  });
}

// Échauffement progressif jusqu'à une charge cible. Retourne une liste
// {weight, reps} en kg arrondis à 2,5 kg, en partant de la barre à vide si
// pertinent, sans doublon de charge, terminée par la charge cible elle-même.
function calcWarmupSteps(target, barWeight) {
  var rows = [];
  if (barWeight < target * 0.5) {
    rows.push({ weight: barWeight, reps: 10, isTarget: false });
  }
  CALC_WARMUP_STEPS.forEach(function (s) {
    var w = calcRoundToStep(target * s.pct, 2.5);
    if (w > barWeight && w < target) {
      if (!rows.length || rows[rows.length - 1].weight !== w) {
        rows.push({ weight: w, reps: s.reps, isTarget: false });
      }
    }
  });
  rows.push({ weight: calcRoundToStep(target, 2.5), reps: 1, isTarget: true });
  return rows;
}

// Dessin de la barre chargée (de face, symétrique). Hauteurs et épaisseurs
// suivent la taille réelle des disques ; seul le 25 kg est en rouge disque.
function calcBarbellSVG(plates, label) {
  var heights = { 25: 122, 20: 112, 15: 92, 10: 72, 5: 56, 2.5: 44, 1.25: 36, 0.5: 30, 0.25: 26 };
  var widths = { 25: 22, 20: 20, 15: 18, 10: 16, 5: 12, 2.5: 10, 1.25: 8, 0.5: 6, 0.25: 5 };
  var gap = 3;
  var total = plates.reduce(function (sum, p) { return sum + (widths[p] || 6) + gap; }, 0);
  var room = 104;
  var k = total > room ? room / total : 1;
  var cx = 280;
  var flange = 120; // distance du centre au rebord de la manchette
  var left = '';
  var right = '';
  var offset = 0;
  plates.forEach(function (p) {
    var w = Math.max(3, (widths[p] || 6) * k);
    var h = heights[p] || 26;
    var y = 75 - h / 2;
    var cls = p === 25 ? 'pl-red' : (p >= 10 ? 'pl-d' : 'pl-l');
    var xl = cx - flange - offset - w;
    var xr = cx + flange + offset;
    left += '<rect class="' + cls + '" x="' + xl.toFixed(1) + '" y="' + y + '" width="' + w.toFixed(1) + '" height="' + h + '"/>';
    right += '<rect class="' + cls + '" x="' + xr.toFixed(1) + '" y="' + y + '" width="' + w.toFixed(1) + '" height="' + h + '"/>';
    offset += w + gap * k;
  });
  return '<figure class="bar-fig"><svg viewBox="0 0 560 150" role="img" aria-label="' + label + '">' +
    '<rect x="0" y="69" width="560" height="12" fill="currentColor"/>' +
    '<rect x="' + (cx - flange - 6) + '" y="53" width="6" height="44" fill="currentColor"/>' +
    '<rect x="' + (cx + flange) + '" y="53" width="6" height="44" fill="currentColor"/>' +
    left + right + '</svg></figure>';
}

// Répartition des disques nécessaires DE CHAQUE CÔTÉ pour atteindre une
// charge totale, à partir des disques cochés comme disponibles. Approche
// gloutonne (du plus grand disque au plus petit) : fonctionne correctement
// avec les jeux de disques standards (25/20/15/10/5/2,5/1,25/0,5/0,25 kg),
// en supposant au moins deux disques de chaque valeur cochée disponibles.
function calcPlateBreakdown(total, barWeight, availablePlates) {
  var perSide = (total - barWeight) / 2;
  if (perSide < 0) return { error: 'bar' };
  var sorted = availablePlates.slice().sort(function (a, b) { return b - a; });
  if (!sorted.length) return { error: 'no-plates' };

  var remainingCents = Math.round(perSide * 100);
  var used = [];
  sorted.forEach(function (p) {
    var pCents = Math.round(p * 100);
    while (pCents > 0 && remainingCents >= pCents) {
      used.push(p);
      remainingCents -= pCents;
    }
  });
  var achievedPerSide = used.reduce(function (s, p) { return s + p; }, 0);
  var achievedTotal = barWeight + achievedPerSide * 2;
  var exact = remainingCents === 0;

  var result = { perSide: achievedPerSide, plates: used, achievedTotal: achievedTotal, exact: exact };
  if (!exact) {
    var smallest = sorted[sorted.length - 1];
    result.below = achievedTotal;
    result.above = achievedTotal + smallest * 2;
  }
  return result;
}

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('calc-form');
  if (!form) return;

  var els = {
    bodyweight: document.getElementById('calc-bodyweight'),
    load: document.getElementById('calc-load'),
    reps: document.getElementById('calc-reps'),
    goal: document.getElementById('calc-goal'),
    step: document.getElementById('calc-step'),
    repType: form.querySelectorAll('input[name="calc-rep-type"]'),
    errBodyweight: document.getElementById('calc-err-bodyweight'),
    errLoad: document.getElementById('calc-err-load'),
    errGoal: document.getElementById('calc-err-goal'),
    results: document.getElementById('calc-results'),
    oneRmMain: document.getElementById('calc-1rm-main'),
    oneRmRaw: document.getElementById('calc-1rm-raw'),
    ratio: document.getElementById('calc-ratio'),
    reliabilityNote: document.getElementById('calc-reliability-note'),
    tableBody: document.getElementById('calc-table-body'),
    goalResult: document.getElementById('calc-goal-result'),
    goalTarget: document.getElementById('goal-target'),
    goalCurrent: document.getElementById('goal-current'),
    goalGap: document.getElementById('goal-gap'),
    goalRatioRow: document.getElementById('goal-ratio-row'),
    goalRatio: document.getElementById('goal-ratio'),
    cardWeight: document.getElementById('card-weight'),
    cardPerf: document.getElementById('card-perf'),
    cardOneRm: document.getElementById('card-1rm'),
    cardRatio: document.getElementById('card-ratio'),
    cardRepType: document.getElementById('card-rep-type'),
    downloadBtn: document.getElementById('calc-download'),
    shareBtn: document.getElementById('calc-share'),
    resetBtn: document.getElementById('calc-reset'),
    canvas: document.getElementById('calc-canvas')
  };

  var lastResult = null;

  function setError(input, errEl, message) {
    if (message) {
      errEl.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    } else {
      errEl.textContent = '';
      input.removeAttribute('aria-invalid');
    }
  }

  function getRepType() {
    for (var i = 0; i < els.repType.length; i++) {
      if (els.repType[i].checked) return els.repType[i].value;
    }
    return 'touch-and-go';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var bodyweight = calcParseNumber(els.bodyweight.value);
    var load = calcParseNumber(els.load.value);
    var reps = parseInt(els.reps.value, 10);
    var step = parseFloat(els.step.value);
    var goalRaw = els.goal.value.trim();
    var goal = goalRaw === '' ? null : calcParseNumber(goalRaw);

    var hasError = false;
    if (isNaN(bodyweight) || bodyweight <= 0 || bodyweight > 400) {
      setError(els.bodyweight, els.errBodyweight, 'Entre un poids de corps valide (entre 1 et 400 kg).');
      hasError = true;
    } else {
      setError(els.bodyweight, els.errBodyweight, '');
    }
    if (isNaN(load) || load <= 0 || load > 500) {
      setError(els.load, els.errLoad, 'Entre une charge valide, supérieure à 0 kg.');
      hasError = true;
    } else {
      setError(els.load, els.errLoad, '');
    }
    if (goalRaw !== '' && (isNaN(goal) || goal <= 0 || goal > 500)) {
      setError(els.goal, els.errGoal, 'Entre un objectif valide, ou laisse ce champ vide.');
      hasError = true;
    } else {
      setError(els.goal, els.errGoal, '');
    }
    if (hasError) {
      els.results.hidden = true;
      return;
    }

    var oneRM = calcEstimate1RM(load, reps);
    var oneRMRounded = calcRoundToStep(oneRM, step);
    var ratio = oneRM / bodyweight;
    var repTypeValue = getRepType();
    var repTypeLabel = repTypeValue === 'pause' ? 'Pause compétition' : 'Touch & Go';

    lastResult = {
      bodyweight: bodyweight, load: load, reps: reps, step: step,
      oneRM: oneRM, oneRMRounded: oneRMRounded, ratio: ratio, repTypeLabel: repTypeLabel
    };

    els.oneRmMain.textContent = calcFormatKg(oneRMRounded);
    els.oneRmRaw.textContent = reps <= 1
      ? 'Charge déclarée directement comme 1RM (1 répétition).'
      : 'Valeur brute estimée : ' + calcFormatKg(Math.round(oneRM * 10) / 10) + '.';
    els.ratio.textContent = ratio.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '× ton poids de corps';
    els.reliabilityNote.hidden = reps <= 10;

    var rows = calcBuildTable(oneRM, step);
    els.tableBody.innerHTML = rows.map(function (r) {
      return '<tr><td>' + r.pct + ' %</td><td>' + calcFormatKg(Math.round(r.exact * 10) / 10) + '</td><td><strong>' + calcFormatKg(r.rounded) + '</strong></td></tr>';
    }).join('');

    // Objectif (optionnel)
    if (goal !== null) {
      var gap = goal - oneRMRounded;
      els.goalTarget.textContent = calcFormatKg(goal);
      els.goalCurrent.textContent = calcFormatKg(oneRMRounded);
      els.goalGap.textContent = gap > 0 ? '+' + calcFormatKg(gap) + ' à gagner' : 'Objectif déjà atteint (dépassé de ' + calcFormatKg(Math.abs(gap)) + ')';
      var goalRatio = goal / bodyweight;
      els.goalRatio.textContent = goalRatio.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '× ton poids de corps';
      els.goalResult.hidden = false;
    } else {
      els.goalResult.hidden = true;
    }

    els.cardWeight.textContent = calcFormatKg(bodyweight);
    els.cardPerf.textContent = reps <= 1 ? calcFormatKg(load) + ' × 1' : calcFormatKg(load) + ' × ' + reps;
    els.cardOneRm.textContent = calcFormatKg(oneRMRounded);
    els.cardRatio.textContent = ratio.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '× PDC';
    els.cardRepType.textContent = repTypeLabel;

    els.results.hidden = false;
    els.results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Pré-remplit l'échauffement avec l'objectif (ou le 1RM estimé à défaut),
    // sans écraser une valeur déjà saisie par l'utilisateur.
    var warmupTargetInput = document.getElementById('warmup-target');
    if (warmupTargetInput && !warmupTargetInput.value) {
      warmupTargetInput.value = String(goal !== null ? calcRoundToStep(goal, 2.5) : oneRMRounded);
    }

    if (typeof trackEvent === 'function') {
      trackEvent('calculator_use', { calculator: 'bench_1rm' });
    }
  });

  els.resetBtn.addEventListener('click', function () {
    form.reset();
    els.results.hidden = true;
    setError(els.bodyweight, els.errBodyweight, '');
    setError(els.load, els.errLoad, '');
    setError(els.goal, els.errGoal, '');
    lastResult = null;
    els.bodyweight.focus();
  });

  // ---- Échauffement ----
  var warmupForm = document.getElementById('warmup-form');
  if (warmupForm) {
    var warmupTarget = document.getElementById('warmup-target');
    var warmupErr = document.getElementById('warmup-err');
    var warmupResult = document.getElementById('warmup-result');
    var warmupSteps = document.getElementById('warmup-steps');

    warmupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var target = calcParseNumber(warmupTarget.value);
      if (isNaN(target) || target <= CALC_BAR_WEIGHT_DEFAULT || target > 500) {
        warmupErr.textContent = 'Entre une charge cible valide, supérieure au poids de la barre (' + CALC_BAR_WEIGHT_DEFAULT + ' kg).';
        warmupTarget.setAttribute('aria-invalid', 'true');
        warmupResult.hidden = true;
        return;
      }
      warmupErr.textContent = '';
      warmupTarget.removeAttribute('aria-invalid');

      var steps = calcWarmupSteps(target, CALC_BAR_WEIGHT_DEFAULT);
      warmupSteps.innerHTML = steps.map(function (s) {
        return '<div class="warmup-row' + (s.isTarget ? ' warmup-target-row' : '') + '">' +
          '<span>' + (s.isTarget ? '→ ' : '') + calcFormatKg(s.weight) + '</span>' +
          '<span class="r">× ' + s.reps + '</span>' +
        '</div>';
      }).join('');
      warmupResult.hidden = false;

      if (typeof trackEvent === 'function') trackEvent('calculator_use', { calculator: 'bench_1rm', module: 'warmup' });
    });
  }

  // ---- Chargement de barre ----
  var platesForm = document.getElementById('plates-form');
  if (platesForm) {
    var platesBar = document.getElementById('plates-bar');
    var platesTotal = document.getElementById('plates-total');
    var platesErr = document.getElementById('plates-err');
    var platesResult = document.getElementById('plates-result');

    platesForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var bar = calcParseNumber(platesBar.value);
      var total = calcParseNumber(platesTotal.value);
      var checked = Array.prototype.slice.call(platesForm.querySelectorAll('input[type="checkbox"]:checked'))
        .map(function (cb) { return parseFloat(cb.value); });

      if (isNaN(bar) || bar <= 0 || bar > 50) {
        platesErr.textContent = 'Entre un poids de barre valide.';
        platesResult.hidden = true;
        return;
      }
      if (isNaN(total) || total <= 0 || total > 500) {
        platesErr.textContent = 'Entre une charge totale valide.';
        platesResult.hidden = true;
        return;
      }
      if (!checked.length) {
        platesErr.textContent = 'Coche au moins un disque disponible.';
        platesResult.hidden = true;
        return;
      }

      var res = calcPlateBreakdown(total, bar, checked);
      platesErr.textContent = '';

      if (res.error === 'bar') {
        platesErr.textContent = 'La charge totale doit être supérieure au poids de la barre.';
        platesResult.hidden = true;
        return;
      }

      var platesHTML = res.plates.length
        ? res.plates.map(function (p) { return '<span class="chip">' + calcFormatKg(p) + '</span>'; }).join('')
        : '<span class="chip">Aucun disque (barre seule)</span>';

      var barLabel = res.plates.length
        ? 'Barre chargée, de chaque côté : ' + res.plates.map(function (p) { return calcFormatKg(p); }).join(', ')
        : 'Barre seule, sans disque';
      var html = calcBarbellSVG(res.plates, barLabel) +
        '<p style="font-size:13px;color:var(--dim2);margin:0 0 8px;">Par côté :</p>' +
        '<div class="plates-side">' + platesHTML + '</div>';

      if (res.exact) {
        html += '<p style="margin-top:14px;font-size:14px;color:var(--dim);">Charge obtenue : <strong style="color:var(--wht);">' + calcFormatKg(res.achievedTotal) + '</strong></p>';
      } else {
        html += '<p style="margin-top:14px;font-size:13px;color:var(--dim2);">Cette charge exacte n’est pas réalisable avec les disques cochés.</p>' +
          '<p style="font-size:14px;color:var(--dim);">Le plus proche en dessous : <strong style="color:var(--wht);">' + calcFormatKg(res.below) + '</strong> · au-dessus : <strong style="color:var(--wht);">' + calcFormatKg(res.above) + '</strong></p>';
      }

      platesResult.innerHTML = html;
      platesResult.hidden = false;

      if (typeof trackEvent === 'function') trackEvent('calculator_use', { calculator: 'bench_1rm', module: 'plates' });
    });
  }

  // Carte partageable — dessinée en canvas uniquement au moment du
  // téléchargement/partage (pas de rendu permanent inutile).
  function drawCard() {
    var c = els.canvas;
    var ctx = c.getContext('2d');
    var W = c.width, H = c.height;
    var M = 90; // marge
    var DISPLAY = '"Big Shoulders Display", "Arial Narrow", Impact, sans-serif';
    var SANS = '"Archivo", Arial, sans-serif';

    ctx.fillStyle = '#0E0E0D';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = '#F2EFE8';
    ctx.font = '900 96px ' + DISPLAY;
    ctx.fillText('BLACKTOM', M, 190);
    ctx.font = '600 30px ' + SANS;
    ctx.fillStyle = '#A39F95';
    ctx.fillText('BENCH LAB', M, 245);

    ctx.fillStyle = '#F2EFE8';
    ctx.fillRect(M, 290, W - 2 * M, 8);

    ctx.font = '600 30px ' + SANS;
    ctx.fillStyle = '#A39F95';
    ctx.fillText('1RM ESTIMÉ', M, 370);

    // Le chiffre prend toute la largeur disponible, aligné à gauche.
    var big = lastResult ? calcFormatKg(lastResult.oneRMRounded) : '';
    var size = 360;
    ctx.fillStyle = '#F2EFE8';
    do {
      ctx.font = '900 ' + size + 'px ' + DISPLAY;
      size -= 8;
    } while (ctx.measureText(big).width > W - 2 * M && size > 80);
    ctx.fillText(big, M - 6, 640);

    ctx.font = '800 56px ' + DISPLAY;
    ctx.fillStyle = '#F2EFE8';
    ctx.fillText(lastResult ? lastResult.ratio.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '× LE POIDS DE CORPS' : '', M, 730);

    ctx.font = '400 30px ' + SANS;
    ctx.fillStyle = '#A39F95';
    var perf = lastResult ? (lastResult.reps <= 1 ? calcFormatKg(lastResult.load) + ' × 1' : calcFormatKg(lastResult.load) + ' × ' + lastResult.reps) : '';
    ctx.fillText('Poids : ' + (lastResult ? calcFormatKg(lastResult.bodyweight) : ''), M, 810);
    ctx.fillText('Performance : ' + perf, M, 856);
    ctx.fillText(lastResult ? lastResult.repTypeLabel : '', M, 902);

    ctx.fillStyle = 'rgba(242,239,232,.32)';
    ctx.fillRect(M, H - 150, W - 2 * M, 2);
    ctx.font = '800 44px ' + DISPLAY;
    ctx.fillStyle = '#F2EFE8';
    ctx.fillText('BLACKTOM.FR', M, H - 80);
  }

  function ensureCardFonts(done) {
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('900 100px "Big Shoulders Display"'),
        document.fonts.load('800 56px "Big Shoulders Display"'),
        document.fonts.load('600 30px "Archivo"'),
        document.fonts.load('400 30px "Archivo"')
      ]).then(function () { done(); }, function () { done(); });
    } else {
      done();
    }
  }

  function canvasToFile(callback) {
    ensureCardFonts(function () {
      drawCard();
      els.canvas.toBlob(function (blob) {
        callback(new File([blob], 'blacktom-bench-lab.png', { type: 'image/png' }));
      }, 'image/png');
    });
  }

  els.downloadBtn.addEventListener('click', function () {
    if (!lastResult) return;
    canvasToFile(function (file) {
      var url = URL.createObjectURL(file);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'blacktom-bench-lab.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (typeof trackEvent === 'function') trackEvent('calculator_share', { calculator: 'bench_1rm', method: 'download' });
    });
  });

  // Formulaire email inline : on reste sur la page (le résultat ne doit pas
  // disparaître), donc envoi en AJAX vers Netlify Forms au lieu de la
  // redirection standard vers /merci-blacktom.html.
  var emailForm = document.getElementById('calc-email-form');
  if (emailForm) {
    emailForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('calc-email-msg');
      var data = new URLSearchParams(new FormData(emailForm)).toString();
      fetch(emailForm.getAttribute('action').replace('/merci-blacktom.html', '/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
      }).then(function () {
        msg.textContent = 'Merci, c’est fait. Tu recevras les prochains outils et contenus BLACKTOM.';
        emailForm.reset();
        if (typeof trackEvent === 'function') {
          trackEvent('newsletter_signup', { source_page: 'calculateur-1rm', source_component: 'outil_resultat' });
        }
      }).catch(function () {
        msg.textContent = 'Une erreur est survenue, réessaie dans un instant.';
      });
    });
  }

  if (navigator.share) {
    els.shareBtn.hidden = false;
    els.shareBtn.addEventListener('click', function () {
      if (!lastResult) return;
      var shareData = {
        title: 'BLACKTOM Bench Lab',
        text: 'Mon 1RM estimé au développé couché : ' + calcFormatKg(lastResult.oneRMRounded) + ' (' + lastResult.ratio.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + '× mon poids de corps). Calcule le tien :',
        url: 'https://blacktom.fr/outils/calculateur-1rm-developpe-couche'
      };
      canvasToFile(function (file) {
        var withFile = Object.assign({}, shareData, { files: [file] });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share(withFile).catch(function () {});
        } else {
          navigator.share(shareData).catch(function () {});
        }
        if (typeof trackEvent === 'function') trackEvent('calculator_share', { calculator: 'bench_1rm', method: 'share' });
      });
    });
  }
});
