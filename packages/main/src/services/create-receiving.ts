import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import XLSX from 'xlsx';
import type {IFormattedIssuingData, IFormattedReceivingData} from '../types';
import {setWrapBorder} from '../helpers/excel-helper';
import {randomRange} from '../helpers/random';

const invalidProductType = ['劳务'];

/**
 * 收料单
 */
export function createReceiving({
  filePath,
  issuing,
  dirname,
}: {
  filePath: string;
  issuing: IFormattedIssuingData[][];
  dirname:string;
}) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // 获取所有单元格数据
  const data = XLSX.utils.sheet_to_json(worksheet, {header: 1});

  const {validData} = washData(data as string[][]);

  const validDataFormatted = formatData(validData, issuing);

  action({
    validData: validDataFormatted,
    filePath: dirname + '/收料单.xlsx',
  });

  return validDataFormatted;
}

function action({validData, filePath}: {validData: IFormattedReceivingData[][]; filePath: string}) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('收料单', {
    properties: {
      defaultRowHeight: 16,
    },
    pageSetup: {
      paperSize: 9,
      horizontalCentered: true,
    },
  });
  worksheet.getColumn('A').width = 24.67;
  worksheet.getColumn('B').width = 9.33;
  worksheet.getColumn('C').width = 14;
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
    worksheet.getCell(`A${row}`).value =
      `供应者：${items[0].sellCompany}`;
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
      worksheet.getCell(`C${row}`).value = product.count.toFixed(3);
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

  return workbook.xlsx.writeFile(filePath);
}

function washData(data: string[][]) {
  const slimData = data
    .slice(1)
    .filter(item => item && item.length)
    .map(item => ({
      sellCompany: item[5]?.trim() || '',
      product: item[11]?.trim().split('*')[2] || '',
      productType: item[11]?.trim().split('*')[1] || '',
      specification: item[12]?.trim() || '',
      unit: item[13]?.trim() || '',
      date: dayjs(item[8]).startOf('day').unix(),
      count: Number(item[14]) || 0,
    }))
    .filter(item => !invalidProductType.includes(item.productType))
    .sort((a, b) => a.date - b.date) as IFormattedReceivingData[];

  return {validData: slimData};
}

function formatData(
  slimData: IFormattedReceivingData[],
  issuing: IFormattedIssuingData[][],
): IFormattedReceivingData[][] {
  const companySplitted = mergeByCompany(slimData);
  const dateSplitted = splitByDate(companySplitted);
  const countMerged = mergeCounts(dateSplitted);
  const countSplitted = splitByCount(countMerged);
  
  const dateRewritten = rewriteDate(countSplitted, issuing);
  const dateSorted = sortByDate(dateRewritten);

  return dateSorted;
}

function mergeByCompany(data: IFormattedReceivingData[]) {
  const map: Record<string, IFormattedReceivingData[]> = {};
  data.forEach(item => {
    if (map[item.sellCompany]) {
      map[item.sellCompany].push(item);
    } else {
      map[item.sellCompany] = [item];
    }
  });
  return Object.values(map);
}

function splitByDate(data: IFormattedReceivingData[][]) {
  const dateSortedData = data.map(items => items.sort((a, b) => a.date - b.date));
  const result: IFormattedReceivingData[][] = [];
  dateSortedData.forEach(items => {
    const map: Record<string, IFormattedReceivingData[]> = {};
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

function sortByDate(data: IFormattedReceivingData[][]) {
  return data.sort((a, b) => a[0].date - b[0].date);
}

function mergeCounts(data: IFormattedReceivingData[][]) {
  return data.map(items => {
    const map: Record<string, IFormattedReceivingData> = {};
    items.sort((a, b) => a.product.localeCompare(b.product, 'zh-Hans-CN', {sensitivity: 'accent'}));
    items.forEach(item => {
      if (map[item.product]) {
        map[item.product].count += item.count;
      } else {
        map[item.product] = item;
      }
    });
    return Object.values(map);
  });
}

function splitByCount(data: IFormattedReceivingData[][]) {
  const result: IFormattedReceivingData[][] = [];
  data.forEach(items => {
    const count = Math.ceil(items.length / 7);
    for (let i = 0; i < count; i++) {
      result.push(items.slice(i * 7, (i + 1) * 7));
    }
  });
  return result;
}

function rewriteDate(data: IFormattedReceivingData[][], issuing: IFormattedIssuingData[][]) {
  const start = dayjs.unix(issuing[0][0].date).startOf('month').unix();
  const lastUnix = dayjs.unix(issuing[0][0].date).add(-1, 'day').endOf('day').unix();

  data.forEach(items => {
    items.forEach(item => {
      item.date = randomRange(start, lastUnix);
    });
  });

  return data;
}
