import {ipcRenderer} from 'electron';

export function generateOutboundFile(files: Record<string, string>) {
  console.log('generateOutboundFile files', files);
  return ipcRenderer.invoke('generateOutboundFile', files);
}

export function generateCalculateFile(files: Record<string, string>) {
  console.log('generateCalculateFile files', files);
  return ipcRenderer.invoke('generateCalculateFile', files);
}
