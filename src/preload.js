const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getTypingState: () => ipcRenderer.invoke('get-typing-state'),
  updateWpm: (wpm) => ipcRenderer.send('update-wpm', wpm),
  updateTemperature: (temp) => ipcRenderer.send('update-temperature', temp),
  updatePause: (pause) => ipcRenderer.send('update-pause', pause),
  resizeWindow: (dimensions) => ipcRenderer.send('resize-window', dimensions),
  onTypingStateChange: (callback) => ipcRenderer.on('typing-state-changed', (event, state) => callback(state))
});
