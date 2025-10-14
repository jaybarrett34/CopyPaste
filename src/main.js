const { app, BrowserWindow, globalShortcut, clipboard, ipcMain, screen, Menu } = require('electron');
const path = require('path');
const robot = require('@jitsi/robotjs');
const platformAdapter = require('./platform/PlatformAdapter');

// Simple in-memory state - no complex storage
let mainWindow;
let isTyping = false;
let isPaused = false;
let wpm = 80;
let temperature = 50; // 0-100: 0=robot, 50=human, 100=erratic
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
  constructor(text, wordsPerMinute, temp = 50) {
    this.text = text;
    this.wpm = wordsPerMinute;
    this.temperature = temp; // 0-100
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
    // Fixed WPM calculation: 6 CPW (5 chars + 1 space) for accurate timing
    const baseDelay = (60 / this.wpm) * 1000 / 6;

    // Temperature-based character variation (0% temp = 0 var, 100% temp = 50% var)
    const tempFactor = this.temperature / 100; // 0.0 to 1.0
    const maxVariation = tempFactor * 0.5;
    const charVariation = baseDelay * (Math.random() * maxVariation * 2 - maxVariation);

    let delay = baseDelay + charVariation;

    // Word boundary pauses (scaled by temperature)
    if (prevChar === ' ') {
      delay += (Math.random() * 100 + 150) * tempFactor;
    }

    // Sentence pauses (scaled by temperature)
    if (prevChar === '.' || prevChar === '!' || prevChar === '?') {
      delay += (Math.random() * 400 + 400) * tempFactor;
    }

    // Comma pauses (scaled by temperature)
    if (prevChar === ',') {
      delay += (Math.random() * 100 + 100) * tempFactor;
    }

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

  // Get platform-specific window options
  const platformOptions = platformAdapter.getWindowOptions();

  mainWindow = new BrowserWindow({
    width: 140,
    height: 50,
    x: Math.floor((screenWidth - 140) / 2),
    y: 0,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    ...platformOptions,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Prevent screen capture/recording (best effort)
  platformAdapter.setContentProtection(mainWindow, true);

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
        currentTypingProcess = new TypingSimulator(clipboardText, wpm, temperature);
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

  // Window movement shortcuts - Changed to CommandOrControl+Alt+Arrow to avoid conflicts
  const moveDistance = 10;

  globalShortcut.register('CommandOrControl+Alt+Up', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        const bounds = mainWindow.getBounds();
        mainWindow.setBounds({ ...bounds, y: Math.max(0, bounds.y - moveDistance) });
      } catch (e) {
        // Ignore movement errors
      }
    }
  });

  globalShortcut.register('CommandOrControl+Alt+Down', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        const bounds = mainWindow.getBounds();
        const primaryDisplay = screen.getPrimaryDisplay();
        const maxY = primaryDisplay.workAreaSize.height - bounds.height;
        mainWindow.setBounds({ ...bounds, y: Math.min(maxY, bounds.y + moveDistance) });
      } catch (e) {
        // Ignore movement errors
      }
    }
  });

  globalShortcut.register('CommandOrControl+Alt+Left', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        const bounds = mainWindow.getBounds();
        mainWindow.setBounds({ ...bounds, x: Math.max(0, bounds.x - moveDistance) });
      } catch (e) {
        // Ignore movement errors
      }
    }
  });

  globalShortcut.register('CommandOrControl+Alt+Right', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        const bounds = mainWindow.getBounds();
        const primaryDisplay = screen.getPrimaryDisplay();
        const maxX = primaryDisplay.workAreaSize.width - bounds.width;
        mainWindow.setBounds({ ...bounds, x: Math.min(maxX, bounds.x + moveDistance) });
      } catch (e) {
        // Ignore movement errors
      }
    }
  });
}

// Minimal IPC handlers
ipcMain.handle('get-typing-state', () => {
  return { isTyping, isPaused };
});

ipcMain.on('update-wpm', (event, newWpm) => {
  if (newWpm >= 10 && newWpm <= 900) {
    wpm = newWpm;
  }
});

ipcMain.on('update-temperature', (event, newTemp) => {
  if (newTemp >= 0 && newTemp <= 100) {
    temperature = newTemp;
  }
});

ipcMain.on('resize-window', (event, { width, height }) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      const primaryDisplay = screen.getPrimaryDisplay();
      const bounds = mainWindow.getBounds();
      mainWindow.setBounds({
        x: Math.floor((primaryDisplay.workAreaSize.width - width) / 2),
        y: bounds.y,
        width,
        height
      });
    } catch (e) {
      // Ignore resize errors
    }
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
