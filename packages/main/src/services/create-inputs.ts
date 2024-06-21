import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import path from 'path';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import XLSX from 'xlsx';
import type {IFormattedOutputData, IFormattedInputData} from '../types';
import {setWrapBorder} from '../helpers/excel-helper';
dayjs.extend(customParseFormat);
export function createInputs({
  filePath,
  outputs,
}: {
  filePath: string;
  outputs: IFormattedOutputData[][];
}) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // 获取所有单元格数据
  const data = XLSX.utils.sheet_to_json(worksheet, {header: 1});

  const {validData} = washData(data as string[][]);
  const validDataFormatted = formatData(validData, outputs);

  console.log('validDataFormatted', validDataFormatted);

  action({
    validData: validDataFormatted,
    filePath: path.dirname(filePath) + `/入库凭证${dayjs().format('YYYYMMDD-HHmmss')}.xlsx`,
  });

  //   return validDataFormatted;
}

function action({validData, filePath}: {validData: IFormattedInputData[][]; filePath: string}) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('入库凭证', {
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
    worksheet.getCell(`C${row}`).value = items[0].date;
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
      worksheet.getCell(`E${row}`).value = Number(product.count);
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

  return workbook.xlsx.writeFile(filePath);
}

function washData(data: string[][]) {
  const countTarget = findTarget(data, '本期生产');
  const productTarget = findTarget(data, '品名');

  if (!countTarget || !productTarget) throw new Error('未找到目标');
  const slimData = data
    .slice(countTarget[0] + 2)
    .filter(item => item && item.length && !/合\s*计/.test(item[productTarget[1]]))
    .map(item => ({
      product: item[productTarget[1]]?.trim().split(/[(（]/)[0]?.trim(),
      unit: item[productTarget[1]]?.trim().split(/[(（]/)[1]?.trim(),
      count: Number(item[countTarget[1]]) || 0,
    }))
    .filter(item => item.count) as IFormattedOutputData[];

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

function formatData(
  slimData: IFormattedInputData[],
  outputs: IFormattedOutputData[][],
): IFormattedInputData[][] {
  const outputSplitted = splitByOutput(slimData, outputs);
  const countSplitted = splitByCount(outputSplitted);

  return countSplitted;
}

function splitByOutput(
  slimData: IFormattedInputData[],
  outputs: IFormattedOutputData[][],
): IFormattedInputData[][] {
  const result = [];
  const inputCount = randomRange(outputs.length * 0.5, outputs.length * 0.8 + 1);
  const inputMap: Record<string, IFormattedInputData> = slimData.reduce((map, item) => {
    if (map[item.product]) {
      map[item.product].count += item.count;
    } else {
      map[item.product] = item;
    }
    return map;
  }, {} as Record<string, IFormattedInputData>);

  for (let i = 0; i < inputCount; i++) {
    const unix = randomRange(
      dayjs(outputs[1][0].date, 'YYYY年MM月DD日').startOf('month').unix(),
      dayjs(outputs[i][0].date, 'YYYY年MM月DD日').startOf('day').unix(),
    );
    const inputDate = dayjs.unix(unix).format('YYYY年MM月DD日');

    if (i === inputCount - 1) {
      const input = Object.values(inputMap)
        .filter(item => item.count)
        .map(item => ({
          date: inputDate,
          product: item.product,
          unit: item.unit,
          count: item.count,
        }));
      result.push(input);
    } else {
      const input = outputs[i]
        .map(item => {
          let productCount = 0;
          if (!inputMap[item.product] || !inputMap[item.product].count) return;
          if (inputMap[item.product].count <= item.count) {
            productCount = inputMap[item.product].count;
          } else {
            productCount = Math.min(
              randomRange(item.count * 1.5, item.count * 2),
              inputMap[item.product].count,
            );
          }
          inputMap[item.product].count -= productCount;
          return {
            date: inputDate,
            product: item.product,
            unit: item.unit,
            count: productCount,
          };
        })
        .filter(Boolean) as IFormattedInputData[];
      const leftCount = randomRange((7 - input.length) * 0.5, 7 - input.length+1);
      if (leftCount) {
        const outputProducts = outputs[i].map(item => item.product);
        const difference = Object.values(inputMap)
          .filter(x => x.count && !outputProducts.includes(x.product))
          .map(x => x.product);
        const randomProducts = randomPick(difference, leftCount);
        for (let i = 0; i < leftCount; i++) {
          const randomProduct = inputMap[randomProducts[i]];
          const productCount = randomProduct.count / (inputCount - i);
          const randomCount = Math.min(
            randomRange(Math.max(productCount * 2, 1), Math.max(productCount * 4, 1)),
            randomProduct.count,
          );
          input.push({
            date: inputDate,
            product: randomProduct.product,
            unit: randomProduct.unit,
            count: randomCount,
          });
          randomProduct.count -= randomCount;
        }
      }
      result.push(input);
    }
  }

  return result;
}

function splitByCount(data: IFormattedInputData[][]) {
  const result: IFormattedInputData[][] = [];
  data.forEach(items => {
    const count = Math.ceil(items.length / 7);
    for (let i = 0; i < count; i++) {
      result.push(items.slice(i * 7, (i + 1) * 7));
    }
  });
  return result;
}

function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

function randomPick(arr: string[], count: number) {
  const result = [];
  for (let i = 0; i < count; i++) {
    if (arr.length === 0) {
      break;
    }
    const index = Math.floor(Math.random() * arr.length);
    const [item] = arr.splice(index, 1);
    result.push(item);
  }
  return result;
}
