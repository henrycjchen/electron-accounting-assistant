import dayjs from 'dayjs';
import XLSX from 'xlsx';
import { invalidProductTypes } from '/@/config';
import type { IFormattedInboundInvoicesData } from '/@/types';

export default function handleInboundData(filePath: string) {
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
        sellCompany: item[5]?.trim() || '',
        product: item[11]?.trim().split('*')[2] || '',
        productType: item[11]?.trim().split('*')[1] || '',
        specification: item[12]?.trim() || '',
        unit: item[13]?.trim() || '',
        date: dayjs(item[8]).startOf('day').unix(),
        count: Number(item[14]) || 0,
        price: Number(item[16]) || 0,
        tax: Number(item[18]) || 0,
      }))
      .filter(item => !invalidProductTypes.includes(item.productType))
      .sort((a, b) => a.date - b.date) as IFormattedInboundInvoicesData[];
  
    return {validData: slimData};
  }