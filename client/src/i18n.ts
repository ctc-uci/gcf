import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// NOTE: The on-disk locale folder for "Chinese" is `public/locales/zh/*`.
export const APP_LOCALES = ['en', 'es', 'fr', 'zh'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}

/** Map `zh-CN`, `en-US`, etc. to our app codes (`zh`, `en`, …). */
export function toAppLocale(lng: string | undefined | null): AppLocale | null {
  if (lng == null || lng === '') return null;
  const base = String(lng).split('-')[0]!.toLowerCase();
  return isAppLocale(base) ? base : null;
}

function getStoredLocale(): AppLocale {
  try {
    const stored = localStorage.getItem('i18nextLng');
    const normalized = toAppLocale(stored ?? undefined);
    if (normalized) return normalized;
  } catch {
    /* ignore */
  }
  return 'en';
}

async function fetchTranslation(
  lng: AppLocale
): Promise<Record<string, unknown>> {
  const path = '/locales/' + lng + '/translation.json';
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error('Failed to load locale: ' + lng);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

/** Loads locale bundles from public/locales/{en,es,fr,zh}/translation.json */
export async function initI18n(): Promise<void> {
  const initial = getStoredLocale();

  await i18n.use(initReactI18next).init({
    lng: initial,
    fallbackLng: 'en',
    supportedLngs: [...APP_LOCALES],
    interpolation: { escapeValue: false },
    resources: {},
    react: {
      bindI18n: 'languageChanged loaded',
    },
    load: 'languageOnly',
    cleanCode: true,
  });

  if (typeof window !== 'undefined') {
    i18n.on('languageChanged', (lng) => {
      const code = toAppLocale(lng);
      if (!code) return;
      try {
        localStorage.setItem('i18nextLng', code);
      } catch {
        /* ignore */
      }
    });
  }

  for (const code of APP_LOCALES) {
    try {
      const data = await fetchTranslation(code);
      i18n.addResourceBundle(code, 'translation', data, true, true);
    } catch (err) {
      // If a locale is missing, keep the app usable via `fallbackLng`.
      // eslint-disable-next-line no-console
      console.warn('Failed to load locale bundle:', code, err);
    }
  }

  await i18n.changeLanguage(initial);
}

export default i18n;
