import type ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import type {IFormattedMaterialData, IFormattedInboundInvoicesData} from '../../types';
import {setWrapBorder} from '../../helpers/excel-helper';
import {randomRange} from '../../helpers/random';
import {floatUnits} from '../../config';
import handleInboundData from '../common/handleInboundData';

/**
 * 收料单
 */
export function createReceiving({
  filePath,
  issuing,
  workbook,
}: {
  filePath: string;
  issuing: IFormattedMaterialData[][];
  workbook: ExcelJS.Workbook;
}) {
  const {validData} = handleInboundData(filePath);

  const validDataFormatted = formatData(validData, issuing);

  action({
    validData: validDataFormatted,
    workbook,
  });

  return validDataFormatted;
}

function action({
  validData,
  workbook,
}: {
  validData: IFormattedInboundInvoicesData[][];
  workbook: ExcelJS.Workbook;
}) {
  const worksheet = workbook.addWorksheet('收料单', {
    properties: {
      defaultRowHeight: 16,
    },
    pageSetup: {
      fitToPage: true,
      fitToHeight: 0,
      fitToWidth: 1,
      paperSize: 9,
      horizontalCentered: true,
    },
  });
  worksheet.getColumn('A').width = 36.75;
  worksheet.getColumn('B').width = 18.93;
  worksheet.getColumn('C').width = 8.14;
  worksheet.getColumn('D').width = 13.33;
  worksheet.getColumn('E').width = 8.33;

  let row = 1;
  validData.forEach((items, index) => {
    worksheet.mergeCells(`A${row}:E${row}`);
    worksheet.getCell(`A${row}`).value = '收  料  单';
    worksheet.getCell(`A${row}`).font = {
      bold: true,
      size: 22,
    };
    worksheet.getCell(`A${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getCell(`A${row}`).border = {
      bottom: {style: 'double'},
    };
    worksheet.getRow(row).height = 37.5;

    row += 1;
    worksheet.mergeCells(`A${row}:E${row}`);
    worksheet.getCell(`C${row}`).value = dayjs.unix(items[0].date).format('YYYY年MM月DD日');
    worksheet.getCell(`C${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getRow(row).height = 30;

    row += 1;
    worksheet.mergeCells(`A${row}:E${row}`);
    worksheet.getCell(`A${row}`).value = `供应者：${items[0].sellCompany}`;
    setWrapBorder(worksheet.getCell(`A${row}`));
    worksheet.getCell(`A${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'left',
    };
    worksheet.getRow(row).height = 18.75;

    row += 1;
    worksheet.getCell(`A${row}`).value = '材料名称';
    setWrapBorder(worksheet.getCell(`A${row}`));
    worksheet.getCell(`B${row}`).value = '规格';
    setWrapBorder(worksheet.getCell(`B${row}`));
    worksheet.getCell(`C${row}`).value = '数量';
    setWrapBorder(worksheet.getCell(`C${row}`));
    worksheet.getCell(`D${row}`).value = '单位';
    setWrapBorder(worksheet.getCell(`D${row}`));
    worksheet.getCell(`E${row}`).value = '备注';
    setWrapBorder(worksheet.getCell(`E${row}`));
    worksheet.getRow(row).height = 18.75;

    items.forEach(product => {
      row += 1;
      worksheet.getCell(`A${row}`).value = product.product;
      setWrapBorder(worksheet.getCell(`A${row}`));
      worksheet.getCell(`B${row}`).value = product.specification;
      setWrapBorder(worksheet.getCell(`B${row}`));
      worksheet.getCell(`C${row}`).value = floatUnits.includes(product.unit)
        ? Number(product.count.toFixed(3))
        : Number(product.count);
      setWrapBorder(worksheet.getCell(`C${row}`));
      worksheet.getCell(`D${row}`).value = product.unit;
      setWrapBorder(worksheet.getCell(`D${row}`));
      worksheet.getCell(`E${row}`).value = '';
      setWrapBorder(worksheet.getCell(`E${row}`));
      worksheet.getRow(row).height = 18.75;
    });
    for (let i = items.length; i < 7; i++) {
      row += 1;
      setWrapBorder(worksheet.getCell(`A${row}`));
      setWrapBorder(worksheet.getCell(`B${row}`));
      setWrapBorder(worksheet.getCell(`C${row}`));
      setWrapBorder(worksheet.getCell(`D${row}`));
      setWrapBorder(worksheet.getCell(`E${row}`));
      worksheet.getRow(row).height = 18.75;
    }

    row += 1;
    worksheet.mergeCells(`A${row}:E${row}`);
    worksheet.getCell(`A${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'right',
    };
    worksheet.getCell(`A${row}`).value = `记账：陈${' '.repeat(20)}`;
    worksheet.getRow(row).height = 23.25;

    if (index % 2 === 0) {
      row += 11;
    } else {
      row += 3;
    }
  });

  worksheet.getColumn('H').width = 20;
  worksheet.getColumn('I').width = 18.17;
  worksheet.getColumn('J').width = 20;
  worksheet.getColumn('K').width = 4.33;
  worksheet.getColumn('L').width = 20;
  row = 1;
}

function formatData(
  slimData: IFormattedInboundInvoicesData[],
  issuing: IFormattedMaterialData[][],
): IFormattedInboundInvoicesData[][] {
  const companySplitted = mergeByCompany(slimData);
  const dateSplitted = splitByDate(companySplitted);
  const countMerged = mergeCounts(dateSplitted);
  const countSplitted = splitByCount(countMerged);

  const dateRewritten = rewriteDate(countSplitted, issuing);
  const dateSorted = sortByDate(dateRewritten);

  return dateSorted;
}

function mergeByCompany(data: IFormattedInboundInvoicesData[]) {
  const map: Record<string, IFormattedInboundInvoicesData[]> = {};
  data.forEach(item => {
    if (map[item.sellCompany]) {
      map[item.sellCompany].push(item);
    } else {
      map[item.sellCompany] = [item];
    }
  });
  return Object.values(map);
}

function splitByDate(data: IFormattedInboundInvoicesData[][]) {
  const dateSortedData = data.map(items => items.sort((a, b) => a.date - b.date));
  const result: IFormattedInboundInvoicesData[][] = [];
  dateSortedData.forEach(items => {
    const map: Record<string, IFormattedInboundInvoicesData[]> = {};
    items.forEach(item => {
      if (map[item.date]) {
        map[item.date].push(item);
      } else {
        map[item.date] = [item];
      }
    });
    result.push(...Object.values(map));
  });
  return result;
}

function sortByDate(data: IFormattedInboundInvoicesData[][]) {
  return data.sort((a, b) => a[0].date - b[0].date);
}

function mergeCounts(data: IFormattedInboundInvoicesData[][]) {
  return data.map(items => {
    const map: Record<string, IFormattedInboundInvoicesData> = {};
    items.sort((a, b) => a.product.localeCompare(b.product, 'zh-Hans-CN', {sensitivity: 'accent'}));
    items.forEach(item => {
      if (map[`${item.product}_${item.unit}`]) {
        map[`${item.product}_${item.unit}`].count += item.count;
      } else {
        map[`${item.product}_${item.unit}`] = item;
      }
    });
    return Object.values(map);
  });
}

function splitByCount(data: IFormattedInboundInvoicesData[][]) {
  const result: IFormattedInboundInvoicesData[][] = [];
  data.forEach(items => {
    const count = Math.ceil(items.length / 7);
    for (let i = 0; i < count; i++) {
      result.push(items.slice(i * 7, (i + 1) * 7));
    }
  });
  return result;
}

function rewriteDate(data: IFormattedInboundInvoicesData[][], issuing: IFormattedMaterialData[][]) {
  const start = dayjs.unix(issuing[0][0].date).startOf('month').unix();
  const lastUnix = dayjs.unix(issuing[0][0].date).add(-1, 'day').endOf('day').unix();

  data.forEach(items => {
    items.forEach(item => {
      item.date = randomRange(start, lastUnix);
    });
  });

  return data;
}
