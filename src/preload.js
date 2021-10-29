const electron = require('electron');
electron.contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: electron.ipcRenderer.send,
    sendSync: electron.ipcRenderer.sendSync,
    on: electron.ipcRenderer.on,
    once: electron.ipcRenderer.once
  }
});