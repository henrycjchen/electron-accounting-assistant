import {ipcMain} from 'electron';
import {processExcel} from './helpers/process-excel';

ipcMain.handle('generateOutboundFile', async (event, files: {path: string; type: 'bills'}[]) => {

  if (!files?.length) {
    return;
  }
  const invalidData = await processExcel(files[0].path);

  return invalidData;
});
