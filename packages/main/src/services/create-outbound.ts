import type ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import XLSX from 'xlsx';
import type {IFormattedOutboundData} from '../types';
import {setWrapBorder} from '../helpers/excel-helper';
import {floatUnits, invalidProductTypes} from '../config';

/**
 * 出库凭证
 */
export function createOutbound({
  workbook,
  filePath,
}: {
  workbook: ExcelJS.Workbook;
  filePath: string;
}) {
  const source = XLSX.readFile(filePath);
  const sheetName = source.SheetNames[0];
  const worksheet = source.Sheets[sheetName];

  // 获取所有单元格数据
  const data = XLSX.utils.sheet_to_json(worksheet, {header: 1});

  const {validData, invalidData} = washData(data as string[][]);

  const validDataFormatted = formatData(validData);

  action({
    validData: validDataFormatted,
    invalidData: formatData(invalidData),
    workbook,
  });

  return validDataFormatted;
}

function action({
  validData,
  invalidData,
  workbook,
}: {
  validData: IFormattedOutboundData[][];
  invalidData: IFormattedOutboundData[][];
  workbook: ExcelJS.Workbook;
}) {
  const worksheet = workbook.addWorksheet('出库凭证', {
    properties: {
      defaultRowHeight: 16,
    },
    pageSetup: {
      scale: 9,
      horizontalCentered: true,
    },
  });
  worksheet.getColumn('A').width = 20;
  worksheet.getColumn('B').width = 18.17;
  worksheet.getColumn('C').width = 20;
  worksheet.getColumn('D').width = 4.33;
  worksheet.getColumn('E').width = 20;

  let row = 1;
  validData.forEach((items, index) => {
    worksheet.mergeCells(`A${row}:E${row}`);
    worksheet.getCell(`A${row}`).value = '出  库  凭  证';
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
    worksheet.mergeCells(`A${row}:B${row}`);
    worksheet.getCell(`A${row}`).value = `领取人：${items[0].buyCompany}`;
    worksheet.getCell(`A${row}`).alignment = {
      vertical: 'middle',
      wrapText: true,
    };
    worksheet.getCell(`C${row}`).value = dayjs.unix(items[0].date).format('YYYY年MM月DD日');
    worksheet.getCell(`C${row}`).alignment = {
      vertical: 'middle',
    };
    worksheet.getRow(row).height = 30;

    row += 1;
    worksheet.getCell(`A${row}`).value = '用途';
    setWrapBorder(worksheet.getCell(`A${row}`));
    worksheet.getCell(`B${row}`).value = '品名';
    setWrapBorder(worksheet.getCell(`B${row}`));
    worksheet.getCell(`C${row}`).value = '规格';
    setWrapBorder(worksheet.getCell(`C${row}`));
    worksheet.getCell(`D${row}`).value = '单位';
    setWrapBorder(worksheet.getCell(`D${row}`));
    worksheet.getCell(`E${row}`).value = '数量';
    setWrapBorder(worksheet.getCell(`E${row}`));
    worksheet.getRow(row).height = 18.75;

    items.forEach((product, index) => {
      row += 1;
      if (index === 0) {
        worksheet.getCell(`A${row}`).value = '销售';
      } else {
        worksheet.getCell(`A${row}`).value = '';
      }
      setWrapBorder(worksheet.getCell(`A${row}`));
      worksheet.getCell(`B${row}`).value = product.product;
      setWrapBorder(worksheet.getCell(`B${row}`));
      worksheet.getCell(`C${row}`).value = '';
      setWrapBorder(worksheet.getCell(`C${row}`));
      worksheet.getCell(`D${row}`).value = product.unit;
      setWrapBorder(worksheet.getCell(`D${row}`));
      worksheet.getCell(`E${row}`).value = floatUnits.includes(product.unit)
        ? Number(product.count.toFixed(3))
        : Number(product.count);
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
    worksheet.mergeCells(`A${row}:D${row}`);
    worksheet.getCell(`A${row}`).value = `合${' '.repeat(20)}计`;
    setWrapBorder(worksheet.getCell(`A${row}`));
    setWrapBorder(worksheet.getCell(`E${row}`));
    worksheet.getRow(row).height = 18.75;

    row += 1;
    worksheet.mergeCells(`A${row}:E${row}`);
    worksheet.getCell(`A${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'right',
    };
    worksheet.getCell(`A${row}`).value = `保管人：陈${' '.repeat(20)}`;
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
  invalidData.forEach((items, index) => {
    worksheet.mergeCells(`H${row}:L${row}`);
    worksheet.getCell(`H${row}`).value = '入  库  凭  证';
    worksheet.getCell(`H${row}`).font = {
      bold: true,
      size: 22,
    };
    worksheet.getCell(`H${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getCell(`H${row}`).border = {
      bottom: {style: 'double'},
    };
    worksheet.getRow(row).height = 37.5;

    row += 1;
    worksheet.mergeCells(`H${row}:I${row}`);
    worksheet.getCell(`H${row}`).value = `送货人：${items[0].buyCompany}`;
    worksheet.getCell(`H${row}`).alignment = {
      vertical: 'middle',
      wrapText: true,
    };
    worksheet.getCell(`J${row}`).value = dayjs.unix(items[0].date).format('YYYY年MM月DD日');
    worksheet.getCell(`J${row}`).alignment = {
      vertical: 'middle',
    };
    worksheet.getRow(row).height = 30;

    row += 1;
    worksheet.getCell(`H${row}`).value = '用途';
    setWrapBorder(worksheet.getCell(`H${row}`));
    worksheet.getCell(`I${row}`).value = '品名';
    setWrapBorder(worksheet.getCell(`I${row}`));
    worksheet.getCell(`J${row}`).value = '规格';
    setWrapBorder(worksheet.getCell(`J${row}`));
    worksheet.getCell(`K${row}`).value = '单位';
    setWrapBorder(worksheet.getCell(`K${row}`));
    worksheet.getCell(`L${row}`).value = '数量';
    setWrapBorder(worksheet.getCell(`L${row}`));
    worksheet.getRow(row).height = 18.75;

    items.forEach((product, index) => {
      row += 1;
      if (index === 0) {
        worksheet.getCell(`H${row}`).value = '退货入库';
      } else {
        worksheet.getCell(`H${row}`).value = '';
      }
      setWrapBorder(worksheet.getCell(`H${row}`));
      worksheet.getCell(`I${row}`).value = product.product;
      setWrapBorder(worksheet.getCell(`I${row}`));
      worksheet.getCell(`J${row}`).value = '';
      setWrapBorder(worksheet.getCell(`J${row}`));
      worksheet.getCell(`K${row}`).value = product.unit;
      setWrapBorder(worksheet.getCell(`K${row}`));
      worksheet.getCell(`L${row}`).value = -Number(product.count);
      setWrapBorder(worksheet.getCell(`L${row}`));
      worksheet.getRow(row).height = 18.75;
    });

    for (let i = items.length; i < 7; i++) {
      row += 1;
      setWrapBorder(worksheet.getCell(`H${row}`));
      setWrapBorder(worksheet.getCell(`I${row}`));
      setWrapBorder(worksheet.getCell(`J${row}`));
      setWrapBorder(worksheet.getCell(`K${row}`));
      setWrapBorder(worksheet.getCell(`L${row}`));
      worksheet.getRow(row).height = 18.75;
    }

    row += 1;
    worksheet.mergeCells(`H${row}:K${row}`);
    worksheet.getCell(`H${row}`).value = `合${' '.repeat(20)}计`;
    setWrapBorder(worksheet.getCell(`H${row}`));
    setWrapBorder(worksheet.getCell(`L${row}`));
    worksheet.getRow(row).height = 18.75;

    row += 1;
    worksheet.mergeCells(`H${row}:L${row}`);
    worksheet.getCell(`H${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'right',
    };
    worksheet.getCell(`H${row}`).value = `保管人：陈${' '.repeat(20)}`;
    worksheet.getRow(row).height = 23.25;

    if (index % 2 === 0) {
      row += 11;
    } else {
      row += 3;
    }
  });
}

function washData(data: string[][]) {
  const slimData = data
    .slice(1)
    .filter(item => item && item.length)
    .map(item => ({
      code: item[3]?.trim() || '',
      sellCompany: item[5]?.trim() || '',
      buyCompany: item[7]?.trim() || '',
      date: dayjs(item[8]?.trim()).startOf('day').unix(),
      product:
        item[11]
          ?.trim()
          .split('*')[2]
          .match(/([a-zA-Z0-9-+\u4e00-\u9fa5]+)/)?.[1] || '',
      productType: item[11]?.trim().split('*')[1] || '',
      unit: item[13]?.trim() || '',
      count: Number(item[14]) || 0,
      notes: item[26]?.trim() || '',
    })) as IFormattedOutboundData[];

  const invalidCodes = slimData.reduce((acc, item) => {
    const code = item.notes.match(/(\d+)/)?.[0];
    if (item.notes.includes('被红冲蓝字') && code) {
      acc.push(code);
    }
    return acc;
  }, [] as string[]);

  const validData = [];
  const invalidData = [];
  for (const item of slimData) {
    if (
      invalidProductTypes.includes(item.productType) ||
      item.notes.includes('被红冲蓝字') ||
      invalidCodes.includes(item.code)
    ) {
      if (
        item.notes.includes('被红冲蓝字') &&
        !slimData.some(obj => obj.code.length && obj.code === item.notes.match(/(\d+)/)?.[0])
      ) {
        invalidData.push(item);
      }
    } else {
      validData.push(item);
    }
  }

  return {validData, invalidData};
}

function formatData(slimData: IFormattedOutboundData[]): IFormattedOutboundData[][] {
  const companySplitted = mergeByCompany(slimData);
  const dateSplitted = splitByDate(companySplitted);
  const countMerged = mergeCounts(dateSplitted);
  const countSplitted = splitByCount(countMerged);
  const dateSorted = sortByDate(countSplitted);

  return dateSorted;
}

function mergeByCompany(data: IFormattedOutboundData[]) {
  const map: Record<string, IFormattedOutboundData[]> = {};
  data.forEach(item => {
    if (map[item.buyCompany]) {
      map[item.buyCompany].push(item);
    } else {
      map[item.buyCompany] = [item];
    }
  });
  return Object.values(map);
}

function splitByDate(data: IFormattedOutboundData[][]) {
  const dateSortedData = data.map(items => items.sort((a, b) => a.date - b.date));
  const result: IFormattedOutboundData[][] = [];
  dateSortedData.forEach(items => {
    const map: Record<string, IFormattedOutboundData[]> = {};
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

function sortByDate(data: IFormattedOutboundData[][]) {
  return data.sort((a, b) => a[0].date - b[0].date);
}

function mergeCounts(data: IFormattedOutboundData[][]) {
  return data.map(items => {
    const map: Record<string, IFormattedOutboundData> = {};
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

function splitByCount(data: IFormattedOutboundData[][]) {
  const result: IFormattedOutboundData[][] = [];
  data.forEach(items => {
    const count = Math.ceil(items.length / 7);
    for (let i = 0; i < count; i++) {
      result.push(items.slice(i * 7, (i + 1) * 7));
    }
  });
  return result;
}
