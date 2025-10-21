import { useState } from 'react';
import GlassSurface from './GlassSurface';
import './Settings.css';

const Settings = ({ isOpen, onClose, shortcuts, onShortcutsChange }) => {
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [recordedKeys, setRecordedKeys] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen) return null;

  const shortcutLabels = {
    startStop: 'Start/Stop Typing',
    pauseResume: 'Pause/Resume',
    moveUp: 'Move Window Up',
    moveDown: 'Move Window Down',
    moveLeft: 'Move Window Left',
    moveRight: 'Move Window Right'
  };

  const handleKeyDown = (e) => {
    if (!isRecording) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const keys = [];
    if (e.metaKey || e.ctrlKey) keys.push('CommandOrControl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    
    // Get the actual key (not the modifier)
    const key = e.key.toUpperCase();
    if (key !== 'META' && key !== 'CONTROL' && key !== 'ALT' && key !== 'SHIFT') {
      keys.push(key);
    }
    
    setRecordedKeys(keys);
  };

  const handleKeyUp = (e) => {
    if (!isRecording) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (recordedKeys.length > 0) {
      const newShortcut = recordedKeys.join('+');
      onShortcutsChange({ ...shortcuts, [editingShortcut]: newShortcut });
      setIsRecording(false);
      setEditingShortcut(null);
      setRecordedKeys([]);
    }
  };

  const startRecording = (shortcutKey) => {
    setEditingShortcut(shortcutKey);
    setIsRecording(true);
    setRecordedKeys([]);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setEditingShortcut(null);
    setRecordedKeys([]);
  };

  const resetToDefaults = () => {
    const defaults = {
      startStop: 'CommandOrControl+Alt+V',
      pauseResume: 'CommandOrControl+Shift+P',
      moveUp: 'CommandOrControl+Alt+Up',
      moveDown: 'CommandOrControl+Alt+Down',
      moveLeft: 'CommandOrControl+Alt+Left',
      moveRight: 'CommandOrControl+Alt+Right'
    };
    onShortcutsChange(defaults);
  };

  return (
    <div className="settings-overlay" onClick={onClose} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} tabIndex={-1}>
      <div className="settings-container" onClick={(e) => e.stopPropagation()}>
        <GlassSurface
          width={500}
          height={450}
          borderRadius={20}
          className="settings-surface"
        >
          <div className="settings-content">
            <div className="settings-header">
              <h2>Settings</h2>
              <button className="close-btn" onClick={onClose}>✕</button>
            </div>
            
            <div className="settings-section">
              <h3>Keyboard Shortcuts</h3>
              <div className="shortcuts-list">
                {Object.entries(shortcutLabels).map(([key, label]) => (
                  <div key={key} className="shortcut-item">
                    <span className="shortcut-label">{label}</span>
                    <div className="shortcut-control">
                      {isRecording && editingShortcut === key ? (
                        <div className="recording-indicator">
                          <span className="recording-text">
                            {recordedKeys.length > 0 ? recordedKeys.join('+') : 'Press keys...'}
                          </span>
                          <button className="cancel-btn" onClick={cancelRecording}>Cancel</button>
                        </div>
                      ) : (
                        <>
                          <code className="shortcut-display">{shortcuts[key]}</code>
                          <button 
                            className="edit-shortcut-btn"
                            onClick={() => startRecording(key)}
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="settings-footer">
              <button className="reset-btn" onClick={resetToDefaults}>Reset to Defaults</button>
              <button className="save-btn" onClick={onClose}>Done</button>
            </div>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
};

export default Settings;
