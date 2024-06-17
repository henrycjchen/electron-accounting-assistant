import {ipcRenderer} from 'electron';

export function generateOutboundFile() {
  return ipcRenderer.invoke('generateOutboundFile');
}
