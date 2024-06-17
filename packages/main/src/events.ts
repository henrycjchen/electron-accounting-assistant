import {ipcMain, dialog} from 'electron';
import {processExcel} from './helpers/process-excel';
import {exec} from 'child_process';
import path from 'path';

ipcMain.handle('generateOutboundFile', async () => {
  console.log('generateOutboundFile');
  const filePathList = dialog.showOpenDialogSync({
    properties: ['openFile'],
    filters: [{name: '全量发票导出文件', extensions: ['xlsx']}],
  });

  if (!filePathList) {
    return;
  }
  await processExcel(filePathList[0]);

  if (process.platform === 'darwin') {
    exec('open -a Finder ' + path.dirname(filePathList[0]));
  } else if (process.platform === 'win32') {
    exec('start explorer ' + path.dirname(filePathList[0]));
  }
});
