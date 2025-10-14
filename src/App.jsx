import { useState, useEffect } from 'react';
import GlassSurface from './components/GlassSurface';
import TemperatureSlider from './components/TemperatureSlider';
import PauseSlider from './components/PauseSlider';
import './App.css';

function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [wpm, setWpm] = useState(80);
  const [temperature, setTemperature] = useState(50);
  const [pauseMultiplier, setPauseMultiplier] = useState(50);
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

  useEffect(() => {
    // Resize window when expansion state changes
    const width = isExpanded ? 500 : 140;
    const height = isExpanded ? 110 : 50;
    window.electron.resizeWindow({ width, height });
  }, [isExpanded]);

  const handleWpmChange = (e) => {
    const value = e.target.value;

    // Allow empty string while typing
    if (value === '') {
      setWpm('');
      return;
    }

    const newWpm = parseInt(value);
    if (!isNaN(newWpm) && newWpm >= 10 && newWpm <= 900) {
      setWpm(newWpm);
      window.electron.updateWpm(newWpm);
    }
  };

  const handleWpmBlur = () => {
    // If empty or invalid, reset to 80
    if (wpm === '' || isNaN(wpm) || wpm < 10 || wpm > 900) {
      setWpm(80);
      window.electron.updateWpm(80);
    }
  };

  const handleTemperatureChange = (newTemp) => {
    setTemperature(newTemp);
    window.electron.updateTemperature(newTemp);
  };

  const handlePauseChange = (newPause) => {
    setPauseMultiplier(newPause);
    window.electron.updatePause(newPause);
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
        width={isExpanded ? 500 : 140}
        height={isExpanded ? 110 : 50}
        borderRadius={isExpanded ? 20 : 25}
        className="control-bar"
      >
        <div className="controls" style={{ flexDirection: isExpanded ? 'column' : 'row', padding: isExpanded ? '10px 16px' : '6px 12px', gap: isExpanded ? '6px' : '8px' }}>
          {!isExpanded ? (
            <>
              <div className="status-indicator">
                <div className={`status-light ${getStatusLightClass()}`} />
              </div>
              <button
                className="expand-btn"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                +
              </button>
            </>
          ) : (
            <>
              <div className="expanded-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                <div className="status-indicator">
                  <div className={`status-light ${getStatusLightClass()}`} />
                </div>
                <button
                  className="expand-btn"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  −
                </button>
                <div className="control-group">
                  <label htmlFor="wpm">WPM</label>
                  <input
                    id="wpm"
                    type="number"
                    value={wpm}
                    onChange={handleWpmChange}
                    onBlur={handleWpmBlur}
                    min="10"
                    max="900"
                    className="wpm-input"
                  />
                </div>
                <div className="shortcut-info" style={{ marginLeft: 'auto' }}>
                  <code>⌘⌥V</code>
                </div>
              </div>
              <div className="expanded-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', paddingLeft: '46px' }}>
                <TemperatureSlider
                  value={temperature}
                  onChange={handleTemperatureChange}
                />
              </div>
              <div className="expanded-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', paddingLeft: '46px' }}>
                <PauseSlider
                  value={pauseMultiplier}
                  onChange={handlePauseChange}
                />
              </div>
            </>
          )}
        </div>
      </GlassSurface>
    </div>
  );
}

export default App;
