import type ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import XLSX from 'xlsx';
import type {IFormattedInboundData, IFormattedIssuingData} from '../../types';
import {setWrapBorder} from '../../helpers/excel-helper';
import {randomPick, randomRange} from '../../helpers/random';
import {floatUnits} from '../../config';

/**
 * 领料单
 */
export function createIssuing({
  filePath,
  inbound,
  workbook,
}: {
  filePath: string;
  inbound: IFormattedInboundData[][];
  workbook: ExcelJS.Workbook;
}) {
  const source = XLSX.readFile(filePath);
  const worksheet = source.Sheets['材料'];

  // 获取所有单元格数据
  const data = XLSX.utils.sheet_to_json(worksheet, {header: 1});

  const {validData} = washData(data as string[][]);

  const validDataFormatted = formatData(validData, inbound);

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
  validData: IFormattedInboundData[][];
  workbook: ExcelJS.Workbook;
}) {
  const worksheet = workbook.addWorksheet('领料单', {
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
  worksheet.getColumn('A').width = 27.63;
  worksheet.getColumn('B').width = 7.79;
  worksheet.getColumn('C').width = 17.79;
  worksheet.getColumn('D').width = 13.33;
  worksheet.getColumn('E').width = 13.33;

  let row = 1;
  validData.forEach((items, index) => {
    worksheet.mergeCells(`A${row}:E${row}`);
    worksheet.getCell(`A${row}`).value = '领  料  单';
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
    worksheet.getCell(`C${row}`).value =
      '用料部门：生产车间                                 用途：生产';
    setWrapBorder(worksheet.getCell(`A${row}`));
    worksheet.getRow(row).height = 18.75;

    row += 1;
    worksheet.getCell(`A${row}`).value = '材料名称及规格';
    setWrapBorder(worksheet.getCell(`A${row}`));
    worksheet.getCell(`B${row}`).value = '单位';
    setWrapBorder(worksheet.getCell(`B${row}`));
    worksheet.getCell(`C${row}`).value = '数量';
    setWrapBorder(worksheet.getCell(`C${row}`));
    worksheet.getCell(`D${row}`).value = '页次';
    setWrapBorder(worksheet.getCell(`D${row}`));
    worksheet.getCell(`E${row}`).value = '备注';
    setWrapBorder(worksheet.getCell(`E${row}`));
    worksheet.getRow(row).height = 18.75;

    items.forEach(product => {
      row += 1;
      worksheet.getCell(`A${row}`).value = product.product;
      setWrapBorder(worksheet.getCell(`A${row}`));
      worksheet.getCell(`B${row}`).value = product.unit;
      setWrapBorder(worksheet.getCell(`B${row}`));
      worksheet.getCell(`C${row}`).value = floatUnits.includes(product.unit)
        ? Number(product.count.toFixed(3))
        : Number(product.count);
      setWrapBorder(worksheet.getCell(`C${row}`));
      worksheet.getCell(`D${row}`).value = '';
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

function washData(data: string[][]) {
  const countTarget = findTarget(data, '本月发出数');
  const productTarget = findTarget(data, '品名');

  if (!countTarget || !productTarget) throw new Error('未找到目标');
  const slimData = data
    .slice(countTarget[0] + 2)
    .filter(
      item =>
        item && item.length && item[productTarget[1]] && !/合\s*计/.test(item[productTarget[1]]),
    )
    .map(item => ({
      product: item[productTarget[1]]?.trim() || '',
      unit: item[productTarget[1] + 1]?.trim() || '',
      count: Number(item[countTarget[1]]) || 0,
    }))
    .filter(item => item.count) as IFormattedIssuingData[];

  return {validData: slimData};
}

function findTarget(data: string[][], target: string) {
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (!cell) continue;
      if (String(cell).replace(/\s/g, '').includes(target)) {
        return [i, j];
      }
    }
  }
}

function mergeByDate(data: IFormattedInboundData[][]) {
  const result: Record<string, IFormattedInboundData[]> = {};
  data.forEach(items => {
    items.forEach(item => {
      if (result[item.date]) {
        result[item.date].push(item);
      } else {
        result[item.date] = [item];
      }
    });
  });
  return Object.values(result);
}

function formatData(
  slimData: IFormattedIssuingData[],
  inbound: IFormattedInboundData[][],
): IFormattedInboundData[][] {
  const mergedInbound = mergeByDate(inbound);

  const outboundTimeSplitted = splitByInboundTime(slimData, mergedInbound);
  const countSplitted = splitByCount(outboundTimeSplitted);

  return countSplitted;
}

function splitByInboundTime(
  slimData: IFormattedIssuingData[],
  inbound: IFormattedInboundData[][],
): IFormattedIssuingData[][] {
  const result = [];
  const issuingCount = Math.min(inbound.length, randomRange(5, 8));
  const issuingMap: Record<string, IFormattedIssuingData> = slimData.reduce((map, item) => {
    map[`${item.product}_${item.unit}`] = item;
    return map;
  }, {} as Record<string, IFormattedIssuingData>);

  let preUnix = dayjs.unix(inbound[0][0].date).endOf('day').date(9).unix();
  for (let i = 0; i < issuingCount; i++) {
    preUnix = dayjs.unix(preUnix).endOf('day').unix();
    preUnix = dayjs
      .unix(
        Math.min(
          randomRange(preUnix, dayjs.unix(preUnix).add(2, 'day').unix()),
          dayjs.unix(inbound[i][0].date).add(-1, 'day').unix(),
        ),
      )
      .startOf('day')
      .unix();

    if (i === issuingCount - 1) {
      const issuing = Object.values(issuingMap)
        .filter(item => item.count)
        .map(item => ({
          date: preUnix,
          product: item.product,
          unit: item.unit,
          count: item.count,
        }));
      result.push(issuing);
    } else {
      const products = Object.values(issuingMap).filter(item => item.count);
      const randomProducts = randomPick<IFormattedIssuingData>(
        products,
        randomRange(Math.max(1, slimData.length * 0.5), slimData.length),
      );
      const issuing = randomProducts.map(item => {
        const productCount = Math.min(
          randomRange(
            item.count / (issuingCount - i),
            (item.count / (issuingCount - i)) * 2,
            !floatUnits.includes(item.unit),
          ),
          item.count,
        );
        item.count -= productCount;
        return {
          date: preUnix,
          product: item.product,
          unit: item.unit,
          count: productCount,
        };
      });
      result.push(issuing);
    }
  }

  return result;
}

function splitByCount(data: IFormattedInboundData[][]) {
  const result: IFormattedInboundData[][] = [];
  data.forEach(items => {
    const count = Math.ceil(items.length / 7);
    for (let i = 0; i < count; i++) {
      result.push(items.slice(i * 7, (i + 1) * 7));
    }
  });
  return result;
}
