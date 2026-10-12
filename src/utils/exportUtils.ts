/**
 * Utilities for exporting assessment tables and printing reports
 */

export function exportToCSV(filename: string, rows: (string | number | null | undefined)[][]): void {
  const processCell = (cell: string | number | null | undefined): string => {
    if (cell === null || cell === undefined) return '""';
    const cellStr = String(cell).replace(/"/g, '""');
    return `"${cellStr}"`;
  };

  const csvContent = rows.map(row => row.map(processCell).join(',')).join('\r\n');
  
  // \uFEFF BOM ensures Microsoft Excel recognizes UTF-8 correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printCurrentView(title?: string): void {
  const originalTitle = document.title;
  if (title) {
    document.title = title;
  }
  window.print();
  document.title = originalTitle;
}
