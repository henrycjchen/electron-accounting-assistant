import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import handleCalculateFile from './handle-calculate-file';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export async function generateCalculateFile(files: Record<string, string>) {
  const dayStr = files.calculate.match(/\d{4}/)?.[0];
  const day = dayjs(dayStr, 'YYMM');
  const resultFileName = files.calculate.replace(/\d{4}/, day.add(1, 'month').format('YYMM'));

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(files.calculate);

  await handleCalculateFile(workbook, files);
  await workbook.xlsx.writeFile(resultFileName);
}
