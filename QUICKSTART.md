# CopyPaste v1.1.0 - Quick Start Guide

## 🚀 Installation

1. **Download**: `/Users/bigballsinyourjaws/Projects/CopyPaste/release/CopyPaste-1.1.0-arm64.dmg`
2. **Mount**: Double-click the DMG file
3. **Install**: Drag CopyPaste.app to your Applications folder
4. **Launch**: Open CopyPaste from Applications
5. **Grant Permissions**: Click "Open System Settings" when prompted and enable Accessibility

## 🎮 Basic Usage

### Starting the App
- The app appears as a small glass window at the top center of your screen
- Yellow status light = Ready
- Blue pulsing light = Typing
- Orange light = Paused
- Red pulsing light = Error

### Quick Typing
1. Copy any text to your clipboard (Cmd+C)
2. Focus the text field where you want to type
3. Press **Cmd+Alt+V**
4. Watch it type naturally!

## 🎛️ Controls

### Collapsed View (140×50 pixels)
- **Status Light**: Shows current state
- **+ Button**: Expand to access settings

### Expanded View (500×85 pixels)
- **- Button**: Collapse back to minimal view
- **WPM Input**: Set typing speed (10-900)
- **Temperature Slider**: Control typing variation (0-100%)
- **Shortcut Display**: Shows active shortcut (⌘⌥V)

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Cmd+Alt+V** | Start/Stop typing |
| **Cmd+Shift+P** | Pause/Resume typing |
| **Cmd+Alt+Up** | Move window up |
| **Cmd+Alt+Down** | Move window down |
| **Cmd+Alt+Left** | Move window left |
| **Cmd+Alt+Right** | Move window right |
| **Cmd+Q** | Quit application |

## 🌡️ Temperature Settings

Temperature controls how "human" the typing feels:

| Temp | Mode | Behavior |
|------|------|----------|
| **0-10%** | Robot | Zero variation, instant typing |
| **11-40%** | Fast | Minimal variation, quick |
| **41-60%** | Human | Realistic natural variation (default 50%) |
| **61-80%** | Natural | Increased human-like pauses |
| **81-100%** | Erratic | Very human, lots of pauses |

### Recommended Settings

**Instant Paste-Like Typing:**
- WPM: 900
- Temperature: 0%

**Fast but Realistic:**
- WPM: 120
- Temperature: 30%

**Natural Human Typing:**
- WPM: 80
- Temperature: 50% (default)

**Slow Deliberate Typing:**
- WPM: 40
- Temperature: 75%

**Very Human (for strict detection):**
- WPM: 60
- Temperature: 100%

## 🧪 Testing Your Setup

### Test 1: Basic Typing
1. Copy this text: "The quick brown fox jumps over the lazy dog."
2. Open TextEdit or any text field
3. Press Cmd+Alt+V
4. Verify it types correctly

### Test 2: WPM Accuracy
1. Copy ~100 words of text
2. Set WPM to 60
3. Start a timer
4. Press Cmd+Alt+V
5. It should take approximately 1 minute 40 seconds

### Test 3: Temperature Variation
1. Copy some text
2. Set temperature to 0%, type it (should be very fast and consistent)
3. Set temperature to 100%, type it again (should have lots of pauses)

### Test 4: Pause/Resume
1. Start typing a long text
2. Press Cmd+Shift+P to pause
3. Press Cmd+Shift+P again to resume

## 🐛 Troubleshooting

### App Won't Type Anything
- **Check Accessibility Permissions**: System Settings → Privacy & Security → Accessibility
- **Check Clipboard**: Make sure you have text copied (Cmd+C)
- **Check Focus**: Click in the text field where you want to type

### Typing is Too Fast/Slow
- Adjust WPM: Click + to expand, change WPM value
- For instant typing: Set WPM to 900 and temperature to 0%
- For realistic typing: Set WPM to 60-80 and temperature to 50%

### Window is in the Wrong Place
- **Drag It**: Click and drag the window anywhere
- **Use Arrows**: Cmd+Alt+Up/Down/Left/Right to move by 10 pixels

### Can't See the Window
- Window is always-on-top, even over fullscreen apps
- Look at the top center of your screen
- Try Cmd+Alt+Down to move it down

### Shortcuts Not Working
- Make sure no other app is using the same shortcuts
- Arrow key shortcuts changed from Cmd+Shift to Cmd+Alt in v1.1.0

## 💡 Pro Tips

1. **Drag from Anywhere**: The entire window is draggable, not just the title bar
2. **Quick Settings**: Keep expanded when adjusting settings, collapse for minimal distraction
3. **Status Light**: Watch the status light to know when typing is complete
4. **WPM Range**: Try 900 WPM for instant paste-like speed
5. **Temperature**: Use 0% for speed, 100% for bypassing paste detection

## 🎯 Use Cases

### Bypass Paste Detection
- Some websites detect Cmd+V and block pasting
- Use CopyPaste with 60 WPM and 75% temperature to appear human

### Fast Data Entry
- Use 300-900 WPM with 0% temperature for rapid entry
- Still looks like typing to the system

### Natural Typing
- Default settings (80 WPM, 50% temp) work for most cases
- Adjust temperature based on how strict the detection is

### Long Documents
- CopyPaste handles 1000+ words without issues
- You can stop anytime with Cmd+Alt+V

## 📊 Performance

- **Typing Speed**: 10-900 WPM
- **Text Length**: Unlimited (tested with 1000+ words)
- **Character Support**: All ASCII, Unicode, emoji, special characters
- **Window Size**: Minimal 140×50 pixels when collapsed
- **Memory Usage**: ~100 MB (Electron app)

## ⚠️ Known Limitations

1. **Screen Capture Protection**: Enabled but won't block modern tools (Cmd+Shift+5, Zoom)
2. **Settings Persistence**: Settings reset when app closes (intentional)
3. **Shortcut Customization**: Not yet implemented

## 🆘 Support

If you encounter issues:
1. Check CLAUDE.md for detailed documentation
2. Review CHANGELOG.md for recent changes
3. Test with the checklist in CLAUDE.md

## 📦 Version Info

- **Version**: 1.1.0
- **Release Date**: October 14, 2025
- **Platform**: macOS (Apple Silicon + Intel)
- **Size**: 111 MB DMG, 105 MB ZIP

---

**Enjoy natural typing automation!**
