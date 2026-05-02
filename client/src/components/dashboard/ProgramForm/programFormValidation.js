const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** True if `dateString` is YYYY-MM-DD and exists on the calendar (rejects e.g. 2026-02-31). */
export function isValidYmd(dateString) {
  if (!dateString || !YMD_PATTERN.test(dateString)) return false;
  const [y, m, d] = dateString.split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const check = new Date(utc);
  return (
    check.getUTCFullYear() === y &&
    check.getUTCMonth() === m - 1 &&
    check.getUTCDate() === d
  );
}

/**
 * @param {object} formState
 * @param {{ isNewProgram: boolean }} options
 * @param {(key: string) => string} t i18n translate
 * @returns {Record<string, string>}
 */
export function validateProgramForm(formState, { isNewProgram }, t) {
  const errors = {};

  if (!String(formState.programName ?? '').trim()) {
    errors.programName = t('programForm.validation.programNameRequired');
  }

  const status = formState.status;
  if (
    status === null ||
    status === undefined ||
    String(status).trim() === ''
  ) {
    errors.status = t('programForm.validation.statusRequired');
  }

  const launchRaw = formState.launchDate;
  if (
    launchRaw === null ||
    launchRaw === undefined ||
    String(launchRaw).trim() === ''
  ) {
    errors.launchDate = t('programForm.validation.launchDateRequired');
  } else if (!isValidYmd(String(launchRaw))) {
    errors.launchDate = t('programForm.validation.launchDateRequired');
  }

  if (isNewProgram) {
    const raw = formState.partnerOrg;
    const hasPartner =
      raw !== null &&
      raw !== undefined &&
      raw !== '' &&
      !Number.isNaN(Number(raw));
    if (!hasPartner) {
      errors.partnerOrg = t('programForm.validation.partnerOrgRequired');
    }
  }

  const countryRaw = formState.country;
  const hasCountry =
    countryRaw !== null &&
    countryRaw !== undefined &&
    countryRaw !== '' &&
    !Number.isNaN(Number(countryRaw));
  if (!hasCountry) {
    errors.country = t('programForm.validation.countryRequired');
  }

  return errors;
}
