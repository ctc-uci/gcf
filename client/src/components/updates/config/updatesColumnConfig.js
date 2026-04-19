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
