import countries from 'i18n-iso-countries';

export function isoCodeToFlagIconCode(isoCode) {
  if (isoCode == null || typeof isoCode !== 'string') return '';
  const trimmed = isoCode.trim();
  if (!trimmed) return '';
  const alpha2 = countries.toAlpha2(trimmed);
  return alpha2 ? alpha2.toLowerCase() : '';
}
