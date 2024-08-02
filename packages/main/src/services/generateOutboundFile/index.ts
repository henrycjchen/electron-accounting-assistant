import dayjs from 'dayjs';
import {createInbound} from './create-inbound';
import {createIssuing} from './create-issuing';
import {createOutbound} from './create-outbound';
import {createReceiving} from './create-receiving';
import path from 'path';
import ExcelJS from 'exceljs';


export async function generateOutboundFile(files: Record<string, string>) {
  if (files.outboundInvoices) {
    const workbook = new ExcelJS.Workbook();
    let dist = path.dirname(files.outboundInvoices) + '/会计助手-' + dayjs().format('YYYYMM')+'.xlsx';
    const outbound = await createOutbound({filePath: files.outboundInvoices, workbook});
    
    if (files.calculate) {
      dist = path.dirname(files.calculate) + '/会计助手-' + dayjs().format('YYYYMM')+'.xlsx';
      const inbound = await createInbound({
        filePath: files.calculate,
        outbound,
        workbook,
      });
    
      const issuing = await createIssuing({
        filePath: files.calculate,
        inbound,
        workbook,
      });
  
      if (files.receivingInvoices) {
        await createReceiving({
          filePath: files.receivingInvoices,
          issuing,
          workbook,
        });
      }
    }
    return workbook.xlsx.writeFile(dist);
  }


}
