/** Filter columns for Program updates (RD / Admin toolbars). */
export const programSectionColumns = [
  { key: 'note', type: 'text' },
  { key: 'status', type: 'select', options: ['Resolved', 'Unresolved'] },
  { key: 'name', type: 'text' },
  { key: 'updateDate', type: 'date' },
];

/** Filter columns for Program Director custom table. */
export const programDirectorFilterColumns = [
  { key: 'updateDate', type: 'date' },
  { key: 'instrumentName', type: 'text' },
  {
    key: 'status',
    type: 'select',
    options: ['Pending', 'Reviewed', 'Approved', 'Resolved'],
  },
  { key: 'note', type: 'text' },
];

/** Filter columns for Media updates sections. */
export const mediaSectionColumns = [
  { key: 'note', type: 'text' },
  {
    key: 'status',
    type: 'select',
    options: ['Approved', 'Resolved', 'Unresolved'],
  },
  { key: 'programName', type: 'text' },
  { key: 'updateDate', type: 'date' },
];

export const formatTableDate = (dateString) => {
  // TODO: timezone handling
  if (!dateString) return '';

  let safeDateString = dateString.replace(' ', 'T');

  if (
    !safeDateString.endsWith('Z') &&
    !safeDateString.includes('+') &&
    !safeDateString.includes('-')
  ) {
    safeDateString += 'Z';
  }

  const date = new Date(safeDateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (isThisYear) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
};
