
// window.addEventListener("DOMContentLoaded", () => {
  //   const replaceText = (selector, text) => {
    //     const element = document.getElementById(selector);
    //     if (element) element.innerText = text;
    //   };
    
    //   for (const dependency of ["chrome", "node", "electron"]) {
      //     replaceText(`${dependency}-version`, process.versions[dependency]);
//   }
// });

/*
import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
  on(channel, listener) {
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(channel, listener) {
    return ipcRenderer.off(channel, listener);
  },
  send(channel, ...args) {
    return ipcRenderer.send(channel, ...args);
  },
  invoke(channel, ...args) {
    return ipcRenderer.invoke(channel, ...args);
  },
  // You can expose other APIs you need here.
  // ...
});
*/

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  on: (channel, listener) => ipcRenderer.on(channel, listener),
  off: (channel, listener) => ipcRenderer.removeListener(channel, listener),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
});