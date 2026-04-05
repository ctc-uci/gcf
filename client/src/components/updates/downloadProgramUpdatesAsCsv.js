import {
  downloadCsv,
  escapeCsvValue,
  getFilenameTimestamp,
} from '@/utils/downloadCsv';

export function downloadProgramUpdatesAsCsv(data) {
  const headers = [
    'Flag',
    'Type',
    'Update Note',
    'Status',
    'Author',
    'Program',
    'Date',
  ];
  const rows = (data || []).map((row) => [
    escapeCsvValue(row.flagged ? 'Flagged' : ''),
    escapeCsvValue(row.updateType || row.title || ''),
    escapeCsvValue(row.note),
    escapeCsvValue(row.status),
    escapeCsvValue([row.firstName, row.lastName].filter(Boolean).join(' ')),
    escapeCsvValue(row.name),
    escapeCsvValue(row.updateDate),
  ]);
  downloadCsv(headers, rows, `program-updates-${getFilenameTimestamp()}.csv`);
}
