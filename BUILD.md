# Building CopyPaste

This guide covers how to build CopyPaste from source and create distributable packages for macOS, Windows, and Linux.

---

## Prerequisites

### All Platforms
- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **Git**

### macOS Specific
- **Xcode Command Line Tools**: `xcode-select --install`
- **Python 3** (for node-gyp/robotjs compilation)

### Windows Specific
- **Visual Studio Build Tools** with C++ workload
- **Python 3** (for node-gyp)

### Linux Specific
- **Build essentials**: `sudo apt install build-essential`
- **libxtst-dev**: `sudo apt install libxtst-dev`
- **libpng-dev**: `sudo apt install libpng-dev`

---

## Quick Build (macOS)

```bash
# Clone the repository
git clone https://github.com/jaybarrett34/CopyPaste.git
cd CopyPaste

# Install dependencies
npm install

# Build the Vite bundle
npm run build

# Package the app (creates .dmg and .zip)
npm run package
```

Output files will be in the `release/` directory:
- `CopyPaste-1.1.0-arm64.dmg` (Apple Silicon)
- `CopyPaste-1.1.0.dmg` (Intel)
- `CopyPaste-1.1.0-arm64-mac.zip`
- `CopyPaste-1.1.0-mac.zip`

---

## Detailed Build Steps

### Step 1: Clone Repository

```bash
git clone https://github.com/jaybarrett34/CopyPaste.git
cd CopyPaste
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- **Electron** - Desktop app framework
- **React** - UI library
- **robotjs** - Keyboard automation (requires native compilation)
- **electron-builder** - Packaging tool

If robotjs fails to compile, ensure you have the prerequisites installed.

### Step 3: Development Mode (Optional)

To run in development mode with hot-reload:

```bash
# Start both Vite dev server and Electron
npm run electron:dev
```

Or run them separately:

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron (after Vite is ready)
npm run electron
```

### Step 4: Build Production Bundle

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Step 5: Package for Distribution

```bash
npm run package
```

This creates platform-specific installers in the `release/` directory.

---

## Platform-Specific Builds

### macOS

```bash
# Build for current architecture only
npm run package -- --mac

# Build for specific architecture
npm run package -- --mac --arm64    # Apple Silicon
npm run package -- --mac --x64      # Intel

# Build both architectures
npm run package -- --mac --arm64 --x64
```

**Output formats:**
- `.dmg` - Disk image installer
- `.zip` - Portable archive

### Windows

```bash
npm run package -- --win
```

**Output formats:**
- `.exe` (NSIS installer)
- Portable `.exe`

### Linux

```bash
npm run package -- --linux
```

**Output formats:**
- `.AppImage` - Portable
- `.deb` - Debian/Ubuntu package

---

## Build Configuration

The build configuration is in `package.json` under the `build` key:

```json
{
  "build": {
    "appId": "com.copypaste.app",
    "productName": "CopyPaste",
    "mac": {
      "category": "public.app-category.utilities",
      "target": ["dmg", "zip"],
      "hardenedRuntime": true
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
```

---

## Code Signing (macOS)

### For Personal Use (Unsigned)

The app works without signing, but users will see a security warning.

To bypass on first launch:
1. Right-click the app
2. Select "Open"
3. Click "Open" in the dialog

Or run:
```bash
xattr -cr /Applications/CopyPaste.app
```

### For Distribution (Signed)

To sign the app for distribution:

1. Obtain an Apple Developer certificate
2. Set environment variables:
   ```bash
   export APPLE_ID="your@email.com"
   export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
   export APPLE_TEAM_ID="XXXXXXXXXX"
   ```
3. Build with notarization:
   ```bash
   npm run package -- --mac
   ```

---

## Troubleshooting

### robotjs compilation fails

**macOS:**
```bash
xcode-select --install
```

**Windows:**
```bash
npm install --global windows-build-tools
```

**Linux:**
```bash
sudo apt install build-essential libxtst-dev libpng-dev
```

### "App is damaged and can't be opened"

```bash
xattr -cr /Applications/CopyPaste.app
```

### Electron not finding the app

Ensure you've run `npm run build` before `npm run package`.

### DMG is too large

The DMG includes all node_modules. To reduce size:
1. Use `npm prune --production` before packaging
2. Or configure `files` in package.json to exclude dev dependencies

---

## GitHub Releases

Pre-built binaries are available on the [Releases page](https://github.com/jaybarrett34/CopyPaste/releases).

### Downloading

1. Go to [Releases](https://github.com/jaybarrett34/CopyPaste/releases)
2. Download the appropriate file:
   - **Apple Silicon Mac**: `CopyPaste-X.X.X-arm64.dmg`
   - **Intel Mac**: `CopyPaste-X.X.X.dmg`
   - **Windows**: `CopyPaste-Setup-X.X.X.exe`
   - **Linux**: `CopyPaste-X.X.X.AppImage`

### Installing (macOS)

1. Open the `.dmg` file
2. Drag **CopyPaste** to **Applications**
3. Right-click and select **Open** (first time only)
4. Grant **Accessibility** permissions when prompted

---

## Automated Releases

This project uses GitHub Actions to automatically build and release when a new version tag is pushed.

To create a new release:

```bash
# Update version in package.json
npm version patch  # or minor, or major

# Push with tags
git push && git push --tags
```

The workflow will automatically:
1. Build for macOS (arm64 + x64)
2. Build for Windows (x64)
3. Build for Linux (x64)
4. Create a GitHub Release with all artifacts

---

## Development Tips

### Hot Reload

UI changes reload automatically when running `npm run electron:dev`.

Main process changes require a restart - press `Cmd+Q` and run again.

### Debugging

Open DevTools in development:
- Press `Cmd+Option+I` in the app window
- Or add `mainWindow.webContents.openDevTools()` in main.js

### Testing Keyboard Shortcuts

The app requires Accessibility permissions to simulate keystrokes:
1. Open System Settings > Privacy & Security > Accessibility
2. Enable CopyPaste (or your terminal during development)

---

## Project Structure

```
CopyPaste/
├── src/
│   ├── main.js           # Electron main process
│   ├── preload.js        # IPC bridge
│   ├── App.jsx           # React UI
│   ├── App.css           # Styling
│   ├── components/       # React components
│   └── platform/         # Platform adapters
├── build/
│   ├── icon.icns         # macOS icon
│   ├── icon.png          # Windows/Linux icon
│   └── entitlements.mac.plist
├── dist/                 # Vite build output
├── release/              # Packaged apps
└── package.json          # Dependencies & config
```

---

*Last updated: v1.1.0*
