import xlsx from 'xlsx';
import xlsxCalc from 'xlsx-calc';
import ExcelJS from 'exceljs';

export default async function handleDynamicCell({filepath}: {filepath: string}) {
  const workbook = xlsx.readFile(filepath, {cellFormula: true, bookDeps: true});
  const sheet = workbook.Sheets['测算表'];
  let count = 0;
  while (Math.abs(sheet['M20'].v).toFixed(2) !== '0.00') {
    if (++count > 1000) {
      break;
    }
    sheet['K16'].v = sheet['K16'].v + (sheet['M20'].v > 0 ? 1 : -1) * sheet['M20'].v;
    xlsxCalc(workbook, {continue_after_error: true});
  }

  count = 0;
  let digit = 0.1;
  while (Math.abs(sheet['K29'].v).toFixed(2) !== '0.00') {
    if (++count > 1000) {
      break;
    }

    const flag = sheet['K29'].v > 0 ? 1 : -1;
    sheet['M25'].v = sheet['M25'].v + flag * digit;
    xlsxCalc(workbook, {continue_after_error: true});
    if (sheet['K29'].v > 0 !== (flag === 1)) {
      digit = digit / 10;
    }
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filepath);
  wb.getWorksheet('测算表')!.getCell('K16').value = sheet['K16'].v;
  wb.getWorksheet('测算表')!.getCell('M25').value = sheet['M25'].v;
  await wb.xlsx.writeFile(filepath);
}

