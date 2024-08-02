import dayjs from 'dayjs';
import type ExcelJS from 'exceljs';
import {getStringValue} from '/@/helpers/excel-helper';

export default function handleCalculateFile(workbook: ExcelJS.Workbook) {
  const sheet1 = workbook.getWorksheet('生产成本月结表');
  if (!sheet1) {
    throw new Error('没有找到生产成本月结表');
  }

  sheet1.getCell('A2').value = getStringValue(sheet1.getCell('A2').value).replace(
    /\d{4}\s*年\s*\d{1,2}\s*月/,
    dayjs().format('YYYY年MM月'),
  );

  sheet1.getCell('B5').value = Number(sheet1.getCell('E5').result).toFixed(2);
  sheet1.getCell('B6').value = Number(sheet1.getCell('E6').result).toFixed(2);
  sheet1.getCell('E5').value = undefined;
  sheet1.getCell('E6').value = undefined;

  const sheet2 = workbook.getWorksheet('工资');
  if (!sheet2) {
    throw new Error('工资');
  }

  console.log(sheet2.getCell('A2').value);
  sheet2.getCell('A2').value = getStringValue(sheet2.getCell('A2').value).replace(
    /\d{4}\s*年\s*\d{1,2}\s*月/,
    dayjs().format('YYYY年MM月'),
  );

  const sheet3 = workbook.getWorksheet('材料');
  if (!sheet3) {
    throw new Error('材料');
  }

  sheet3.getCell('A3').value = getStringValue(sheet3.getCell('A3').value).replace(
    /\d{4}\s*年\s*\d{1,2}\s*月/,
    dayjs().format('YYYY年MM月'),
  );
  if (sheet3.getCell('N6').result) {
    sheet3.getCell('E6').value = sheet3.getCell('N6').result;
    sheet3.getCell('D6').value = sheet3.getCell('M6').result;
    sheet3.getCell('C6').value = sheet3.getCell('L6').result;
  }
}
