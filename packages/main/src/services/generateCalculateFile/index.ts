import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import fs from 'fs';
import handleCalculateFile from './handle-calculate-file';

export async function generateCalculateFile(files: Record<string, string>) {
  const resultFileName = files.calculate.replace(/\d{4}/, dayjs().add(-1, 'month').format('YYMM'));

  fs.copyFileSync(files.calculate, resultFileName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(resultFileName);

  await handleCalculateFile(workbook, files);
  workbook.xlsx.writeFile(resultFileName);

  // if (files.outboundInvoices) {
  //   let dist =
  //     path.dirname(files.outboundInvoices) + '/会计助手-' + dayjs().format('YYYYMM') + '.xlsx';
  //   const outbound = await createOutbound({filePath: files.outboundInvoices, workbook});

  //   if (files.calculate) {
  //     dist = path.dirname(files.calculate) + '/会计助手-' + dayjs().format('YYYYMM') + '.xlsx';
  //     const inbound = await createInbound({
  //       filePath: files.calculate,
  //       outbound,
  //       workbook,
  //     });

  //     const issuing = await createIssuing({
  //       filePath: files.calculate,
  //       inbound,
  //       workbook,
  //     });

  //     if (files.inboundInvoices) {
  //       await createReceiving({
  //         filePath: files.inboundInvoices,
  //         issuing,
  //         workbook,
  //       });
  //     }
  //   }
  //   return workbook.xlsx.writeFile(dist);
  // }
}
