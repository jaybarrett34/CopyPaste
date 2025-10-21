/**
 * Platform Adapter - Abstracts platform-specific differences
 * Handles macOS and Linux platform variations
 */

class PlatformAdapter {
  constructor() {
    this.platform = process.platform; // darwin or linux
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
    } else {
      // Linux - basic transparency with frame disabled
      return {
        transparent: true,
        frame: false
      };
    }
  }

  /**
   * Set content protection (macOS only)
   * Note: This doesn't block modern screen capture tools on macOS 15+
   */
  setContentProtection(window, enabled) {
    if (this.platform === 'darwin') {
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
   * Linux: Ctrl+Alt+V
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
    return this.platform === 'darwin' ? 'macOS' : 'Linux';
  }

  /**
   * Check if content protection is available
   */
  hasContentProtection() {
    return this.platform === 'darwin';
  }

  /**
   * Get platform-specific icon path
   */
  getIconPath(buildPath) {
    if (this.platform === 'darwin') {
      return `${buildPath}/icon.icns`;
    } else {
      return `${buildPath}/icon.png`;
    }
  }

  /**
   * Check if running on macOS
   */
  isMacOS() {
    return this.platform === 'darwin';
  }

  /**
   * Check if running on Linux
   */
  isLinux() {
    return this.platform === 'linux';
  }
}

module.exports = new PlatformAdapter();
