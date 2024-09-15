import {ipcRenderer} from 'electron';

export function generateOutboundFile(files: Record<string, string>) {
  return ipcRenderer.invoke('generateOutboundFile', files);
}

export function generateCalculateFile(files: Record<string, string>, forms: Record<string, string>) {
  return ipcRenderer.invoke('generateCalculateFile', files, forms);
}

export function generateBillArrangement(file: string) {
  return ipcRenderer.invoke('generateBillArrangement', file);
}

export function getTableData(filepath: string) {
  return ipcRenderer.invoke('getTableData', filepath);
}
