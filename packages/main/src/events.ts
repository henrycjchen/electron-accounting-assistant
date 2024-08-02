import {ipcMain} from 'electron';
import {generateOutboundFile} from './services/generateOutboundFile';
import {generateCalculateFile} from './services/generateCalculateFile';

ipcMain.handle('generateOutboundFile', async (event, files: Record<string, string>) => {
  if (!Object.values(files)?.length) {
    return;
  }
  const invalidData = await generateOutboundFile(files);

  return invalidData;
});

ipcMain.handle('generateCalculateFile', async (event, files: Record<string, string>) => {
  if (!Object.values(files)?.length) {
    return;
  }
  const invalidData = await generateCalculateFile(files);

  return invalidData;
});