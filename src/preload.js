const electron = require('electron');
electron.contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: electron.ipcRenderer.send,
    sendSync: electron.ipcRenderer.sendSync,
    on: (channel, func) => electron.ipcRenderer.on(channel, func),
    once: electron.ipcRenderer.once
  }
});