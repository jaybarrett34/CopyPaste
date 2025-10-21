const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getTypingState: () => ipcRenderer.invoke('get-typing-state'),
  getShortcuts: () => ipcRenderer.invoke('get-shortcuts'),
  updateWpm: (wpm) => ipcRenderer.send('update-wpm', wpm),
  updateTemperature: (temp) => ipcRenderer.send('update-temperature', temp),
  updatePause: (pause) => ipcRenderer.send('update-pause', pause),
  updateShortcuts: (shortcuts) => ipcRenderer.send('update-shortcuts', shortcuts),
  resizeWindow: (dimensions) => ipcRenderer.send('resize-window', dimensions),
  onTypingStateChange: (callback) => ipcRenderer.on('typing-state-changed', (event, state) => callback(state))
});
