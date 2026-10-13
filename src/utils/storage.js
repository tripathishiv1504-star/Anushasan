/**
 * Storage Utility with JSON serialization and prefix scoping.
 * Note: Only this file may touch localStorage (Rule 5.9).
 */

const STORAGE_PREFIX = 'anushasan:';

export const storage = {
  /**
   * Retrieve item from localStorage
   * @param {string} key
   * @param {*} defaultValue
   * @returns {*}
   */
  get(key, defaultValue = null) {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (item === null || item === undefined) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.warn(`[storage] Error reading key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Set item in localStorage
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn(`[storage] Error setting key "${key}":`, error);
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key
   */
  remove(key) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.warn(`[storage] Error removing key "${key}":`, error);
    }
  },

  /**
   * Clear all items scoped to anushasan prefix
   */
  clear() {
    if (typeof window === 'undefined') return;
    try {
      const keysToRemove = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
      console.warn('[storage] Error clearing storage:', error);
    }
  },
};

export default storage;
