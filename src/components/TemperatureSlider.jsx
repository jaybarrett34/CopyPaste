import { useState, useEffect } from 'react';
import './TemperatureSlider.css';

function TemperatureSlider({ initialTemp = 50, onChange }) {
  const [temperature, setTemperature] = useState(initialTemp);

  const handleChange = (e) => {
    const value = parseInt(e.target.value);
    setTemperature(value);
    if (onChange) {
      onChange(value);
    }
  };

  const getTemperatureLabel = () => {
    if (temperature <= 10) return 'Robot';
    if (temperature <= 40) return 'Fast';
    if (temperature <= 60) return 'Human';
    if (temperature <= 80) return 'Natural';
    return 'Erratic';
  };

  return (
    <div className="temperature-slider">
      <div className="slider-label">
        <span>Temp</span>
        <span className="temp-value">{temperature}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={temperature}
        onChange={handleChange}
        className="temp-range"
      />
      <div className="temp-mode">{getTemperatureLabel()}</div>
    </div>
  );
}

export default TemperatureSlider;
