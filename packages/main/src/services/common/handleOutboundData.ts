import dayjs from 'dayjs';
import XLSX from 'xlsx';
import { invalidProductTypes } from '/@/config';
import type { IFormattedOutboundInvoicesData } from '/@/types';

export default function handleOutboundData(filePath: string) {
    const source = XLSX.readFile(filePath);
    const sheetName = source.SheetNames[0];
    const worksheet = source.Sheets[sheetName];
  
    // 获取所有单元格数据
    const data = XLSX.utils.sheet_to_json(worksheet, {header: 1});
  
    return washData(data as string[][]);
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
      price: Number(item[16]) || 0,
      tax: Number(item[18]) || 0,
    })) as IFormattedOutboundInvoicesData[];

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