/**
 * Format a date as "Mon YYYY" (e.g. "Apr 2026").
 * Returns 'N/A' for missing or invalid dates.
 */
export function formatMonthYear(dateString) {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Smart relative date display:
 *  - Today → time only (e.g. "3:45 PM")
 *  - This year → short date (e.g. "Apr 18")
 *  - Older → numeric date (e.g. "04/18/24")
 *
 * Normalises raw DB timestamps that may lack a timezone suffix.
 */
export function formatRelativeDate(dateStr) {
  if (!dateStr) return '';

  let safeDateString = String(dateStr).replace(' ', 'T');
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(safeDateString);
  if (!hasTimezone) {
    safeDateString += 'Z';
  }

  const d = new Date(safeDateString);
  if (isNaN(d.getTime())) return dateStr;

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const isThisYear = d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (isThisYear) {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}

/**
 * Display-friendly date for update detail views.
 *  - Date-only strings (YYYY-MM-DD) → "Sat, Apr 18, 2026"
 *  - Timestamps → "Sat, Apr 18, 2026, 3:45 PM"
 *
 * Returns the original string when parsing fails.
 */
export function formatUpdateDisplayDate(value) {
  if (value === null || value === undefined || value === '') return '';
  const s = String(value).trim();

  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (ymd && !/\d{1,2}:\d{2}/.test(s)) {
    const [, y, mo, d] = ymd;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d));
    if (Number.isNaN(dt.getTime())) return s;
    return dt.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) return s;

  return dt.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
