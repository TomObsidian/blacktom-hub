// BLACKTOM BENCH CALCULATOR — 1RM développé couché, force relative, charges.
// Tout le calcul est fait côté client : aucune donnée n'est envoyée à un
// serveur, aucune API, aucune base de données.
//
// Formule principale : Epley — 1RM = charge x (1 + reps / 30).
// Justification détaillée dans la FAQ de la page. À 1 répétition, la charge
// saisie EST le 1RM (pas de formule appliquée).

var CALC_PERCENTAGES = [100, 95, 90, 85, 80, 75, 70, 65, 60, 50];

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
  var decimals = Math.abs(value - Math.round(value)) < 0.001 ? 0 : 1;
  return value.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: 1 }) + ' kg';
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

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('calc-form');
  if (!form) return;

  var els = {
    bodyweight: document.getElementById('calc-bodyweight'),
    load: document.getElementById('calc-load'),
    reps: document.getElementById('calc-reps'),
    step: document.getElementById('calc-step'),
    repType: form.querySelectorAll('input[name="calc-rep-type"]'),
    errBodyweight: document.getElementById('calc-err-bodyweight'),
    errLoad: document.getElementById('calc-err-load'),
    results: document.getElementById('calc-results'),
    oneRmMain: document.getElementById('calc-1rm-main'),
    oneRmRaw: document.getElementById('calc-1rm-raw'),
    ratio: document.getElementById('calc-ratio'),
    reliabilityNote: document.getElementById('calc-reliability-note'),
    tableBody: document.getElementById('calc-table-body'),
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

    els.cardWeight.textContent = calcFormatKg(bodyweight);
    els.cardPerf.textContent = reps <= 1 ? calcFormatKg(load) + ' × 1' : calcFormatKg(load) + ' × ' + reps;
    els.cardOneRm.textContent = calcFormatKg(oneRMRounded);
    els.cardRatio.textContent = ratio.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '× PDC';
    els.cardRepType.textContent = repTypeLabel;

    els.results.hidden = false;
    els.results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (typeof trackEvent === 'function') {
      trackEvent('calculator_use', { calculator: 'bench_1rm' });
    }
  });

  els.resetBtn.addEventListener('click', function () {
    form.reset();
    els.results.hidden = true;
    setError(els.bodyweight, els.errBodyweight, '');
    setError(els.load, els.errLoad, '');
    lastResult = null;
    els.bodyweight.focus();
  });

  // Carte partageable — dessinée en canvas uniquement au moment du
  // téléchargement/partage (pas de rendu permanent inutile).
  function drawCard() {
    var c = els.canvas;
    var ctx = c.getContext('2d');
    var W = c.width, H = c.height;

    ctx.fillStyle = '#0b0b0c';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e02020';
    ctx.fillRect(0, 0, W, 14);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 64px Arial, sans-serif';
    ctx.fillText('BLACKTOM', W / 2, 160);
    ctx.font = '700 34px Arial, sans-serif';
    ctx.fillStyle = '#c9c9cc';
    ctx.fillText('BENCH CALCULATOR', W / 2, 210);

    ctx.strokeStyle = '#2a2a2d';
    ctx.beginPath();
    ctx.moveTo(120, 260);
    ctx.lineTo(W - 120, 260);
    ctx.stroke();

    ctx.font = '600 30px Arial, sans-serif';
    ctx.fillStyle = '#9a9a9e';
    ctx.fillText('1RM ESTIMÉ', W / 2, 360);
    ctx.font = '900 130px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(lastResult ? calcFormatKg(lastResult.oneRMRounded) : '', W / 2, 470);

    ctx.font = '700 40px Arial, sans-serif';
    ctx.fillStyle = '#e02020';
    ctx.fillText(lastResult ? lastResult.ratio.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '× PDC' : '', W / 2, 540);

    ctx.font = '500 28px Arial, sans-serif';
    ctx.fillStyle = '#c9c9cc';
    var perf = lastResult ? (lastResult.reps <= 1 ? calcFormatKg(lastResult.load) + ' × 1' : calcFormatKg(lastResult.load) + ' × ' + lastResult.reps) : '';
    ctx.fillText('Poids : ' + (lastResult ? calcFormatKg(lastResult.bodyweight) : ''), W / 2, 640);
    ctx.fillText('Performance : ' + perf, W / 2, 680);
    ctx.fillText(lastResult ? lastResult.repTypeLabel : '', W / 2, 720);

    ctx.font = '700 32px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('blacktom.fr', W / 2, H - 60);
  }

  function canvasToFile(callback) {
    drawCard();
    els.canvas.toBlob(function (blob) {
      callback(new File([blob], 'blacktom-bench-calculator.png', { type: 'image/png' }));
    }, 'image/png');
  }

  els.downloadBtn.addEventListener('click', function () {
    if (!lastResult) return;
    canvasToFile(function (file) {
      var url = URL.createObjectURL(file);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'blacktom-bench-calculator.png';
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
        msg.textContent = 'Merci, c’est fait — tu recevras les prochains outils et contenus BLACKTOM.';
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
        title: 'BLACKTOM Bench Calculator',
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
