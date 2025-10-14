import './PauseSlider.css';

function PauseSlider({ value, onChange }) {
  return (
    <div className="pause-slider-container">
      <span className="pause-label">P:</span>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="pause-range"
      />
      <span className="pause-value">{value}%</span>
    </div>
  );
}

export default PauseSlider;
