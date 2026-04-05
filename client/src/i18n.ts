import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// NOTE: The on-disk locale folder for "Chinese" is `public/locales/zh/*`.
export const APP_LOCALES = ['en', 'es', 'fr', 'zh'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}

function getStoredLocale(): AppLocale {
  try {
    const stored = localStorage.getItem('i18nextLng');
    if (stored && isAppLocale(stored)) return stored;
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
  });

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
