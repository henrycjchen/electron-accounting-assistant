import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export default async function generateBillArrangement(filePath: string) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  if (!workbook.getWorksheet('信息汇总表')) {
    throw new Error('未找到信息汇总表');
  }
  if (!workbook.getWorksheet('发票基础信息')) {
    throw new Error('未找到发票基础信息');
  }

  // 过滤数据
  handleSourceTable(workbook, '信息汇总表', 'AA');
  handleSourceTable(workbook, '发票基础信息', 'S');

  // 数据处理1
  nineThirteen(workbook);

  // 数据处理2
  six(workbook);

  // 数据处理3
  rest(workbook);

  workbook.clearThemes();
  workbook.xlsx.writeFile(filePath.replace('.xlsx', '-处理后.xlsx'));
}

function handleSourceTable(workbook: ExcelJS.Workbook, sheetName: string, sourceColumnIndex: string) {
  const worksheet = workbook.getWorksheet(sheetName)!;
  const newSheet = workbook.addWorksheet(sheetName + '-处理后')!;
  const issueMap: Record<string, {source: string; deleted: boolean}> = {};
  newSheet.addRow(worksheet.getRow(1).values);

  for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
    const row = worksheet.getRow(rowNum);
    const matched = (row.getCell(sourceColumnIndex).value as string)?.match(
      /被红冲蓝字数电票号码：(\d+)/,
    );
    if (matched && !issueMap[matched[1]]) {
      issueMap[matched[1]] = {
        source: row.getCell(sourceColumnIndex).value as string,
        deleted: false,
      };
    } else if (issueMap[row.getCell('D').value as string]) {
      issueMap[row.getCell('D').value as string].deleted = true;
    }
  }

  for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
    const row = worksheet.getRow(rowNum);
    const matched = (row.getCell(sourceColumnIndex).value as string)?.match(
      /被红冲蓝字数电票号码：(\d+)/,
    );
    if (matched) {
      if (!issueMap[matched[1]].deleted) {
        newSheet.addRow(row.values);
      }
    } else if (!issueMap[row.getCell('D').value as string]) {
      newSheet.addRow(row.values);
    }
  }
}

function nineThirteen(workbook: ExcelJS.Workbook) {
  const billNumMap: Record<string, boolean> = {};
  const sourceSheet1 = workbook.getWorksheet('信息汇总表-处理后')!;
  const sheet1 = workbook.addWorksheet('信息汇总表9%13%专票')!;
  sheet1.addRow(sourceSheet1.getRow(1).values);

  for (let rowNum = 2; rowNum <= sourceSheet1.rowCount; rowNum++) {
    const row = sourceSheet1.getRow(rowNum);
    const taxRate = row.getCell('R').value as string | number;
    const taxType = row.getCell('V').value as string | number;
    if (['9%', 0.09, '13%', 0.13].includes(taxRate) && taxType === '数电票（增值税专用发票）') {
      billNumMap[row.getCell('D').value as string] = true;
      sheet1.addRow(row.values);
    }
  }

  const sourceSheet2 = workbook.getWorksheet('发票基础信息-处理后')!;
  const sheet2 = workbook.addWorksheet('发票基础信息9%13%专票')!;
  sheet2.addRow(sourceSheet2.getRow(1).values);

  for (let rowNum = 2; rowNum <= sourceSheet2.rowCount; rowNum++) {
    const row = sourceSheet2.getRow(rowNum);
    if (billNumMap[row.getCell('D').value as string]) {
      sheet2.addRow(row.values);
    }
  }
}

function six(workbook: ExcelJS.Workbook) {
  const billNumMap: Record<string, boolean> = {};
  const sourceSheet1 = workbook.getWorksheet('信息汇总表-处理后')!;
  const sheet1 = workbook.addWorksheet('信息汇总表6%专票')!;
  sheet1.addRow(sourceSheet1.getRow(1).values);

  for (let rowNum = 2; rowNum <= sourceSheet1.rowCount; rowNum++) {
    const row = sourceSheet1.getRow(rowNum);
    const taxRate = row.getCell('R').value as string | number;
    if (['6%', 0.06].includes(taxRate)) {
      billNumMap[row.getCell('D').value as string] = true;
      sheet1.addRow(row.values);
    }
  }

  const sourceSheet2 = workbook.getWorksheet('发票基础信息-处理后')!;
  const sheet2 = workbook.addWorksheet('发票基础信息6%专票')!;
  sheet2.addRow(sourceSheet2.getRow(1).values);

  for (let rowNum = 2; rowNum <= sourceSheet2.rowCount; rowNum++) {
    const row = sourceSheet2.getRow(rowNum);
    if (billNumMap[row.getCell('D').value as string]) {
      sheet2.addRow(row.values);
    }
  }
}

function rest(workbook: ExcelJS.Workbook) {
  const billNumMap: Record<string, boolean> = {};
  const sourceSheet1 = workbook.getWorksheet('信息汇总表-处理后')!;
  const sheet1 = workbook.addWorksheet('信息汇总表普票')!;
  sheet1.addRow(sourceSheet1.getRow(1).values);

  for (let rowNum = 2; rowNum <= sourceSheet1.rowCount; rowNum++) {
    const row = sourceSheet1.getRow(rowNum);
    const taxRate = row.getCell('R').value as string | number;
    const taxType = row.getCell('V').value as string | number;
    if (!['6%', 0.06].includes(taxRate) && !(['9%', 0.09, '13%', 0.13].includes(taxRate) && taxType === '数电票（增值税专用发票）')) {
      billNumMap[row.getCell('D').value as string] = true;
      sheet1.addRow(row.values);
    }
  }

  const sourceSheet2 = workbook.getWorksheet('发票基础信息-处理后')!;
  const sheet2 = workbook.addWorksheet('发票基础信息普票')!;
  sheet2.addRow(sourceSheet2.getRow(1).values);

  for (let rowNum = 2; rowNum <= sourceSheet2.rowCount; rowNum++) {
    const row = sourceSheet2.getRow(rowNum);
    if (billNumMap[row.getCell('D').value as string]) {
      sheet2.addRow(row.values);
    }
  }
}
