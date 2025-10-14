const { app, BrowserWindow, globalShortcut, clipboard, ipcMain, screen, Menu } = require('electron');
const path = require('path');
const robot = require('@jitsi/robotjs');

// Simple in-memory state - no complex storage
let mainWindow;
let isTyping = false;
let isPaused = false;
let wpm = 80;
let currentTypingProcess = null;

// Character lookup tables for fast typing
const SHIFT_CHAR_MAP = {
  '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
  '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\',
  ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
};

const REGULAR_CHAR_MAP = {
  '-': 'minus', '=': 'equal', '[': 'left_bracket', ']': 'right_bracket',
  '\\': 'backslash', ';': 'semicolon', "'": 'quote', ',': 'comma',
  '.': 'period', '/': 'slash', '`': 'backquote'
};

// Simple typing simulator - core macro functionality
class TypingSimulator {
  constructor(text, wordsPerMinute) {
    this.text = text;
    this.wpm = wordsPerMinute;
    this.isStopped = false;
    this.isPaused = false;
    this.currentIndex = 0;
  }

  async start() {
    isTyping = true;
    this.notifyState('typing');

    try {
      // Release modifier keys
      try {
        robot.keyToggle('command', 'up');
        robot.keyToggle('control', 'up');
        robot.keyToggle('alt', 'up');
        robot.keyToggle('shift', 'up');
      } catch (e) {
        // Ignore key toggle errors
      }

      // Short delay before typing
      await this.sleep(1000);

      for (let i = 0; i < this.text.length; i++) {
        // Handle pause
        while (this.isPaused && !this.isStopped) {
          await this.sleep(100);
        }

        if (this.isStopped) break;

        const char = this.text[i];
        const prevChar = i > 0 ? this.text[i - 1] : '';

        // Type character
        this.typeCharacter(char);

        // Calculate delay
        const delay = this.calculateDelay(char, prevChar);
        await this.sleep(delay);
      }

      this.notifyState('ready');
    } catch (error) {
      this.notifyState('error');
    } finally {
      isTyping = false;
      isPaused = false;
      currentTypingProcess = null;
    }
  }

  typeCharacter(char) {
    try {
      if (char === '\n') {
        robot.keyTap('enter');
      } else if (char === '\t') {
        robot.keyTap('tab');
      } else if (char === ' ') {
        robot.keyTap('space');
      } else if (char >= 'A' && char <= 'Z') {
        robot.keyTap(char.toLowerCase(), ['shift']);
      } else if (char.match(/^[a-z0-9]$/)) {
        robot.keyTap(char);
      } else if (SHIFT_CHAR_MAP[char]) {
        robot.keyTap(SHIFT_CHAR_MAP[char], ['shift']);
      } else if (REGULAR_CHAR_MAP[char]) {
        robot.keyTap(REGULAR_CHAR_MAP[char]);
      } else {
        robot.typeString(char);
      }
    } catch (error) {
      try {
        robot.typeString(char);
      } catch (e) {
        // Skip problematic characters
      }
    }
  }

  calculateDelay(char, prevChar) {
    const baseDelay = (60 / this.wpm) * 1000 / 5;
    const variation = baseDelay * (Math.random() * 0.4 - 0.2);
    let delay = baseDelay + variation;

    if (prevChar === ' ') delay += Math.random() * 100 + 150;
    if (prevChar === '.' || prevChar === '!' || prevChar === '?') delay += Math.random() * 400 + 400;
    if (prevChar === ',') delay += Math.random() * 100 + 100;

    return Math.max(delay, 20);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.isStopped = true;
  }

  pause() {
    this.isPaused = true;
    isPaused = true;
    this.notifyState('paused');
  }

  resume() {
    this.isPaused = false;
    isPaused = false;
    this.notifyState('typing');
  }

  notifyState(state) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        mainWindow.webContents.send('typing-state-changed', state);
      } catch (e) {
        // Ignore IPC errors
      }
    }
  }
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 140,
    height: 50,
    x: Math.floor((screenWidth - 140) / 2),
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Prevent screen capture/recording
  mainWindow.setContentProtection(true);

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  // Auto-detect dev server port
  const tryPorts = [5173, 5174, 5175];
  let loaded = false;

  for (const port of tryPorts) {
    if (!loaded && (process.env.NODE_ENV === 'development' || !app.isPackaged)) {
      try {
        mainWindow.loadURL(`http://localhost:${port}`);
        loaded = true;
        break;
      } catch (e) {
        // Try next port
      }
    }
  }

  if (!loaded && (process.env.NODE_ENV !== 'development' && app.isPackaged)) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createApplicationMenu();
}

function createApplicationMenu() {
  const template = [
    {
      label: 'CopyPaste',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function registerGlobalShortcuts() {
  globalShortcut.unregisterAll();

  // Main shortcut - start/stop typing
  globalShortcut.register('CommandOrControl+Alt+V', () => {
    if (isTyping) {
      if (currentTypingProcess) {
        currentTypingProcess.stop();
        currentTypingProcess = null;
      }
    } else {
      const clipboardText = clipboard.readText();
      if (clipboardText) {
        currentTypingProcess = new TypingSimulator(clipboardText, wpm);
        currentTypingProcess.start();
      }
    }
  });

  // Pause/resume shortcut
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    if (currentTypingProcess && isTyping) {
      if (isPaused) {
        currentTypingProcess.resume();
      } else {
        currentTypingProcess.pause();
      }
    }
  });

  // Window movement shortcuts
  const moveDistance = 10;

  globalShortcut.register('CommandOrControl+Shift+Up', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      mainWindow.setBounds({ ...bounds, y: Math.max(0, bounds.y - moveDistance) });
    }
  });

  globalShortcut.register('CommandOrControl+Shift+Down', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      const primaryDisplay = screen.getPrimaryDisplay();
      const maxY = primaryDisplay.workAreaSize.height - bounds.height;
      mainWindow.setBounds({ ...bounds, y: Math.min(maxY, bounds.y + moveDistance) });
    }
  });

  globalShortcut.register('CommandOrControl+Shift+Left', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      mainWindow.setBounds({ ...bounds, x: Math.max(0, bounds.x - moveDistance) });
    }
  });

  globalShortcut.register('CommandOrControl+Shift+Right', () => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds();
      const primaryDisplay = screen.getPrimaryDisplay();
      const maxX = primaryDisplay.workAreaSize.width - bounds.width;
      mainWindow.setBounds({ ...bounds, x: Math.min(maxX, bounds.x + moveDistance) });
    }
  });
}

// Minimal IPC handlers
ipcMain.handle('get-typing-state', () => {
  return { isTyping, isPaused };
});

ipcMain.on('update-wpm', (event, newWpm) => {
  if (newWpm >= 10 && newWpm <= 300) {
    wpm = newWpm;
  }
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (currentTypingProcess) {
    currentTypingProcess.stop();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Silent error handling - don't crash
process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});
