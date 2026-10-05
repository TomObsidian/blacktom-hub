// BLACKTOM FOOD LAB — Convertisseur Cru <-> Cuit.
// Calcul 100% client, aucune donnée envoyée a un serveur. Les aliments et
// ratios viennent de /data/food-lab.json (source unique, editable depuis
// BLACKTOM Admin). Ce fichier ne contient que la logique de calcul et
// l'affichage : aucun ratio n'est en dur ici.
//
// Formule : ratio = poids_cuit / poids_cru
//   Cru -> Cuit : poids_cuit = poids_cru x ratio
//   Cuit -> Cru : poids_cru = poids_cuit / ratio
// Mode personnel : ratio_personnel = poids_apres_cuisson / poids_avant_cuisson
//
// "Mon ratio" est enregistre uniquement dans localStorage (foodLabRatios),
// par aliment. Aucun compte, aucune base de donnees, aucune donnee envoyee.

var FOODLAB_STORAGE_KEY = 'foodLabRatios';

window.BLACKTOM_FOODLAB_READY = fetch('/data/food-lab.json')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    window.BLACKTOM_FOODLAB_FOODS = data.foods || [];
    return data;
  });

function flParseNumber(raw) {
  if (typeof raw !== 'string') return NaN;
  var normalized = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return NaN;
  var n = parseFloat(normalized);
  if (!isFinite(n)) return NaN;
  return n;
}

function flRoundResult(value) {
  if (!isFinite(value)) return null;
  var step = value >= 200 ? 10 : 5;
  return Math.round(value / step) * step;
}

function flFormatGrams(value) {
  if (value === null || !isFinite(value)) return '—';
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' g';
}

function flReadRatios() {
  try {
    var raw = window.localStorage.getItem(FOODLAB_STORAGE_KEY);
    if (!raw) return {};
    var parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch (e) {
    return {};
  }
}

function flWriteRatios(ratios) {
  try {
    window.localStorage.setItem(FOODLAB_STORAGE_KEY, JSON.stringify(ratios));
    return true;
  } catch (e) {
    return false;
  }
}

function flTrack(name, params) {
  if (typeof trackEvent === 'function') trackEvent(name, params);
}

document.addEventListener('DOMContentLoaded', function () {
  var root = document.getElementById('fl-tool');
  if (!root) return;

  var els = {
    food: document.getElementById('fl-food'),
    dirRawToCooked: document.getElementById('fl-dir-raw'),
    dirCookedToRaw: document.getElementById('fl-dir-cooked'),
    weightInput: document.getElementById('fl-weight'),
    weightLabel: document.getElementById('fl-weight-label'),
    weightErr: document.getElementById('fl-weight-err'),
    results: document.getElementById('fl-results'),
    resultLabel: document.getElementById('fl-result-label'),
    resultMain: document.getElementById('fl-result-main'),
    resultRange: document.getElementById('fl-result-range'),
    ratioUsedRow: document.getElementById('fl-ratio-used'),
    variationNote: document.getElementById('fl-variation-note'),
    methodNote: document.getElementById('fl-method-note'),
    reliability: document.getElementById('fl-reliability'),
    ownRatioDetails: document.getElementById('fl-own-ratio'),
    ownBefore: document.getElementById('fl-own-before'),
    ownAfter: document.getElementById('fl-own-after'),
    ownErr: document.getElementById('fl-own-err'),
    ownResult: document.getElementById('fl-own-result'),
    ownRatioValue: document.getElementById('fl-own-ratio-value'),
    ownSaveBtn: document.getElementById('fl-own-save'),
    ownResetBtn: document.getElementById('fl-own-reset'),
    ownSavedMsg: document.getElementById('fl-own-saved-msg'),
    ownFoodName: document.getElementById('fl-own-food-name')
  };

  var direction = 'raw-to-cooked'; // ou 'cooked-to-raw'
  var foods = [];
  var ratios = flReadRatios();
  var lastTrackedKey = null;

  function setDirButtons() {
    var rawActive = direction === 'raw-to-cooked';
    els.dirRawToCooked.classList.toggle('btn-primary', rawActive);
    els.dirRawToCooked.classList.toggle('btn-ghost', !rawActive);
    els.dirRawToCooked.setAttribute('aria-pressed', String(rawActive));
    els.dirCookedToRaw.classList.toggle('btn-primary', !rawActive);
    els.dirCookedToRaw.classList.toggle('btn-ghost', rawActive);
    els.dirCookedToRaw.setAttribute('aria-pressed', String(!rawActive));
    els.weightLabel.textContent = rawActive ? 'Poids cru' : 'Poids cuit';
  }

  function currentFood() {
    var slug = els.food.value;
    return foods.filter(function (f) { return f.slug === slug; })[0] || null;
  }

  function personalRatioFor(slug) {
    var r = ratios[slug];
    return (typeof r === 'number' && isFinite(r) && r > 0) ? r : null;
  }

  function setWeightError(message) {
    els.weightErr.textContent = message || '';
    if (message) {
      els.weightInput.setAttribute('aria-invalid', 'true');
    } else {
      els.weightInput.removeAttribute('aria-invalid');
    }
  }

  function refreshOwnRatioUI() {
    var food = currentFood();
    if (!food) return;
    els.ownFoodName.textContent = food.name;
    var personal = personalRatioFor(food.slug);
    if (personal !== null) {
      els.ownSavedMsg.hidden = false;
      els.ownSavedMsg.textContent = '✓ Ton ratio (×' + personal.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ') est utilisé pour ' + food.name.toLowerCase() + '.';
      els.ownResetBtn.hidden = false;
    } else {
      els.ownSavedMsg.hidden = true;
      els.ownResetBtn.hidden = true;
    }
    els.ownBefore.value = '';
    els.ownAfter.value = '';
    els.ownResult.hidden = true;
    setOwnError('');
  }

  function setOwnError(message) {
    els.ownErr.textContent = message || '';
  }

  function compute() {
    var food = currentFood();
    if (!food) return;

    var raw = els.weightInput.value.trim();
    if (raw === '') {
      setWeightError('');
      els.results.hidden = true;
      return;
    }

    var weight = flParseNumber(raw);
    if (isNaN(weight) || weight <= 0) {
      setWeightError('Entre un poids valide, supérieur à 0 g.');
      els.results.hidden = true;
      return;
    }
    if (weight > 5000) {
      setWeightError('Entre un poids réaliste (5 kg maximum).');
      els.results.hidden = true;
      return;
    }
    setWeightError('');

    var personal = personalRatioFor(food.slug);
    var ratio = personal !== null ? personal : food.ratio;
    var ratioType = personal !== null ? 'personal' : 'standard';

    var result, resultMin, resultMax;
    if (direction === 'raw-to-cooked') {
      result = weight * ratio;
      if (personal === null && food.min && food.max) {
        resultMin = weight * food.min;
        resultMax = weight * food.max;
      }
    } else {
      if (ratio <= 0) { els.results.hidden = true; return; }
      result = weight / ratio;
      if (personal === null && food.min && food.max) {
        resultMin = weight / food.max;
        resultMax = weight / food.min;
      }
    }

    var rounded = flRoundResult(result);
    els.resultLabel.textContent = direction === 'raw-to-cooked' ? 'ESTIMATION : POIDS CUIT' : 'ESTIMATION : POIDS CRU';
    els.resultMain.textContent = '≈ ' + flFormatGrams(rounded);

    if (resultMin !== undefined && resultMax !== undefined) {
      var rMin = flRoundResult(resultMin), rMax = flRoundResult(resultMax);
      els.resultRange.hidden = false;
      els.resultRange.textContent = 'Fourchette possible : ' + flFormatGrams(rMin) + ' à ' + flFormatGrams(rMax);
    } else {
      els.resultRange.hidden = true;
    }

    // Note contextuelle courte : pourquoi la fourchette varie (affichée uniquement
    // quand une fourchette existe pour l'aliment concerné).
    if (food.slug === 'pates' && resultMin !== undefined && resultMax !== undefined) {
      els.variationNote.hidden = false;
      els.variationNote.textContent = 'La variation dépend notamment de la forme et de la cuisson.';
    } else {
      els.variationNote.hidden = true;
    }

    // Référence de méthode (ex. pommes de terre épluchées, bouillies) : affichée
    // uniquement quand l'aliment a un champ "method" documenté dans la source.
    if (food.method) {
      els.methodNote.hidden = false;
      els.methodNote.textContent = 'Référence : ' + food.name.toLowerCase() + ' ' + food.method.toLowerCase() + '.';
    } else {
      els.methodNote.hidden = true;
    }

    els.ratioUsedRow.textContent = ratioType === 'personal'
      ? 'Ratio utilisé : ton ratio personnel (×' + ratio.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ')'
      : 'Ratio Food Lab utilisé : ×' + ratio.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' (estimation)';

    els.results.hidden = false;

    var trackKey = food.slug + '|' + direction + '|' + ratioType;
    if (trackKey !== lastTrackedKey) {
      lastTrackedKey = trackKey;
      flTrack('food_lab_conversion', {
        tool: 'raw_cooked_converter',
        food: food.slug,
        direction: direction,
        ratio_type: ratioType
      });
    }
  }

  function populateFoods(list) {
    foods = list;
    els.food.innerHTML = foods.map(function (f) {
      return '<option value="' + f.slug + '">' + f.name + '</option>';
    }).join('');
  }

  window.BLACKTOM_FOODLAB_READY.then(function () {
    populateFoods(window.BLACKTOM_FOODLAB_FOODS || []);
    refreshOwnRatioUI();
    compute();
  });

  els.food.addEventListener('change', function () {
    lastTrackedKey = null;
    refreshOwnRatioUI();
    compute();
  });

  els.dirRawToCooked.addEventListener('click', function () {
    if (direction === 'raw-to-cooked') return;
    direction = 'raw-to-cooked';
    lastTrackedKey = null;
    setDirButtons();
    compute();
  });
  els.dirCookedToRaw.addEventListener('click', function () {
    if (direction === 'cooked-to-raw') return;
    direction = 'cooked-to-raw';
    lastTrackedKey = null;
    setDirButtons();
    compute();
  });

  els.weightInput.addEventListener('input', compute);

  els.ownBefore.addEventListener('input', function () { setOwnError(''); els.ownResult.hidden = true; });
  els.ownAfter.addEventListener('input', function () { setOwnError(''); els.ownResult.hidden = true; });

  function computeOwnRatio() {
    var before = flParseNumber(els.ownBefore.value.trim());
    var after = flParseNumber(els.ownAfter.value.trim());
    if (isNaN(before) || before <= 0) {
      setOwnError('Entre un poids avant cuisson valide, supérieur à 0 g.');
      els.ownResult.hidden = true;
      return null;
    }
    if (isNaN(after) || after <= 0) {
      setOwnError('Entre un poids après cuisson valide, supérieur à 0 g.');
      els.ownResult.hidden = true;
      return null;
    }
    var r = after / before;
    if (!isFinite(r) || r <= 0) {
      setOwnError('Ces valeurs ne permettent pas de calculer un ratio.');
      els.ownResult.hidden = true;
      return null;
    }
    setOwnError('');
    els.ownRatioValue.textContent = '×' + r.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
    els.ownResult.hidden = false;
    return r;
  }

  els.ownBefore.addEventListener('change', computeOwnRatio);
  els.ownAfter.addEventListener('change', computeOwnRatio);

  els.ownSaveBtn.addEventListener('click', function () {
    var r = computeOwnRatio();
    if (r === null) return;
    var food = currentFood();
    if (!food) return;
    ratios[food.slug] = r;
    flWriteRatios(ratios);
    flTrack('food_lab_personal_ratio', { food: food.slug, action: 'save' });
    refreshOwnRatioUI();
    lastTrackedKey = null;
    compute();
  });

  els.ownResetBtn.addEventListener('click', function () {
    var food = currentFood();
    if (!food) return;
    delete ratios[food.slug];
    flWriteRatios(ratios);
    flTrack('food_lab_personal_ratio', { food: food.slug, action: 'reset' });
    refreshOwnRatioUI();
    lastTrackedKey = null;
    compute();
  });

  setDirButtons();
});
