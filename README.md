# CopyPaste

**Natural typing automation that bypasses paste detection**

CopyPaste simulates human-like keyboard typing from your clipboard, making it indistinguishable from actual human typing. Perfect for forms and applications that block Ctrl+V/Cmd+V pasting.

[![Download](https://img.shields.io/github/v/release/jaybarrett34/CopyPaste?label=Download&style=for-the-badge)](https://github.com/jaybarrett34/CopyPaste/releases/latest)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue?style=for-the-badge)]()
[![License](https://img.shields.io/badge/license-ISC-green?style=for-the-badge)]()

---

## Download

**[Download Latest Release](https://github.com/jaybarrett34/CopyPaste/releases/latest)**

| Platform | File | Architecture |
|----------|------|--------------|
| macOS (Apple Silicon) | `CopyPaste-X.X.X-arm64.dmg` | M1/M2/M3 |
| macOS (Intel) | `CopyPaste-X.X.X.dmg` | x64 |
| Windows | `CopyPaste-Setup-X.X.X.exe` | x64 |
| Linux | `CopyPaste-X.X.X.AppImage` | x64 |

---

## Features

- **Bypass Paste Detection** - Type where Ctrl+V is blocked
- **Human-Like Typing** - Variable timing, realistic pauses
- **Adjustable Speed** - 10 to 900 WPM
- **Temperature Control** - From robotic to erratic typing
- **Minimal UI** - Glass morphism, always-on-top
- **Cross-Platform** - macOS, Windows, Linux

---

## Quick Start

### 1. Install

**macOS:**
1. Download the `.dmg` from [Releases](https://github.com/jaybarrett34/CopyPaste/releases)
2. Open and drag to Applications
3. Right-click > Open (first time only)
4. Grant Accessibility permissions when prompted

**Windows:**
1. Download the `.exe` installer
2. Run and follow the prompts

**Linux:**
1. Download the `.AppImage`
2. Make executable: `chmod +x CopyPaste-*.AppImage`
3. Run it

### 2. Copy Text

Copy any text to your clipboard with `Cmd+C` (or `Ctrl+C`)

### 3. Focus Target

Click in the text field where you want to type

### 4. Type!

Press **`Cmd+Alt+V`** (macOS) or **`Ctrl+Alt+V`** (Windows/Linux)

Watch as it types your clipboard naturally!

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Alt+V` | Start/Stop typing |
| `Cmd+Shift+P` | Pause/Resume |
| `Cmd+Alt+Arrow` | Move window |
| `Cmd+Q` | Quit |

*On Windows/Linux, use `Ctrl` instead of `Cmd`*

---

## User Interface

### Collapsed (Default)
```
┌──────────────┐
│ 🟡  [+]      │
└──────────────┘
```
Click **[+]** to expand and access controls.

### Expanded
```
┌────────────────────────────────────────┐
│ 🟡 [-] WPM [120]           ⌘⌥V        │
│      Temp [━━━━●] 50% Natural          │
└────────────────────────────────────────┘
```

### Status Light Colors

| Color | Meaning |
|-------|---------|
| 🟡 Yellow | Ready |
| 🔵 Blue (pulsing) | Typing |
| 🟠 Orange | Paused |
| 🔴 Red | Error |

---

## Temperature System

The temperature slider controls how "human" the typing appears:

| Temperature | Mode | Behavior |
|-------------|------|----------|
| 0% | Robot | Zero variation, exact timing |
| 25% | Fast | Minimal variation |
| 50% | Natural | Realistic human typing (default) |
| 75% | Human | High variation, noticeable pauses |
| 100% | Erratic | Maximum randomness |

### Examples

**Instant paste (looks like typing):**
- WPM: 900, Temperature: 0%

**Natural data entry:**
- WPM: 120, Temperature: 50%

**Avoid detection:**
- WPM: 80, Temperature: 75%

---

## Use Cases

- **Form Auto-Fill** - Type in fields that block paste
- **Resume Uploads** - Sites that require manual entry
- **Chat Applications** - Look like you're typing naturally
- **Data Entry** - Automated but human-looking input
- **Testing** - Simulate real user keyboard input

---

## Building from Source

See [BUILD.md](BUILD.md) for detailed build instructions.

```bash
# Quick build
git clone https://github.com/jaybarrett34/CopyPaste.git
cd CopyPaste
npm install
npm run build
npm run package
```

---

## Troubleshooting

### "App is damaged and can't be opened" (macOS)
```bash
xattr -cr /Applications/CopyPaste.app
```

### App doesn't type anything
1. Check Accessibility permissions in System Settings
2. Restart the app after granting permissions
3. Ensure clipboard has content

### Window disappeared
Press `Cmd+Alt+Arrow` to move it back, or restart the app

---

## Requirements

- **macOS** 10.15+ (Catalina or later)
- **Windows** 10+ (64-bit)
- **Linux** Ubuntu 18.04+ or equivalent

### Permissions Required

- **Accessibility** - Required for keyboard simulation
- **Clipboard** - Required to read paste content

---

## Known Limitations

- **Screen Capture**: Cannot prevent modern screen capture tools (macOS 15+)
- **Settings**: Don't persist between restarts (intentional)
- **Signing**: macOS builds are unsigned (right-click > Open to bypass)

---

## License

ISC License - See [LICENSE](LICENSE) for details.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [BUILD.md](BUILD.md) for development setup.

---

## Acknowledgments

Built with:
- [Electron](https://electronjs.org)
- [React](https://reactjs.org)
- [robotjs](https://github.com/jitsi/robotjs)
- [Vite](https://vitejs.dev)

---

*Made with minimal UI and maximum utility*
