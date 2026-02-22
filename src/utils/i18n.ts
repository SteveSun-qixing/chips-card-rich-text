/**
 * i18n Utility - Vocabulary-based Translation
 * Uses vocabulary injected by bridge from host
 */

// Module-level storage, updated by bridge callbacks
let vocabulary: Record<string, string> = {};
let currentLocale = 'zh-CN';

/**
 * Set vocabulary (called by bridge on init and language change)
 */
export function setVocabulary(vocab: Record<string, string>): void {
  vocabulary = vocab;
}

/**
 * Set current locale
 */
export function setLocale(locale: string): void {
  currentLocale = locale;
}

/**
 * Get current locale
 */
export function getLocale(): string {
  return currentLocale;
}

/**
 * Translate a key with optional variable substitution
 * @param key - Translation key (e.g., "toolbar.bold")
 * @param vars - Variables for substitution (e.g., { count: 5 })
 * @returns Translated string
 */
export function t(key: string, vars?: Record<string, unknown>): string {
  let text = vocabulary[key] ?? key;

  // Variable substitution
  if (vars) {
    Object.entries(vars).forEach(([varKey, value]) => {
      text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(value));
    });
  }

  return text;
}

/**
 * Check if a key exists in vocabulary
 */
export function hasKey(key: string): boolean {
  return key in vocabulary;
}

/**
 * Get all vocabulary keys
 */
export function getKeys(): string[] {
  return Object.keys(vocabulary);
}
