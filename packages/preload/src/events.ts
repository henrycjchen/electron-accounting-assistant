import {ipcRenderer} from 'electron';

export function generateOutboundFile(files: Record<string, string>) {
  return ipcRenderer.invoke('generateOutboundFile', files);
}
