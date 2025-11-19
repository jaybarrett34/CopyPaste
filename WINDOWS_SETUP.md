# CopyPaste - Windows Setup Guide

This guide will help you build and run CopyPaste on Windows. The app uses native modules (robotjs) that need to be compiled for your specific platform.

## Prerequisites

### 1. Install Node.js
- Download and install Node.js LTS (20.x or later) from https://nodejs.org/
- Verify installation:
  ```powershell
  node --version
  npm --version
  ```

### 2. Install Windows Build Tools
CopyPaste uses `@jitsi/robotjs` which requires native compilation. You need Visual Studio Build Tools:

**Option A: Automated Installation (Recommended)**
```powershell
# Run PowerShell as Administrator
npm install --global windows-build-tools
```

**Option B: Manual Installation**
1. Download Visual Studio 2022 Build Tools from https://visualstudio.microsoft.com/downloads/
2. Run the installer and select:
   - Desktop development with C++
   - Windows 10 SDK (10.0.19041.0 or later)
   - MSVC v143 - VS 2022 C++ build tools

### 3. Install Python (if not already installed)
- Download Python 3.11 from https://www.python.org/downloads/
- **Important:** Check "Add Python to PATH" during installation
- Verify: `python --version`

## Building CopyPaste

### Step 1: Clone the Repository
```powershell
git clone https://github.com/jaybarrett34/CopyPaste.git
cd CopyPaste
```

### Step 2: Install Dependencies
```powershell
npm install
```

This will automatically:
- Install all Node.js dependencies
- Rebuild native modules for Electron (via postinstall script)
- Compile robotjs for your Windows system

**If you encounter errors during `npm install`:**
```powershell
# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# If still failing, manually rebuild
npm run rebuild
```

### Step 3: Build the UI
```powershell
npm run build
```

This compiles the React UI using Vite.

### Step 4: Test in Development Mode
```powershell
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron
npm run electron

# Or combined:
npm run electron:dev
```

### Step 5: Package for Windows
```powershell
npm run package
```

This creates:
- `release/CopyPaste Setup 1.1.0.exe` - NSIS installer
- `release/CopyPaste 1.1.0.exe` - Portable executable

## Troubleshooting

### Error: "Module did not self-register"
This means robotjs wasn't compiled for the correct Electron version.

**Solution:**
```powershell
npm run rebuild
```

### Error: "node-gyp rebuild failed"
You're missing Windows Build Tools.

**Solution:**
```powershell
# As Administrator
npm install --global windows-build-tools

# Then rebuild
npm install
```

### Error: "Cannot find module './win32-x64-XX'"
The native module binary is missing or corrupted.

**Solution:**
```powershell
# Remove and reinstall robotjs
rm -rf node_modules/@jitsi/robotjs
npm install @jitsi/robotjs
npm run rebuild
```

### Error: "A JavaScript error occurred in the main process"
Check that you built the UI first:
```powershell
npm run build
npm run electron
```

### Error: "403 Forbidden" during npm install
This is a network/proxy issue.

**Solution:**
```powershell
# Try with --ignore-scripts first
npm install --ignore-scripts

# Then manually rebuild
npm run rebuild
```

## Running the App

### Development Mode
```powershell
npm run electron:dev
```
- Hot-reload enabled for UI changes
- Main process requires restart for changes

### Production Build
```powershell
# Install the NSIS installer
.\release\CopyPaste Setup 1.1.0.exe

# Or run the portable version
.\release\CopyPaste 1.1.0.exe
```

## First Run - Accessibility Permissions

When you first run CopyPaste, Windows may show security warnings:

1. **Windows SmartScreen**: Click "More info" → "Run anyway"
2. **No additional permissions needed on Windows** (unlike macOS)

## Keyboard Shortcuts

- `Ctrl+Alt+V`: Start/Stop typing from clipboard
- `Ctrl+Shift+P`: Pause/Resume typing
- `Ctrl+Alt+Arrow Keys`: Move window
- `Ctrl+Q`: Quit application

## Features

### WPM (Words Per Minute)
- Range: 10-900 WPM
- Default: 80 WPM
- 900 WPM + 0% temperature = Instant paste-like speed

### Temperature (Variation)
- 0% = Robot mode (zero variation, very fast)
- 50% = Human mode (default, realistic typing)
- 100% = Erratic mode (lots of natural pauses)

### Pause Multiplier
- 0% = No extra pauses at word/sentence boundaries
- 50% = Default pauses
- 100% = Maximum pauses (very human-like)

## Known Issues on Windows

### Glass Morphism UI
- Windows 11: Full acrylic effect support
- Windows 10: Basic transparency (no acrylic)
- Fallback to simple transparency on older systems

### Screen Capture Protection
- `setContentProtection()` is enabled but has limitations
- May not block all screen capture tools
- This is a Windows API limitation, not a bug

### Window Positioning
- Window stays on top of all applications
- Uses `Ctrl+Alt+Arrow` instead of `Cmd+Shift+Arrow` (Mac)

## Building for Distribution

### NSIS Installer (Recommended)
```powershell
npm run package
```
Creates: `release/CopyPaste Setup 1.1.0.exe`

### Portable Version
Already included in the build output:
`release/CopyPaste 1.1.0.exe`

### Code Signing (Optional)
For production distribution, sign your builds:
```powershell
# Install signtool (part of Windows SDK)
# Get a code signing certificate
# Add to package.json:
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "password"
}
```

## Performance Tips

1. **Instant Mode**: Set WPM to 900 and Temperature to 0%
2. **Natural Mode**: Set WPM to 60-80 and Temperature to 50-100%
3. **Close other apps** to prevent interference during typing
4. **Use portable version** if you don't want to install

## Architecture Notes

### Technology Stack
- **Framework**: Electron 38.2.1
- **UI**: React 19.2.0 + Vite 7.1.9
- **Typing Engine**: @jitsi/robotjs 0.6.18
- **Build**: electron-builder 26.0.12

### Why robotjs?
- Direct keyboard input simulation
- Bypasses paste detection systems
- Cross-platform support
- Low-level control

### Native Module Rebuilding
robotjs is a native Node.js module that must be compiled for:
1. Your OS (Windows)
2. Your architecture (x64)
3. Your Electron version (38.2.1)

That's why `npm run rebuild` is necessary after installation.

## Development

### Project Structure
```
CopyPaste/
├── src/
│   ├── main.js              # Electron main process
│   ├── preload.js           # IPC bridge
│   ├── App.jsx              # React UI
│   ├── components/          # UI components
│   └── platform/            # Platform adapters
├── build/                   # Icons and resources
├── dist/                    # Vite build output
└── release/                 # Packaged apps
```

### Making Changes

**UI Changes (React):**
1. Edit files in `src/` or `src/components/`
2. Changes hot-reload automatically with `npm run electron:dev`

**Main Process Changes (Electron):**
1. Edit `src/main.js`
2. Restart Electron (Ctrl+C, then `npm run electron`)

**Build Changes:**
1. Edit `package.json` → `build` section
2. Rebuild: `npm run package`

## Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Ensure you have all prerequisites installed
3. Try a clean install: `rm -rf node_modules && npm install`
4. Check GitHub issues: https://github.com/jaybarrett34/CopyPaste/issues

## Next Steps

After successful installation:
1. Test with simple text first
2. Experiment with WPM and Temperature settings
3. Try keyboard shortcuts
4. Test with your target application

## Version Information

- **Current Version**: 1.1.0
- **Electron**: 38.2.1
- **Node**: 20.x LTS
- **Platform**: Windows 10/11 (x64)

---

**Last Updated**: November 19, 2025
**Status**: Ready for Windows testing and deployment
