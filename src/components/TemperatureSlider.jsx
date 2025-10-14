import './TemperatureSlider.css';

function TemperatureSlider({ value, onChange }) {
  return (
    <div className="temperature-slider">
      <span className="slider-label">T:</span>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="temp-range"
      />
      <span className="temp-value">{value}%</span>
    </div>
  );
}

export default TemperatureSlider;
