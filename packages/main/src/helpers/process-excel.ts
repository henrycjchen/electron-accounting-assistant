import dayjs from 'dayjs';
import {createInbound} from '../services/create-inbound';
import {createIssuing} from '../services/create-issuing';
import {createOutbound} from '../services/create-outbound';
import {createReceiving} from '../services/create-receiving';
import path from 'path';
import {exec} from 'child_process';
import os from 'os';
import { promises as fsPromises } from 'fs';


export async function processExcel(files: Record<string, string>) {
  const dirname = path.dirname(files.calculate) + '/会计助手-' + dayjs().format('YYYYMM');
  await fsPromises.mkdir(dirname, { recursive: true }).catch(console.error);

  const outbound = await createOutbound({filePath: files.outboundInvoices, dirname: dirname});

  const inbound = await createInbound({
    filePath: files.calculate,
    outbound,
    dirname,
  });

  const issuing = await createIssuing({
    filePath: files.calculate,
    inbound,
    dirname,
  });

  await createReceiving({
    filePath: files.receivingInvoices,
    issuing,
    dirname,
  });

  openFolder(dirname);
}

function openFolder(folderPath: string) {
  const platform = os.platform();

  let command;
  switch (platform) {
    case 'darwin': // macOS
      command = `open "${folderPath}"`;
      break;
    case 'win32': // Windows
      command = `explorer "${folderPath.replace(/\//g, '\\')}"`;
      break;
    default:
      console.error(`Platform ${platform} is not supported`);
      return;
  }

  exec(command, error => {
    if (error) {
      console.error(`Failed to open folder: ${error.message}`);
    }
  });
}
