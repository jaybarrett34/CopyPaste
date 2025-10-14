const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getTypingState: () => ipcRenderer.invoke('get-typing-state'),
  updateWpm: (wpm) => ipcRenderer.send('update-wpm', wpm),
  onTypingStateChange: (callback) => ipcRenderer.on('typing-state-changed', (event, state) => callback(state))
});
