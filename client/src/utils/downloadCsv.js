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
 * Returns a filename-safe timestamp in local time (YYYY-MM-DDTHH-mm-ss).
 * Use this when building CSV filenames so downloads use the user's timezone.
 */
export function getFilenameTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
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
