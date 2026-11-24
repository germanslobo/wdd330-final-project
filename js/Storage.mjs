const FAVORITES_KEY = 'wdd330_currency_favorites';
const HISTORY_KEY = 'wdd330_conversion_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Retrieves saved favorite currency pairs from localStorage.
 * @returns {Array<{from: string, to: string}>}
 */
export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
}

/**
 * Saves or toggles a favorite currency pair in localStorage.
 * @param {string} from - Base currency code (e.g., 'USD')
 * @param {string} to - Target currency code (e.g., 'EUR')
 * @returns {Array<{from: string, to: string}>} Updated favorites list
 */
export function toggleFavorite(from, to) {
  const cleanFrom = from.trim().toUpperCase();
  const cleanTo = to.trim().toUpperCase();
  const favorites = getFavorites();

  const existingIndex = favorites.findIndex(
    (item) => item.from === cleanFrom && item.to === cleanTo
  );

  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
  } else {
    favorites.unshift({ from: cleanFrom, to: cleanTo });
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return favorites;
}

/**
 * Checks whether a currency pair is currently saved as a favorite.
 * @param {string} from
 * @param {string} to
 * @returns {boolean}
 */
export function isFavorite(from, to) {
  const cleanFrom = from.trim().toUpperCase();
  const cleanTo = to.trim().toUpperCase();
  return getFavorites().some(
    (item) => item.from === cleanFrom && item.to === cleanTo
  );
}

/**
 * Retrieves recent conversion lookups from localStorage.
 * @returns {Array<Object>}
 */
export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error reading history from localStorage:', error);
    return [];
  }
}

/**
 * Adds a conversion record to recent history (capped at MAX_HISTORY_ITEMS).
 * @param {{amount: number, from: string, to: string, rate: number, result: number, timestamp?: string}} entry
 * @returns {Array<Object>} Updated history list
 */
export function addToHistory(entry) {
  const history = getHistory();
  const record = {
    amount: Number(entry.amount),
    from: entry.from.trim().toUpperCase(),
    to: entry.to.trim().toUpperCase(),
    rate: Number(entry.rate),
    result: Number(entry.result),
    timestamp: entry.timestamp || new Date().toLocaleString(),
  };

  history.unshift(record);
  const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  return trimmed;
}

/**
 * Clears all recent conversion history from localStorage.
 */
export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}