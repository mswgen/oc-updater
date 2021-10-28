const electron = require('electron');
electron.contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: electron.ipcRenderer
})