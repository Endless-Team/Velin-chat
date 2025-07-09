// import { contextBridge, ipcRenderer } from 'electron';

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
 
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }

    // contextBridge.exposeInMainWorld('electronAPI', {
    //     sendCommand: (command, args) => ipcRenderer.send('command', { command, args }),
    //     onCommandResult: (callback) => ipcRenderer.on('command-result', (event, result) => callback(result))
    // });
  })