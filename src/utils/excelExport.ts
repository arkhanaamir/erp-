/**
 * Enterprise Excel / Spreadsheet Export Utility for The Casabuild ERP
 * Formats structured data into standard CSV/XLS with UTF-8 BOM (\uFEFF)
 * for seamless compatibility with Microsoft Excel, Google Sheets, Apple Numbers, and LibreOffice.
 */

export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const sanitize = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    // Wrap with quotes and escape internal quotes
    return `"${str}"`;
  };

  const headerRow = headers.map(sanitize).join(',');
  const dataRows = rows.map(r => r.map(sanitize).join(','));
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const timestamp = new Date().toISOString().slice(0, 10);
  const sanitizedFilename = `${filename.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_${timestamp}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', sanitizedFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
