import dayjs from 'dayjs';
import type ExcelJS from 'exceljs';
import {getStringValue} from '@/helpers/excel-helper';
import type {IFormattedInboundInvoicesData, IFormattedOutboundInvoicesData} from '@/types';
import handleInboundData from '../common/handleInboundData';
import handleOutboundData from '../common/handleOutboundData';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type {ICalculationForm} from '@@/types/types';

dayjs.extend(customParseFormat);

export default function handleCalculateFile(
  workbook: ExcelJS.Workbook,
  files: Record<string, string>,
  forms: ICalculationForm,
) {
  const sheet = workbook.getWorksheet('测算表');

  if (!sheet) {
    throw new Error('没有找到测算表');
  }
  const day = dayjs(
    String(getStringValue(sheet.getCell('L5').value)) +
      String(getStringValue(sheet.getCell('L6').value)),
    'YYYYM',
  );
  handleCost({workbook, day});

  handleSalary({workbook, day});

  const inboundData = getInboundData(files.inboundInvoices);
  handleMaterial({workbook, inboundData, day});

  const outboundData = getOutboundData(files.outboundInvoices);
  handleSell({workbook, outboundData, day});

  handleCostAccounting({workbook, day});

  handleMainPage({workbook, outboundData, forms, day});
}

function handleCost({workbook, day}: {workbook: ExcelJS.Workbook; day: dayjs.Dayjs}) {
  const sheet = workbook.getWorksheet('生产成本月结表');
  if (!sheet) {
    throw new Error('没有找到生产成本月结表');
  }

  sheet.getCell('D2').value = day.add(1, 'month').format('YYYY年MM月份');

  sheet.getCell('B5').value = Number(Number(sheet.getCell('E5').result).toFixed(2));
  sheet.getCell('B6').value = Number(Number(sheet.getCell('E6').result).toFixed(2));
}

function handleSalary({workbook, day}: {workbook: ExcelJS.Workbook; day: dayjs.Dayjs}) {
  const sheet = workbook.getWorksheet('工资');
  if (!sheet) {
    throw new Error('没有找到工资表');
  }

  sheet.getCell('A3').value = day.add(1, 'month').format('YYYY年MM月份');

  sheet.getCell('A2').value = getStringValue(sheet.getCell('A2').value).replace(
    /\d{4}\s*年\s*\d{1,2}\s*月/,
    dayjs().add(-1, 'month').format('YYYY年MM月'),
  );
}

function handleMaterial({
  workbook,
  inboundData,
  day,
}: {
  workbook: ExcelJS.Workbook;
  inboundData: Record<string, IFormattedInboundInvoicesData>;
  day: dayjs.Dayjs;
}) {
  const sheet = workbook.getWorksheet('材料');
  if (!sheet) {
    throw new Error('没有找到材料表');
  }

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

function handleSell({
  workbook,
  outboundData,
  day,
}: {
  workbook: ExcelJS.Workbook;
  outboundData: Record<string, IFormattedOutboundInvoicesData>;
  day: dayjs.Dayjs;
}) {
  const sheet = workbook.getWorksheet('销售成本');
  if (!sheet) {
    throw new Error('没有找到销售成本表');
  }

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

function handleCostAccounting({workbook, day}: {workbook: ExcelJS.Workbook; day: dayjs.Dayjs}) {
  const sheet = workbook.getWorksheet('成本核算表');
  if (!sheet) {
    throw new Error('没有找到成本核算表');
  }

  sheet.getCell('D2').value = day.add(1, 'month').format('YYYY年MM月份');
}

function handleMainPage({
  workbook,
  outboundData,
  forms,
  day,
}: {
  workbook: ExcelJS.Workbook;
  outboundData: Record<string, IFormattedOutboundInvoicesData>;
  forms: ICalculationForm;
  day: dayjs.Dayjs;
}) {
  const sheet = workbook.getWorksheet('测算表');
  if (!sheet) {
    throw new Error('没有找到测算表');
  }

  sheet.getCell('L5').value = day.add(1, 'month').format('YYYY');
  sheet.getCell('L6').value = day.add(1, 'month').format('M');

  sheet.getCell('E11').value = forms.currentIncrease;
  sheet.getCell('F11').value = forms.currentAuth;
  sheet.getCell('K21').value = Number(sheet.getCell('K21').result) + (forms.paidTax ?? 0);
  sheet.getCell('K28').value = {
    formula: String(forms.realProfitTotal ?? 0) + '+B38',
    result: (forms.realProfitTotal ?? 0) + Number(sheet.getCell('B38').result),
  };
  sheet.getCell('B8').value = forms.electricityNumber;
  sheet.getCell('B16').value = forms.freight;
  sheet.getCell('B22').value = forms.office;
  sheet.getCell('B23').value = forms.travel;
  sheet.getCell('B24').value = forms.business;
  sheet.getCell('B34').value = forms.commission;
  sheet.getCell('B35').value = forms.interest;
  sheet.getCell('B59').value = {
    formula: '测算表!B2+' + (forms.cumulativeSales??0),
    result: Number(sheet.getCell('B2').result) + (forms.cumulativeSales ?? 0),
  };
  sheet.getCell('B61').value = {
    formula: '测算表!E4+' + (forms.paidVat??0),
    result: Number(sheet.getCell('E4').result) + (forms.paidVat ?? 0),
  };
  sheet.getCell('K3').value = forms.electricityNumber;
  sheet.getCell('M3').value = forms.electricityCost;
  sheet.getCell('N3').value = forms.electricityTax;

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
