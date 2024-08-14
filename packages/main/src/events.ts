import {ipcMain} from 'electron';
import {generateOutboundFile} from './services/generateOutboundFile';
import {generateCalculateFile} from './services/generateCalculateFile';
import type { ICalculationForm } from '@@/types/types';
import getTableData from './services/generateCalculateFile/get-table-data';

ipcMain.handle('generateOutboundFile', async (event, files: Record<string, string>) => {
  if (!Object.values(files)?.length) {
    return;
  }
  const invalidData = await generateOutboundFile(files);

  return invalidData;
});

ipcMain.handle('generateCalculateFile', async (event, files: Record<string, string>, forms: ICalculationForm) => {
  if (!Object.values(files)?.length) {
    return;
  }
  const invalidData = await generateCalculateFile(files, forms);

  return invalidData;
});

ipcMain.handle('getTableData', async (event, filepath) => {
  return getTableData(filepath);
});