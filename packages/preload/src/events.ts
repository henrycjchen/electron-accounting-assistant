import {ipcRenderer} from 'electron';

export function generateOutboundFile(files: {path: string; type: string}[]) {
  return ipcRenderer.invoke('generateOutboundFile', files);
}
