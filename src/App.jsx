import { useState, useEffect } from 'react';
import GlassSurface from './components/GlassSurface';
import './App.css';

function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [wpm, setWpm] = useState(80);
  const [typingState, setTypingState] = useState('ready'); // ready, typing, paused, error

  useEffect(() => {
    // Listen for typing state changes
    window.electron.onTypingStateChange((state) => {
      setTypingState(state);
    });

    // Request initial state
    window.electron.getTypingState().then(state => {
      setTypingState(state.isTyping ? (state.isPaused ? 'paused' : 'typing') : 'ready');
    });
  }, []);

  const handleWpmChange = (e) => {
    const value = e.target.value;

    // Allow empty string while typing
    if (value === '') {
      setWpm('');
      return;
    }

    const newWpm = parseInt(value);
    if (!isNaN(newWpm) && newWpm >= 10 && newWpm <= 300) {
      setWpm(newWpm);
      window.electron.updateWpm(newWpm);
    }
  };

  const handleWpmBlur = () => {
    // If empty or invalid, reset to 80
    if (wpm === '' || isNaN(wpm) || wpm < 10 || wpm > 300) {
      setWpm(80);
      window.electron.updateWpm(80);
    }
  };

  const getStatusLightClass = () => {
    switch (typingState) {
      case 'typing':
        return 'status-light-typing';
      case 'paused':
        return 'status-light-paused';
      case 'error':
        return 'status-light-error';
      default:
        return 'status-light-ready';
    }
  };

  return (
    <div className="app-container">
      <GlassSurface
        width={isExpanded ? 240 : 140}
        height={50}
        borderRadius={25}
        className="control-bar"
      >
        <div className="controls">
          <div className="status-indicator">
            <div className={`status-light ${getStatusLightClass()}`} />
          </div>

          <button
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </button>

          {isExpanded && (
            <div className="expanded-controls">
              <div className="control-group">
                <label htmlFor="wpm">WPM</label>
                <input
                  id="wpm"
                  type="number"
                  value={wpm}
                  onChange={handleWpmChange}
                  onBlur={handleWpmBlur}
                  min="10"
                  max="300"
                  className="wpm-input"
                />
              </div>
              <div className="shortcut-info">
                <code>⌘⌥V</code>
              </div>
            </div>
          )}
        </div>
      </GlassSurface>
    </div>
  );
}

export default App;
