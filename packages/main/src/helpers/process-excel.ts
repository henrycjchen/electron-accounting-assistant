import ExcelJS from 'exceljs';
import XLSX from 'xlsx';
import dayjs from 'dayjs';
import path from 'path';

export async function processExcel(filePath: string) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // 获取所有单元格数据
  const data = XLSX.utils.sheet_to_json(worksheet, {header: 1});

  const formattedData = formatData(data as Record<string, string>[]);

  await writeExcel(formattedData, path.dirname(filePath)+`/出库凭证${dayjs().format('YYYYMMDD-HHmmss')}.xlsx`);
}

interface IFormattedData {
  buyCompany: string;
  date: string;
  product: string;
  unit: string;
  count: string;
}
function formatData(data: Record<string, string>[]): IFormattedData[][] {
  const slimData = data
    .slice(1)
    .sort((a, b) => dayjs(a[8]).unix() - dayjs(b[8]).unix())
    .map(item => ({
      buyCompany: item[7],
      date: dayjs(item[8]).format('MM/DD/YYYY'),
      product: item[11].split('*').at(-1),
      unit: item[13],
      count: item[14],
    })) as IFormattedData[];

  const result = [];
  let last = [slimData[0]];
  for (let i = 1; i < slimData.length; i++) {
    const item = slimData[i];
    if (item.date !== last[0].date || item.buyCompany !== last[0].buyCompany || last.length >= 7) {
      result.push(last);
      last = [item];
      continue;
    }
    last.push(item);
  }
  result.push(last);
  return result;
}

function writeExcel(data: IFormattedData[][], dist: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('出  库  凭  证', {
    properties: {
      defaultRowHeight: 12,
    },
  });
  worksheet.getColumn('A').width = 16;
  worksheet.getColumn('B').width = 24;
  worksheet.getColumn('C').width = 16;
  worksheet.getColumn('D').width = 6;
  worksheet.getColumn('E').width = 16;

  let row = 1;
  data.forEach((items, index) => {
    worksheet.mergeCells(`A${row}:E${row}`);
    worksheet.getCell(`A${row}`).value = '出库凭证';
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
    worksheet.getRow(row).height = 30;

    row += 1;
    worksheet.mergeCells(`A${row}:B${row}`);
    worksheet.getCell(`A${row}`).value = `领取人：${items[0].buyCompany}`;
    worksheet.getCell(`A${row}`).alignment = {
      vertical: 'middle',
    };
    worksheet.getCell(`C${row}`).value = items[0].date;
    worksheet.getCell(`C${row}`).alignment = {
      vertical: 'middle',
    };
    worksheet.getRow(row).height = 21;

    row += 1;
    worksheet.getCell(`A${row}`).value = '用途';
    setWrapBorder(worksheet.getCell(`A${row}`));
    worksheet.getCell(`A${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getCell(`B${row}`).value = '品名';
    worksheet.getCell(`B${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    setWrapBorder(worksheet.getCell(`B${row}`));
    worksheet.getCell(`C${row}`).value = '规格';
    worksheet.getCell(`C${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    setWrapBorder(worksheet.getCell(`C${row}`));
    worksheet.getCell(`D${row}`).value = '单位';
    worksheet.getCell(`D${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    setWrapBorder(worksheet.getCell(`D${row}`));
    worksheet.getCell(`E${row}`).value = '数量';
    worksheet.getCell(`E${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    setWrapBorder(worksheet.getCell(`E${row}`));
    worksheet.getRow(row).height = 14;

    let total = 0;
    items.forEach((product, index) => {
      row += 1;
      if (index === 0) {
        worksheet.getCell(`A${row}`).value = '销售';
      } else {
        worksheet.getCell(`A${row}`).value = '';
      }
      setWrapBorder(worksheet.getCell(`A${row}`));
      worksheet.getCell(`A${row}`).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      worksheet.getCell(`B${row}`).value = product.product;
      worksheet.getCell(`B${row}`).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      setWrapBorder(worksheet.getCell(`B${row}`));
      worksheet.getCell(`C${row}`).value = '';
      worksheet.getCell(`C${row}`).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      setWrapBorder(worksheet.getCell(`C${row}`));
      worksheet.getCell(`D${row}`).value = product.unit;
      worksheet.getCell(`D${row}`).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      setWrapBorder(worksheet.getCell(`D${row}`));
      worksheet.getCell(`E${row}`).value = product.count;
      worksheet.getCell(`E${row}`).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      setWrapBorder(worksheet.getCell(`E${row}`));
      total += Number(product.count);
      worksheet.getRow(row).height = 14;
    });
    for (let i = items.length; i < 7; i++) {
      row += 1;
      setWrapBorder(worksheet.getCell(`A${row}`));
      setWrapBorder(worksheet.getCell(`B${row}`));
      setWrapBorder(worksheet.getCell(`C${row}`));
      setWrapBorder(worksheet.getCell(`D${row}`));
      setWrapBorder(worksheet.getCell(`E${row}`));
      worksheet.getRow(row).height = 14;
    }

    row += 1;
    worksheet.mergeCells(`A${row}:D${row}`);
    worksheet.getCell(`A${row}`).value = `合${' '.repeat(20)}计`;
    worksheet.getCell(`A${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    setWrapBorder(worksheet.getCell(`A${row}`));
    worksheet.getCell(`E${row}`).value = total;
    worksheet.getCell(`E${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    setWrapBorder(worksheet.getCell(`E${row}`));
    worksheet.getRow(row).height = 14;

    row += 1;
    worksheet.mergeCells(`A${row}:E${row}`);
    worksheet.getCell(`A${row}`).alignment = {
      vertical: 'middle',
      horizontal: 'right',
    };
    worksheet.getCell(`A${row}`).value = `保管人：倪${' '.repeat(20)}`;
    worksheet.getRow(row).height = 18;

    if (index % 2 === 0) {
      row += 11;
    } else {
      row += 7;
    }
  });

  return workbook.xlsx.writeFile(dist);
}

function setWrapBorder(cell: ExcelJS.Cell) {
  cell.border = {
    top: {style: 'thin', color: {argb: 'FF000000'}},
    left: {style: 'thin', color: {argb: 'FF000000'}},
    bottom: {style: 'thin', color: {argb: 'FF000000'}},
    right: {style: 'thin', color: {argb: 'FF000000'}},
  };
}
