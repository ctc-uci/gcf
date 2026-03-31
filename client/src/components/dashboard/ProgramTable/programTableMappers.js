export function formatLaunchDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toISOString().slice(0, 10).replace(/-/g, '/');
  } catch {
    return isoString;
  }
}

export function getRouteByRole(role, userId) {
  const routes = {
    'Super Admin': '/admin/programs',
    Admin: '/admin/programs',
    'Regional Director': `/rdProgramTable/${userId}`,
  };
  return routes[role];
}

export function mapAdminRow(row) {
  const languages = Array.isArray(row.languages) ? row.languages : [];

  return {
    id: row.id,
    title: row.title ?? row.name,
    status: row.status,
    launchDate: row.launchDate,
    location: row.countryName ?? '',
    country: row.country,
    city: row.city,
    state: row.state,
    students: row.students ?? 0,
    instruments: row.instrumentTypes ?? [],
    totalInstruments: row.instruments ?? 0,
    programDirectors: row.programDirectors,
    regionalDirectors: row.regionalDirectors,
    playlists: row.playlists,
    languages,
    primaryLanguage: row.primaryLanguage,

    media: row.media,
  };
}

export function mapRdRow(row) {
  const languages = Array.isArray(row.languages) ? row.languages : [];

  return {
    id: row.programId,
    title: row.programName,
    status: row.programStatus,
    launchDate: row.programLaunchDate,
    location: row.programLocation ?? row.regionName ?? '',
    country: row.countryId,
    city: row.city,
    state: row.state,
    regionId: row.regionId,
    students: row.totalStudents ?? 0,
    instruments: row.instrumentTypes ?? [],
    totalInstruments: row.totalInstruments ?? 0,
    programDirectors: row.programDirectors,
    regionalDirectors: row.regionalDirectors,
    playlists: row.playlists,
    languages,
    primaryLanguage: row.primaryLanguage,
    media: row.media,
  };
}

export const MAP_BY_ROLE = {
  'Super Admin': mapAdminRow,
  Admin: mapAdminRow,
  'Regional Director': mapRdRow,
};
