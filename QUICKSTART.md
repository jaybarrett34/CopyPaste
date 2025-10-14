# 🚀 CopyPaste v1.1.0 - Quick Start Guide

## What's New in v1.1.0

### Major Features Added
- ✅ **Accurate WPM Calculation** - Fixed formula, now truly matches set WPM
- ✅ **Temperature System** - 0-100% slider for typing variation control
- ✅ **Dynamic UI** - Window resizes from 140×50 to 500×85 pixels
- ✅ **Extended WPM Range** - Now supports 10-900 WPM (was 10-300)
- ✅ **Fixed Arrow Keys** - Changed to Cmd+Alt+Arrow (from Cmd+Shift)
- ✅ **Cross-Platform** - Windows and Linux build support added

---

## Installation

### macOS (Apple Silicon)
1. Open `release/CopyPaste-1.1.0-arm64.dmg`
2. Drag **CopyPaste.app** to Applications folder
3. Right-click and select "Open" (first time only)
4. Grant **Accessibility** permissions when prompted

### macOS (Intel)
Same steps, but use `release/CopyPaste-1.1.0.dmg`

---

## Quick Usage

### Step 1: Copy Text
Copy any text to your clipboard (Cmd+C)

### Step 2: Click Where You Want to Type
Focus the text field or app where you want the text typed

### Step 3: Trigger Typing
Press **`Cmd+Alt+V`** to start typing from clipboard

### Step 4: Enjoy Natural Typing
Watch as it types with human-like timing and variation!

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **`Cmd+Alt+V`** | Start/Stop typing |
| **`Cmd+Shift+P`** | Pause/Resume typing |
| **`Cmd+Alt+↑↓←→`** | Move window (NEW!) |
| **`Cmd+Q`** | Quit application |

---

## Understanding the UI

### Collapsed State (140×50px)
```
┌──────────────┐
│ 🟡  [+]      │
└──────────────┘
```
- **Yellow light** = Ready to type
- **[+] button** = Click to expand

### Expanded State (500×85px)
```
┌────────────────────────────────────────┐
│ 🟡 [-] WPM [120]           ⌘⌥V        │
│      Temp [━━━━●] 50% Natural          │
└────────────────────────────────────────┘
```
- **[-] button** = Click to collapse
- **WPM input** = Set typing speed (10-900)
- **Temp slider** = Set variation (0-100%)
- **⌘⌥V** = Active keyboard shortcut

---

## Status Light Colors

| Color | Meaning |
|-------|---------|
| 🟡 **Yellow** | Ready - waiting for command |
| 🔵 **Blue** (pulsing) | Typing - actively typing |
| 🟠 **Orange** | Paused - typing paused |
| 🔴 **Red** (pulsing) | Error - something went wrong |

---

## Temperature System Explained

The **Temperature slider** controls typing variation:

### 0% - Robot Mode
- **Zero variation** in timing
- **Instant typing** at exact WPM
- Use for: Maximum speed, data entry

### 25% - Fast Mode
- **Minimal variation**
- Consistent but fast
- Use for: Quick form filling

### 50% - Natural Mode (Default)
- **Human-like variation**
- Realistic pauses
- Use for: General typing, avoiding detection

### 75% - Human Mode
- **High variation**
- Noticeable pauses between words
- Use for: Maximum human-like behavior

### 100% - Erratic Mode
- **Maximum variation**
- Random pauses and timing
- Use for: Simulating tired/distracted typing

---

## Example Use Cases

### Instant Paste (but looks like typing)
```
WPM: 900
Temperature: 0%
Result: Types instantly with no variation
```

### Natural Data Entry
```
WPM: 120
Temperature: 50%
Result: Fast but realistic typing
```

### Avoid Paste Detection
```
WPM: 80
Temperature: 75%
Result: Indistinguishable from human typing
```

### Slow/Careful Typing
```
WPM: 60
Temperature: 100%
Result: Deliberate, careful typing with pauses
```

---

## Tips & Tricks

### Moving the Window
1. **Drag** from anywhere on the glass surface
2. **Or use** Cmd+Alt+Arrow keys for precise positioning
3. Window stays **always on top** of other apps

### Adjusting Speed Mid-Typing
- WPM changes apply **immediately** to current typing session
- Temperature changes apply to **next session**

### Copying Long Text
- No limits on text length
- Handles special characters, unicode, emoji
- Maintains formatting (newlines, tabs)

### If Typing Won't Start
1. Check Accessibility permissions (System Settings)
2. Verify clipboard has text (Cmd+C)
3. Make sure a text field is focused
4. Try clicking in the target app first

---

## Known Limitations

### Screen Capture Protection
- ⚠️ **macOS**: Cannot block Cmd+Shift+5, Zoom, or Hubstaff
- This is a technical limitation (Apple's ScreenCaptureKit bypasses protection)
- Best effort protection is enabled, but modern tools can capture
- See CLAUDE.md for full technical explanation

### Settings Persistence
- Settings reset on app restart (intentional design choice)
- Default: 80 WPM, 50% temperature

### Platform Support
- **macOS**: Fully tested and working
- **Windows**: Build available, needs testing
- **Linux**: Build available, needs testing

---

## Troubleshooting

### "App is damaged and can't be opened"
```bash
xattr -cr /Applications/CopyPaste.app
```

### App doesn't type anything
- Grant Accessibility permissions
- Restart app after granting permissions
- Check clipboard has content

### Window disappeared
- Press Cmd+Alt+Arrow to move it back
- Or quit (Cmd+Q) and reopen

### Status light stays yellow
- Clipboard is empty, copy some text first
- Or typing finished successfully

---

## Advanced

### For Developers
```bash
# Run in dev mode
npm run dev          # Start Vite dev server
npm run electron     # Start Electron app

# Build from source
npm run build        # Build Vite bundle
npm run package      # Package macOS app

# See CLAUDE.md for architecture details
```

### File Locations
- **App**: `/Applications/CopyPaste.app`
- **Source**: `/Users/bigballsinyourjaws/Projects/CopyPaste/`
- **Builds**: `/Users/bigballsinyourjaws/Projects/CopyPaste/release/`

---

## Support & Feedback

- **GitHub**: https://github.com/jaybarrett34/CopyPaste
- **Documentation**: See `CLAUDE.md` for technical details
- **Testing**: See testing checklist in CLAUDE.md

---

**Enjoy your enhanced typing automation!** 🎉

*v1.1.0 - October 14, 2025*
