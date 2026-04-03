import {
  downloadCsv,
  escapeCsvValue,
  getFilenameTimestamp,
} from '@/utils/downloadCsv';

function authorDisplayName(row) {
  return (
    [row.firstName, row.lastName].filter(Boolean).join(' ').trim() ||
    row.fullName?.trim() ||
    ''
  );
}

export function downloadMediaUpdatesAsCsv(data) {
  const headers = ['Update Note', 'Status', 'Author', 'Program', 'Date'];
  const rows = (data || []).map((row) => [
    escapeCsvValue(row.note),
    escapeCsvValue(row.status),
    escapeCsvValue(authorDisplayName(row)),
    escapeCsvValue(row.programName),
    escapeCsvValue(row.updateDate),
  ]);
  downloadCsv(headers, rows, `media-updates-${getFilenameTimestamp()}.csv`);
}
