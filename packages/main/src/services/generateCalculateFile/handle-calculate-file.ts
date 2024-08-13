import dayjs from 'dayjs';
import type ExcelJS from 'exceljs';
import {getStringValue} from '/@/helpers/excel-helper';
import type {IFormattedInboundInvoicesData, IFormattedOutboundInvoicesData} from '/@/types';
import handleInboundData from '../common/handleInboundData';
import handleOutboundData from '../common/handleOutboundData';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export default function handleCalculateFile(
  workbook: ExcelJS.Workbook,
  files: Record<string, string>,
) {
  handleCost(workbook);

  handleSalary(workbook);

  const inboundData = getInboundData(files.inboundInvoices);
  handleMaterial(workbook, inboundData);

  const outboundData = getOutboundData(files.outboundInvoices);
  handleSell(workbook, outboundData);

  handleMainPage(workbook, outboundData);

  handleCostAccounting(workbook);
}

function handleCost(workbook: ExcelJS.Workbook) {
  const sheet = workbook.getWorksheet('生产成本月结表');
  if (!sheet) {
    throw new Error('没有找到生产成本月结表');
  }

  const day = dayjs(getStringValue(sheet.getCell('D2').value), 'YYYY年MM月份');
  sheet.getCell('D2').value = day.add(1, 'month').format('YYYY年MM月份');
  console.log('day',day, day.add(1, 'month').format('YYYY年MM月份'));

  sheet.getCell('B5').value = Number(Number(sheet.getCell('E5').result).toFixed(2));
  sheet.getCell('B6').value = Number(Number(sheet.getCell('E6').result).toFixed(2));
}

function handleSalary(workbook: ExcelJS.Workbook) {
  const sheet = workbook.getWorksheet('工资');
  if (!sheet) {
    throw new Error('没有找到工资表');
  }

  const day = dayjs(getStringValue(sheet.getCell('A3').value), 'YYYY年MM月份');
  sheet.getCell('A3').value = day.add(1, 'month').format('YYYY年MM月份');

  sheet.getCell('A2').value = getStringValue(sheet.getCell('A2').value).replace(
    /\d{4}\s*年\s*\d{1,2}\s*月/,
    dayjs().add(-1, 'month').format('YYYY年MM月'),
  );
}

function handleMaterial(
  workbook: ExcelJS.Workbook,
  inboundData: Record<string, IFormattedInboundInvoicesData>,
) {
  const sheet = workbook.getWorksheet('材料');
  if (!sheet) {
    throw new Error('没有找到材料表');
  }

  const day = dayjs(getStringValue(sheet.getCell('H3').value), 'YYYY年MM月份');
  sheet.getCell('H3').value = day.add(1, 'month').format('YYYY年MM月份');

  let currentRow = 6;
  while (
    !sheet
      .getCell(`A${currentRow}`)
      .value?.toString()
      .match(/合\s*计/)
  ) {
    if (sheet.getCell(`N${currentRow}`).result) {
      sheet.getCell(`C${currentRow}`).value = sheet.getCell(`L${currentRow}`).result;
      sheet.getCell(`D${currentRow}`).value = sheet.getCell(`M${currentRow}`).result;
      sheet.getCell(`E${currentRow}`).value = sheet.getCell(`N${currentRow}`).result;
    }
    const product =
      inboundData[
        `${sheet.getCell(`A${currentRow}`).value}_${sheet.getCell(`B${currentRow}`).value}`
      ];
    if (product) {
      sheet.getCell(`F${currentRow}`).value = product.count;
      sheet.getCell(`H${currentRow}`).value = product.price;
      sheet.getCell(`G${currentRow}`).value = Number((product.price / product.count).toFixed(2));
    }
    currentRow++;
  }
}

function handleSell(
  workbook: ExcelJS.Workbook,
  outboundData: Record<string, IFormattedOutboundInvoicesData>,
) {
  const sheet = workbook.getWorksheet('销售成本');
  if (!sheet) {
    throw new Error('没有找到销售成本表');
  }

  const day = dayjs(getStringValue(sheet.getCell('F2').value), 'YYYY年MM月份');
  sheet.getCell('F2').value = day.add(1, 'month').format('YYYY年MM月份');

  let currentRow = 5;
  while (
    !sheet
      .getCell(`A${currentRow}`)
      .value?.toString()
      .match(/合\s*计/)
  ) {
    if (sheet.getCell(`L${currentRow}`).result) {
      sheet.getCell(`B${currentRow}`).value = sheet.getCell(`K${currentRow}`).result;
      sheet.getCell(`C${currentRow}`).value = sheet.getCell(`L${currentRow}`).result;
    }
    const names = sheet
      .getCell(`A${currentRow}`)
      .value?.toString()
      .match(/(.+)（(.+)）/);
    if (names) {
      const productName = `${names[1]}_${names[2]}`;
      const product = outboundData[productName];
      if (product) {
        sheet.getCell(`D${currentRow}`).value = product.count;
        sheet.getCell(`E${currentRow}`).value = product.price;
      }
    }
    currentRow++;
  }
}

function handleCostAccounting(workbook: ExcelJS.Workbook) {
  const sheet = workbook.getWorksheet('成本核算表');
  if (!sheet) {
    throw new Error('没有找到成本核算表');
  }

  const day = dayjs(getStringValue(sheet.getCell('D2').value), 'YYYY年MM月份');
  sheet.getCell('D2').value = day.add(1, 'month').format('YYYY年MM月份');
}

function handleMainPage(
  workbook: ExcelJS.Workbook,
  outboundData: Record<string, IFormattedOutboundInvoicesData>,
) {
  const sheet = workbook.getWorksheet('测算表');
  if (!sheet) {
    throw new Error('没有找到测算表');
  }

  sheet.getCell('E3').value = Object.values(outboundData).reduce((acc, item) => acc + item.tax, 0);
  sheet.getCell('D11').value = sheet.getCell('G11').result;
}

function getInboundData(filePath: string) {
  const washedData = handleInboundData(filePath);
  const mergedData = formatInvoicesData(washedData.validData);
  return mergedData as Record<string, IFormattedInboundInvoicesData>;
}

function formatInvoicesData(
  slimData: (IFormattedInboundInvoicesData | IFormattedOutboundInvoicesData)[],
): Record<string, IFormattedInboundInvoicesData | IFormattedOutboundInvoicesData> {
  const map: Record<string, IFormattedInboundInvoicesData | IFormattedOutboundInvoicesData> = {};
  slimData.forEach(item => {
    if (!map[`${item.product}_${item.unit}`]) {
      map[`${item.product}_${item.unit}`] = item;
    } else {
      map[`${item.product}_${item.unit}`].count += item.count;
      map[`${item.product}_${item.unit}`].price += item.price;
      map[`${item.product}_${item.unit}`].tax += item.tax;
    }
  });
  return map;
}

function getOutboundData(filePath: string) {
  const washedData = handleOutboundData(filePath);
  const mergedData = formatInvoicesData(washedData.validData);
  return mergedData as Record<string, IFormattedOutboundInvoicesData>;
}
