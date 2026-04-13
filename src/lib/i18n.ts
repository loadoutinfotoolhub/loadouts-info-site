import de from '../locales/de.json';
import en from '../locales/en.json';

export type Locale = 'de' | 'en';
export const defaultLocale: Locale = 'de';
export const locales: Locale[] = ['de', 'en'];

const translations: Record<Locale, typeof de> = { de, en };

/**
 * Get a translated string by dot-notation key.
 * Example: t('common.disclaimer', 'de')
 */
export function t(key: string, lang: Locale = defaultLocale): string {
  const keys = key.split('.');
  let result: unknown = translations[lang];
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      // Fallback to German if key not found in target locale
      let fallback: unknown = translations.de;
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = (fallback as Record<string, unknown>)[fk];
        } else {
          return key; // Key not found at all, return key as-is
        }
      }
      return typeof fallback === 'string' ? fallback : key;
    }
  }
  return typeof result === 'string' ? result : key;
}

/**
 * Get the locale from an Astro URL path.
 * /de/saeule-3a-rechner -> 'de'
 * /en/pillar-3a-calculator -> 'en'
 */
export function getLocaleFromPath(path: string): Locale {
  const segment = path.split('/').filter(Boolean)[0];
  return locales.includes(segment as Locale) ? (segment as Locale) : defaultLocale;
}

/**
 * Build a localized path.
 * localePath('/saeule-3a-rechner', 'de') -> '/de/saeule-3a-rechner'
 */
export function localePath(path: string, lang: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${clean}`;
}
