import {ipcMain} from 'electron';
import {processExcel} from './helpers/process-excel';

ipcMain.handle('generateOutboundFile', async (event, files: Record<string, string>) => {
  if (!Object.values(files)?.length) {
    return;
  }
  const invalidData = await processExcel(files);

  return invalidData;
});
