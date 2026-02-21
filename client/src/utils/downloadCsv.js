/**
 * Reusable CSV download utilities.
 * Use escapeCsvValue for each cell value, then downloadCsv(headers, rows, filename).
 */

export function escapeCsvValue(val) {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Triggers a browser download of the given data as a CSV file.
 * @param {string[]} headers - Column header labels
 * @param {string[][]} rows - Array of rows, each row an array of cell values (already escaped)
 * @param {string} filename - Download filename (e.g. 'programs-2025-02-19.csv')
 */
export function downloadCsv(headers, rows, filename) {
  if (!rows || rows.length === 0) return;
  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
