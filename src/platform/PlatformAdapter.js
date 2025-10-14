/**
 * Platform Adapter - Abstracts platform-specific differences
 * Handles macOS, Windows, and Linux platform variations
 */

class PlatformAdapter {
  constructor() {
    this.platform = process.platform; // darwin, win32, linux
  }

  /**
   * Get platform-specific window options
   */
  getWindowOptions() {
    if (this.platform === 'darwin') {
      // macOS - use vibrancy for native glass effect
      return {
        vibrancy: 'under-window',
        visualEffectState: 'active',
        transparent: true
      };
    } else if (this.platform === 'win32') {
      // Windows - use acrylic or transparent
      return {
        transparent: true,
        backgroundMaterial: 'acrylic' // Windows 11+
      };
    } else {
      // Linux - basic transparency
      return {
        transparent: true,
        frame: false
      };
    }
  }

  /**
   * Set content protection (best effort)
   * Only works on macOS and Windows, with limitations
   */
  setContentProtection(window, enabled) {
    if (this.platform === 'darwin' || this.platform === 'win32') {
      try {
        window.setContentProtection(enabled);
        return true;
      } catch (e) {
        return false;
      }
    }
    // Linux: no support
    return false;
  }

  /**
   * Format shortcut for platform-specific display
   * macOS: ⌘⌥V
   * Windows/Linux: Ctrl+Alt+V
   */
  formatShortcut(shortcut) {
    if (this.platform === 'darwin') {
      return shortcut
        .replace('CommandOrControl', '⌘')
        .replace('Alt', '⌥')
        .replace('Shift', '⇧')
        .replace('Control', '⌃')
        .replace('+', '');
    } else {
      return shortcut
        .replace('CommandOrControl', 'Ctrl')
        .replace('Alt', 'Alt')
        .replace('Shift', 'Shift');
    }
  }

  /**
   * Get platform name for display
   */
  getPlatformName() {
    switch (this.platform) {
      case 'darwin':
        return 'macOS';
      case 'win32':
        return 'Windows';
      case 'linux':
        return 'Linux';
      default:
        return 'Unknown';
    }
  }

  /**
   * Check if content protection is available
   */
  hasContentProtection() {
    return this.platform === 'darwin' || this.platform === 'win32';
  }

  /**
   * Get platform-specific icon path
   */
  getIconPath(buildPath) {
    if (this.platform === 'darwin') {
      return `${buildPath}/icon.icns`;
    } else if (this.platform === 'win32') {
      return `${buildPath}/icon.ico`;
    } else {
      return `${buildPath}/icon.png`;
    }
  }
}

module.exports = new PlatformAdapter();
