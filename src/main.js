const { app, BrowserWindow, globalShortcut, clipboard, ipcMain, screen, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const robot = require('@jitsi/robotjs');
const platformAdapter = require('./platform/PlatformAdapter');

// Simple in-memory state
let mainWindow;
let isTyping = false;
let isPaused = false;
let wpm = 80;
let temperature = 50; // 0-100: 0=robot, 50=human, 100=erratic
let pauseMultiplier = 50; // 0-100: controls how much extra delay at word boundaries
let currentTypingProcess = null;

// Default shortcuts
let shortcuts = {
  startStop: 'CommandOrControl+Alt+V',
  pauseResume: 'CommandOrControl+Shift+P',
  moveUp: 'CommandOrControl+Alt+Up',
  moveDown: 'CommandOrControl+Alt+Down',
  moveLeft: 'CommandOrControl+Alt+Left',
  moveRight: 'CommandOrControl+Alt+Right'
};

// Settings file path
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

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
  constructor(text, wordsPerMinute, temp = 50, pauseMult = 50) {
    this.text = text;
    this.wpm = wordsPerMinute;
    this.temperature = temp; // 0-100
    this.pauseMultiplier = pauseMult; // 0-100
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
    // WPM = Words Per Minute
    // Standard: 1 word = 5 characters
    // So characters per minute = WPM * 5
    // Milliseconds per character = 60000 / (WPM * 5) = 12000 / WPM
    const baseDelay = 12000 / this.wpm;

    // Temperature controls randomness/variation (0-100%)
    const tempFactor = this.temperature / 100; // 0.0 to 1.0

    // Pause multiplier controls extra delay at boundaries (0-100%)
    const pauseFactor = this.pauseMultiplier / 100; // 0.0 to 1.0

    // Base delay multiplier starts at 1.0 (no change)
    let delayMultiplier = 1.0;

    // Add pause multipliers at word boundaries
    if (pauseFactor > 0) {
      if (prevChar === ' ') {
        // Space: 1.2x to 2.0x delay (at 100% pause)
        delayMultiplier = 1.0 + (0.8 * pauseFactor);
      } else if (prevChar === '.' || prevChar === '!' || prevChar === '?') {
        // Sentence end: 1.5x to 3.0x delay (at 100% pause)
        delayMultiplier = 1.0 + (2.0 * pauseFactor);
      } else if (prevChar === ',') {
        // Comma: 1.1x to 1.5x delay (at 100% pause)
        delayMultiplier = 1.0 + (0.4 * pauseFactor);
      }
    }

    // Apply multiplier to base delay
    let delay = baseDelay * delayMultiplier;

    // Add temperature-based random variation (±25% at max temp)
    const maxVariation = tempFactor * 0.25;
    const charVariation = delay * (Math.random() * maxVariation * 2 - maxVariation);
    delay += charVariation;

    return Math.max(delay, 10);
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

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(data);
      if (settings.shortcuts) {
        shortcuts = { ...shortcuts, ...settings.shortcuts };
      }
    }
  } catch (e) {
    // Ignore errors, use defaults
  }
}

function saveSettings() {
  try {
    const settings = { shortcuts };
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
  } catch (e) {
    // Ignore errors
  }
}

function registerGlobalShortcuts() {
  globalShortcut.unregisterAll();

  // Main shortcut - start/stop typing
  try {
    globalShortcut.register(shortcuts.startStop, () => {
      if (isTyping) {
        if (currentTypingProcess) {
          currentTypingProcess.stop();
          currentTypingProcess = null;
        }
      } else {
        const clipboardText = clipboard.readText();
        if (clipboardText) {
          currentTypingProcess = new TypingSimulator(clipboardText, wpm, temperature, pauseMultiplier);
          currentTypingProcess.start();
        }
      }
    });
  } catch (e) {
    // Ignore registration errors
  }

  // Pause/resume shortcut
  try {
    globalShortcut.register(shortcuts.pauseResume, () => {
      if (currentTypingProcess && isTyping) {
        if (isPaused) {
          currentTypingProcess.resume();
        } else {
          currentTypingProcess.pause();
        }
      }
    });
  } catch (e) {
    // Ignore registration errors
  }

  // Window movement shortcuts
  const moveDistance = 10;

  try {
    globalShortcut.register(shortcuts.moveUp, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        try {
          const bounds = mainWindow.getBounds();
          mainWindow.setBounds({ ...bounds, y: Math.max(0, bounds.y - moveDistance) });
        } catch (e) {
          // Ignore movement errors
        }
      }
    });
  } catch (e) {
    // Ignore registration errors
  }

  try {
    globalShortcut.register(shortcuts.moveDown, () => {
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
  } catch (e) {
    // Ignore registration errors
  }

  try {
    globalShortcut.register(shortcuts.moveLeft, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        try {
          const bounds = mainWindow.getBounds();
          mainWindow.setBounds({ ...bounds, x: Math.max(0, bounds.x - moveDistance) });
        } catch (e) {
          // Ignore movement errors
        }
      }
    });
  } catch (e) {
    // Ignore registration errors
  }

  try {
    globalShortcut.register(shortcuts.moveRight, () => {
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
  } catch (e) {
    // Ignore registration errors
  }
}

// Minimal IPC handlers
ipcMain.handle('get-typing-state', () => {
  return { isTyping, isPaused };
});

ipcMain.handle('get-shortcuts', () => {
  return shortcuts;
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

ipcMain.on('update-pause', (event, newPause) => {
  if (newPause >= 0 && newPause <= 100) {
    pauseMultiplier = newPause;
  }
});

ipcMain.on('update-shortcuts', (event, newShortcuts) => {
  shortcuts = { ...shortcuts, ...newShortcuts };
  saveSettings();
  registerGlobalShortcuts();
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
  loadSettings();
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
