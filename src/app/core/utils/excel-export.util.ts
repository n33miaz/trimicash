/**
 * excel-export.util.ts — TrimiCash
 * Exportação client-side para Excel via SheetJS (xlsx).
 * TypeScript puro — sem imports Angular.
 */

import * as XLSX from 'xlsx';

export interface ExcelSheet {
  name: string;
  data: Record<string, unknown>[];
}

/**
 * Exporta múltiplas abas para um arquivo .xlsx e dispara o download.
 *
 * @param sheets Array de abas com nome e dados
 * @param fileName Nome do arquivo (sem extensão)
 */
export function exportToExcel(sheets: ExcelSheet[], fileName: string): void {
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    // Auto-width nas colunas
    const colWidths = Object.keys(sheet.data[0] ?? {}).map(key => ({
      wch: Math.max(key.length, 12),
    }));
    ws['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31)); // max 31 chars no Excel
  }

  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
