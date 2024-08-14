import ExcelJS from 'exceljs';

export default async function getTableData(filepath: string) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filepath);
  
  const sheet = workbook.getWorksheet('测算表');
  if (!sheet) {
    throw new Error('没有找到测算表');
  }

  return {
    currentIncrease: Number(sheet.getCell('E11').result),
    currentAuth: Number(sheet.getCell('F11').value),
    paidTax: Number(sheet.getCell('K21').result),
    realProfitTotalBase: Number(sheet.getCell('B38').result),
    realProfitTotal: Number(sheet.getCell('K28').result) - Number(sheet.getCell('B38').result),
    freight: Number(sheet.getCell('B16').value),
    office: Number(sheet.getCell('B22').value),
    travel: Number(sheet.getCell('B23').value),
    business: Number(sheet.getCell('B24').value),
    commission: Number(sheet.getCell('B34').value),
    interest: Number(sheet.getCell('B35').value),
    cumulativeSalesBase: Number(sheet.getCell('B2').result),
    cumulativeSales: Number(sheet.getCell('B59').result) - Number(sheet.getCell('B2').result),
    paidVatBase: Number(sheet.getCell('E4').result),
    paidVat: Number(sheet.getCell('B61').result) - Number(sheet.getCell('E4').result),
    electricityNumber: Number(sheet.getCell('B8').value),
    electricityCost: Number(sheet.getCell('M3').value),
    electricityTax: Number(sheet.getCell('N3').value),
  };
}
