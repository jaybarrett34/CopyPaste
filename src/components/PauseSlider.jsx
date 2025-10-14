import './PauseSlider.css';

function PauseSlider({ value, onChange }) {
  return (
    <div className="pause-slider-container">
      <div className="pause-header">
        <span className="pause-label">Pause</span>
        <span className="pause-value">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="pause-range"
      />
    </div>
  );
}

export default PauseSlider;
