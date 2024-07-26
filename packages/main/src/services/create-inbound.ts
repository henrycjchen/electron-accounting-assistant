import type ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import XLSX from 'xlsx';
import type {IFormattedOutboundData, IFormattedInboundData} from '../types';
import {setWrapBorder} from '../helpers/excel-helper';
import {randomPick, randomRange} from '../helpers/random';
import {floatUnits} from '../config';

/**
 * 入库凭证
 */
export function createInbound({
  filePath,
  outbound,
  workbook,
}: {
  filePath: string;
  outbound: IFormattedOutboundData[][];
  workbook: ExcelJS.Workbook;
}) {
  const source = XLSX.readFile(filePath);
  const worksheet = source.Sheets['销售成本'];

  // 获取所有单元格数据
  const data = XLSX.utils.sheet_to_json(worksheet, {header: 1});

  const {validData} = washData(data as string[][]);

  const validDataFormatted = formatData(validData, outbound);

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
  const worksheet = workbook.addWorksheet('入库凭证', {
    properties: {
      defaultRowHeight: 16,
    },
    pageSetup: {
      paperSize: 9,
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
    worksheet.getCell(`A${row}`).value = '入  库  凭  证';
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
    worksheet.getCell(`A${row}`).value = '领取人：生产车间';
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
        worksheet.getCell(`A${row}`).value = '生产';
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
}

function washData(data: string[][]) {
  const countTarget = findTarget(data, '本期生产');
  const productTarget = findTarget(data, '品名');

  if (!countTarget || !productTarget) throw new Error('未找到目标');
  const slimData = data
    .slice(countTarget[0] + 2)
    .filter(
      item =>
        item && item.length && item[productTarget[1]] && !/合\s*计/.test(item[productTarget[1]]),
    )
    .map(item => ({
      product: item[productTarget[1]]?.trim().split(/[(（]/)[0]?.trim() || '',
      unit: item[productTarget[1]]?.trim().split(/[(（]/)[1]?.trim() || '',
      count: Number(item[countTarget[1]]) || 0,
    }))
    .filter(item => item.count) as IFormattedOutboundData[];

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

function mergeByDate(data: IFormattedOutboundData[][]) {
  const result: Record<string, IFormattedOutboundData[]> = {};
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

function mergeByProduct(data: IFormattedOutboundData[][]) {
  const result: IFormattedOutboundData[][] = [];
  data.forEach(items => {
    const map: Record<string, IFormattedOutboundData> = items.reduce((map, item) => {
      if (map[`${item.product}_${item.unit}`]) {
        map[`${item.product}_${item.unit}`].count += item.count;
      } else {
        map[`${item.product}_${item.unit}`] = item;
      }
      return map;
    }, {} as Record<string, IFormattedOutboundData>);
    result.push(Object.values(map));
  });
  return result;
}

function formatData(
  slimData: IFormattedInboundData[],
  outbound: IFormattedOutboundData[][],
): IFormattedInboundData[][] {
  const mergedOutbound = mergeByProduct(mergeByDate(outbound));

  const outboundTimeSplitted = splitByOutboundTime(slimData, mergedOutbound);
  const countSplitted = splitByCount(outboundTimeSplitted);

  return countSplitted;
}

function splitByOutboundTime(
  slimData: IFormattedInboundData[],
  outbound: IFormattedOutboundData[][],
): IFormattedInboundData[][] {
  const result = [];
  const inboundCount = randomRange(5, 10);
  const inboundMap: Record<string, IFormattedInboundData> = slimData.reduce((map, item) => {
    map[`${item.product}_${item.unit}`] = item;
    return map;
  }, {} as Record<string, IFormattedInboundData>);

  let preUnix = dayjs.unix(outbound[0][0].date).endOf('day').date(14).unix();
  for (let i = 0; i < inboundCount; i++) {
    const outboundItems = outbound[Math.min(i, outbound.length - 1)];
    preUnix = dayjs.unix(preUnix).endOf('day').unix();
    preUnix = dayjs
      .unix(
        Math.min(
          randomRange(preUnix, dayjs.unix(preUnix).add(2, 'day').unix()),
          dayjs.unix(outboundItems[0].date).add(-1, 'day').unix(),
        ),
      )
      .startOf('day')
      .unix();

    if (i === inboundCount - 1) {
      const inbound = Object.values(inboundMap)
        .filter(item => item.count)
        .map(item => ({
          date: preUnix,
          product: item.product,
          unit: item.unit,
          count: item.count,
        }));
      result.push(inbound);
    } else {
      const inbound = outboundItems
        .map(item => {
          if (inboundCount > outbound.length && Math.random() < 0.5) return;

          let productCount = 0;
          if (
            !inboundMap[`${item.product}_${item.unit}`] ||
            !inboundMap[`${item.product}_${item.unit}`].count
          )
            return;
          if (inboundMap[`${item.product}_${item.unit}`].count <= item.count && inboundCount <= outbound.length) {
            productCount = inboundMap[`${item.product}_${item.unit}`].count;
          } else {
            productCount = Math.min(
              randomRange(
                Math.max(
                  item.count,
                  inboundMap[`${item.product}_${item.unit}`].count / (inboundCount - i),
                ) * 0.5,
                Math.max(
                  item.count,
                  inboundMap[`${item.product}_${item.unit}`].count / (inboundCount - i),
                ) * 1.5,
                !floatUnits.includes(item.unit),
              ),
              inboundMap[`${item.product}_${item.unit}`].count,
            );
          }
          inboundMap[`${item.product}_${item.unit}`].count -= productCount;
          return {
            date: preUnix,
            product: item.product,
            unit: item.unit,
            count: productCount,
          };
        })
        .filter(Boolean) as IFormattedInboundData[];
      const leftCount = randomRange((7 - (inbound.length % 7)) * 0.7, 7 - (inbound.length % 7));
      if (leftCount) {
        const outboundProducts = outboundItems.map(item => item.product);
        const difference = Object.values(inboundMap).filter(
          x => x.count && !outboundProducts.includes(x.product),
        );
        const randomProducts = randomPick<IFormattedInboundData>(difference, leftCount);
        for (let i = 0; i < randomProducts.length; i++) {
          const randomProduct = randomProducts[i];
          const productCount = Math.max(randomProduct.count / (inboundCount - i), 1);
          const randomCount = Math.min(
            randomRange(productCount, productCount * 2, !floatUnits.includes(randomProduct.unit)),
            randomProduct.count,
          );
          inbound.push({
            date: preUnix,
            product: randomProduct.product,
            unit: randomProduct.unit,
            count: randomCount,
          });
          randomProduct.count -= randomCount;
        }
      }
      result.push(inbound);
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
