import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import fs from 'fs';
import handleCalculateFile from './handle-calculate-file';

export async function generateCalculateFile(files: Record<string, string>) {
  const resultFileName = files.calculate.replace(/\d{4}/, dayjs().add(-1, 'month').format('YYMM'));

  fs.copyFileSync(files.calculate, resultFileName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(resultFileName);

  await handleCalculateFile(workbook, files);
  workbook.xlsx.writeFile(resultFileName);
}
