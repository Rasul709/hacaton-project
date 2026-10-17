import { getKazakhstanDateString } from './index';

/**
 * Helper to export array of objects to a CSV file with UTF-8 BOM
 * (ensuring proper rendering in Russian Excel)
 */
export function exportToCsv(filename: string, rows: Record<string, any>[], headers: { key: string; label: string }[]) {
  if (!rows || !rows.length) return;

  const headerRow = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(';');
  const dataRows = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h.key] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(';')
  );

  // \uFEFF is UTF-8 Byte Order Mark for Excel
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${getKazakhstanDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
