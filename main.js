import { getLatestRates } from './js/CurrencyService.mjs';
import {
  getFavorites,
  toggleFavorite,
  isFavorite,
  getHistory,
  addToHistory,
  clearHistory,
} from './js/Storage.mjs';

const COMMON_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'MXN', 'BRL', 'COP', 'CLP',
];

const form = document.querySelector('#converter-form');
const amountInput = document.querySelector('#amount-input');
const fromSelect = document.querySelector('#from-currency');
const toSelect = document.querySelector('#to-currency');
const swapBtn = document.querySelector('#swap-btn');
const favoriteBtn = document.querySelector('#favorite-btn');
const resultEl = document.querySelector('#conversion-result');
const rateInfoEl = document.querySelector('#rate-info');
const loadingEl = document.querySelector('#loading-indicator');
const alertBanner = document.querySelector('#alert-banner');
const favoritesList = document.querySelector('#favorites-list');
const historyList = document.querySelector('#history-list');
const clearHistoryBtn = document.querySelector('#clear-history-btn');

let currentRatesCache = { base: null, rates: null, lastUpdate: null };

function showAlert(message) {
  alertBanner.textContent = message;
  alertBanner.classList.remove('hidden');
}

function hideAlert() {
  alertBanner.textContent = '';
  alertBanner.classList.add('hidden');
}

function setLoading(isLoading) {
  loadingEl.classList.toggle('hidden', !isLoading);
}

function populateCurrencySelects(codes) {
  const uniqueCodes = [...new Set(codes)].sort();
  const optionsHtml = uniqueCodes
    .map((code) => `<option value="${code}">${code}</option>`)
    .join('');

  fromSelect.innerHTML = optionsHtml;
  toSelect.innerHTML = optionsHtml;

  fromSelect.value = uniqueCodes.includes('USD') ? 'USD' : uniqueCodes[0];
  toSelect.value = uniqueCodes.includes('EUR') ? 'EUR' : uniqueCodes[1] || uniqueCodes[0];
}

function updateFavoriteButtonState() {
  const saved = isFavorite(fromSelect.value, toSelect.value);
  favoriteBtn.textContent = saved ? '★ Saved Favorite' : '☆ Save Favorite';
}

function renderFavorites() {
  const favorites = getFavorites();
  if (!favorites.length) {
    favoritesList.innerHTML = '<li class="list-item">No favorite pairs saved yet.</li>';
    return;
  }

  favoritesList.innerHTML = favorites
    .map(
      (pair) => `
      <li class="list-item">
        <button type="button" class="fav-trigger" data-from="${pair.from}" data-to="${pair.to}">
          ${pair.from} → ${pair.to}
        </button>
      </li>`
    )
    .join('');
}

function renderHistory() {
  const history = getHistory();
  if (!history.length) {
    historyList.innerHTML = '<li class="list-item">No recent conversions yet.</li>';
    return;
  }

  historyList.innerHTML = history
    .map(
      (item) => `
      <li class="list-item">
        <span>${item.amount} ${item.from} = <strong>${item.result.toFixed(2)}</strong> ${item.to}</span>
        <small>${item.timestamp}</small>
      </li>`
    )
    .join('');
}

async function performConversion(saveRecord = true) {
  hideAlert();

  const amount = parseFloat(amountInput.value);
  const fromCode = fromSelect.value;
  const toCode = toSelect.value;

  if (!Number.isFinite(amount) || amount <= 0) {
    showAlert('Please enter a valid positive amount.');
    return;
  }

  setLoading(true);
  try {
    if (currentRatesCache.base !== fromCode || !currentRatesCache.rates) {
      currentRatesCache = await getLatestRates(fromCode);
    }

    const rate = currentRatesCache.rates[toCode];
    if (!rate) {
      throw new Error(`Exchange rate not available for ${fromCode} to ${toCode}.`);
    }

    const convertedValue = amount * rate;
    resultEl.textContent = `${amount} ${fromCode} = ${convertedValue.toFixed(2)} ${toCode}`;
    rateInfoEl.textContent = `1 ${fromCode} = ${rate.toFixed(4)} ${toCode} (Updated: ${currentRatesCache.lastUpdate})`;

    if (saveRecord) {
      addToHistory({
        amount,
        from: fromCode,
        to: toCode,
        rate,
        result: convertedValue,
      });
      renderHistory();
    }
  } catch (error) {
    showAlert(error.message || 'Unable to fetch exchange rates right now.');
  } finally {
    setLoading(false);
  }
}

async function init() {
  populateCurrencySelects(COMMON_CURRENCIES);
  updateFavoriteButtonState();
  renderFavorites();
  renderHistory();

  try {
    setLoading(true);
    const initialData = await getLatestRates('USD');
    currentRatesCache = initialData;
    const allCodes = Object.keys(initialData.rates || {});
    if (allCodes.length) {
      const prevFrom = fromSelect.value;
      const prevTo = toSelect.value;
      populateCurrencySelects(allCodes);
      fromSelect.value = prevFrom;
      toSelect.value = prevTo;
    }
    await performConversion(false);
  } catch (error) {
    showAlert(error.message || 'Could not load initial currency list.');
  } finally {
    setLoading(false);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  performConversion(true);
});

swapBtn.addEventListener('click', () => {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  updateFavoriteButtonState();
  performConversion(true);
});

fromSelect.addEventListener('change', () => {
  updateFavoriteButtonState();
  performConversion(false);
});

toSelect.addEventListener('change', () => {
  updateFavoriteButtonState();
  performConversion(false);
});

favoriteBtn.addEventListener('click', () => {
  toggleFavorite(fromSelect.value, toSelect.value);
  updateFavoriteButtonState();
  renderFavorites();
});

favoritesList.addEventListener('click', (event) => {
  const btn = event.target.closest('.fav-trigger');
  if (!btn) return;
  fromSelect.value = btn.dataset.from;
  toSelect.value = btn.dataset.to;
  updateFavoriteButtonState();
  performConversion(true);
});

clearHistoryBtn.addEventListener('click', () => {
  clearHistory();
  renderHistory();
});

init();