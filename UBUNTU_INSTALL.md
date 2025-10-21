# Installing CopyPaste on Ubuntu

Complete installation guide for running CopyPaste on a fresh Ubuntu VM.

---

## 📋 Prerequisites

### System Requirements
- **Ubuntu**: 20.04, 22.04, or 24.04 (64-bit)
- **RAM**: 2GB minimum
- **Disk Space**: ~500MB for dependencies + app
- **Display Server**: X11 (Wayland may have issues with robotjs)

---

## 🔧 Step 1: Install System Dependencies

### Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### Install Node.js (v18 or higher)
```bash
# Install Node.js 22.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v22.x.x
npm --version   # Should show 10.x.x
```

### Install Build Tools (Required for robotjs)
```bash
sudo apt install -y \
  build-essential \
  git \
  python3 \
  libx11-dev \
  libxtst-dev \
  libpng-dev \
  libjpeg-dev \
  libxrandr-dev \
  libxinerama-dev \
  libxcursor-dev \
  libxi-dev \
  pkg-config
```

### Install Additional X11 Libraries
```bash
# These are needed for @jitsi/robotjs to work properly
sudo apt install -y \
  x11-xserver-utils \
  xdotool \
  libxtst6
```

---

## 📥 Step 2: Get the Code

### Option A: Clone from Git (Recommended)
```bash
cd ~
git clone https://github.com/jaybarrett34/CopyPaste.git
cd CopyPaste
```

### Option B: Download ZIP
```bash
cd ~
wget https://github.com/jaybarrett34/CopyPaste/archive/refs/heads/main.zip
unzip main.zip
cd CopyPaste-main
```

---

## 📦 Step 3: Install Dependencies

```bash
# Install npm packages (this will take a few minutes)
npm install

# If you get errors about robotjs, try:
npm rebuild @jitsi/robotjs --build-from-source
```

### Common Issues & Fixes

#### Error: "node-gyp not found"
```bash
sudo npm install -g node-gyp
```

#### Error: "Python not found"
```bash
sudo apt install -y python3-pip
sudo ln -s /usr/bin/python3 /usr/bin/python
```

#### Error: "X11 libraries not found"
```bash
# Re-run the X11 dependencies installation
sudo apt install -y libx11-dev libxtst-dev libpng-dev
```

---

## 🏗️ Step 4: Build the Application

```bash
# Build the Vite frontend
npm run build

# This should output:
# ✓ built in ~2s
```

---

## 🚀 Step 5: Run CopyPaste

### Development Mode (Recommended for Testing)
```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron (in a new terminal)
npm run electron
```

### Production Mode
```bash
npm run electron
```

---

## 📦 Step 6: Build Installer (Optional)

### Build AppImage (Portable)
```bash
npm run package

# Output will be in: release/CopyPaste-1.2.0-x86_64.AppImage
```

### Install the AppImage
```bash
# Make it executable
chmod +x release/CopyPaste-1.2.0-x86_64.AppImage

# Run it
./release/CopyPaste-1.2.0-x86_64.AppImage
```

### Build .deb Package (System Installation)
```bash
# The package command builds both AppImage and .deb
npm run package

# Install the .deb
sudo dpkg -i release/copypaste_1.2.0_amd64.deb

# If there are dependency issues:
sudo apt --fix-broken install
```

---

## 🔒 Step 7: Grant Permissions

CopyPaste needs permission to control your keyboard/mouse.

### For X11 (Standard Ubuntu)
No additional permissions needed! X11 allows applications to simulate keyboard input.

### For Wayland (Ubuntu 23.04+)
Wayland has stricter security. You may need to:

```bash
# Switch to X11 session
# Log out, click gear icon on login screen, select "Ubuntu on Xorg"
```

---

## ✅ Step 8: Test the Application

### Quick Test Checklist
1. **Copy some text** to clipboard (Ctrl+C)
2. **Press Ctrl+Alt+V** (should start typing)
3. **Press Ctrl+Alt+V again** (should stop typing)
4. **Click the + button** (should expand UI)
5. **Click the ⚙ button** (should open settings)
6. **Try rebinding a shortcut** (click Edit, press keys)

---

## 🐛 Troubleshooting

### App doesn't start
```bash
# Check if all dependencies are installed
npm install

# Check for errors
npm run electron 2>&1 | tee error.log
```

### Window is invisible/transparent
```bash
# This might be a compositor issue
# Try disabling desktop effects or switching to X11
```

### Shortcuts don't work
```bash
# Check if another app is using the same shortcuts
# Try rebinding in Settings (⚙ button)

# Verify X11 is running:
echo $XDG_SESSION_TYPE  # Should show "x11"
```

### "robotjs" errors during npm install
```bash
# Rebuild robotjs from source
npm rebuild @jitsi/robotjs --build-from-source

# If that fails, ensure all build tools are installed:
sudo apt install -y build-essential libx11-dev libxtst-dev
```

### App crashes when typing
```bash
# Check if accessibility permissions are needed
# Some Ubuntu versions require:
gsettings set org.gnome.desktop.interface toolkit-accessibility true
```

---

## 🎯 Performance Tips

### Reduce Memory Usage
```bash
# Run in production mode instead of dev mode
npm run build
npm run electron
```

### Auto-start on Login
```bash
# Create desktop entry
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/copypaste.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=CopyPaste
Exec=/path/to/CopyPaste/node_modules/.bin/electron /path/to/CopyPaste/src/main.js
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF

# Replace /path/to/CopyPaste with actual path
```

---

## 📊 System Resource Usage

When running, CopyPaste typically uses:
- **CPU**: < 1% idle, ~5-10% while typing
- **RAM**: ~150-200 MB
- **Disk**: ~350 MB (with node_modules)

---

## 🔄 Updating CopyPaste

```bash
cd ~/CopyPaste
git pull origin main
npm install
npm run build
```

---

## 🗑️ Uninstalling

### If installed via .deb:
```bash
sudo apt remove copypaste
```

### If running from source:
```bash
rm -rf ~/CopyPaste
rm -rf ~/.config/CopyPaste  # Removes settings
```

---

## 🆘 Getting Help

### Check Logs
```bash
# Electron logs
npm run electron 2>&1 | tee copypaste.log

# System logs
journalctl --user -xe | grep -i electron
```

### Report Issues
1. Check existing issues: https://github.com/jaybarrett34/CopyPaste/issues
2. Create new issue with:
   - Ubuntu version (`lsb_release -a`)
   - Node version (`node --version`)
   - Error logs
   - Steps to reproduce

---

## ✨ Quick Start Script

Save this as `install-copypaste.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Installing CopyPaste on Ubuntu..."

# Update system
echo "📦 Updating system packages..."
sudo apt update

# Install Node.js
echo "📥 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install build dependencies
echo "🔧 Installing build tools..."
sudo apt install -y \
  build-essential git python3 \
  libx11-dev libxtst-dev libpng-dev \
  libjpeg-dev libxrandr-dev libxinerama-dev \
  libxcursor-dev libxi-dev pkg-config \
  x11-xserver-utils xdotool libxtst6

# Clone repository
echo "📂 Cloning CopyPaste..."
cd ~
git clone https://github.com/jaybarrett34/CopyPaste.git
cd CopyPaste

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Build
echo "🏗️ Building application..."
npm run build

# Done
echo "✅ Installation complete!"
echo ""
echo "To run CopyPaste:"
echo "  cd ~/CopyPaste"
echo "  npm run electron"
echo ""
echo "To build installer:"
echo "  npm run package"
```

Make it executable and run:
```bash
chmod +x install-copypaste.sh
./install-copypaste.sh
```

---

## 📝 Notes

- **Display Server**: X11 is recommended. Wayland support is experimental.
- **VM Graphics**: If running in a VM, ensure 3D acceleration is enabled for best performance.
- **Headless**: CopyPaste requires a display server (X11/Wayland). Won't work on headless servers.
- **Security**: The app needs to simulate keyboard input, which some security tools may flag.

---

**Last Updated**: October 21, 2025  
**Version**: 1.2.0  
**Tested On**: Ubuntu 22.04 LTS, Ubuntu 24.04 LTS
