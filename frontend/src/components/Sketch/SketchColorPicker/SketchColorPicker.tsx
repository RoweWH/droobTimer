import { SketchColorSwatch, type SketchColor } from './SketchColorSwatch';

import './SketchColorPicker.css';

const colorOptions: SketchColor[] = [
  'blue',
  'brown',
  'gray',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
];

function SketchColorOptions({
  value,
  onChange,
}: {
  value: SketchColor;
  onChange: (color: SketchColor) => void;
}) {
  return (
    <div className="sketch-color-picker__options">
      {colorOptions.map(color => (
        <button
          key={color}
          type="button"
          className={color === value ? 'is-selected' : ''}
          aria-label={`Use ${color}`}
          aria-pressed={color === value}
          title={color}
          onClick={() => onChange(color)}
        >
          <SketchColorSwatch color={color} />
        </button>
      ))}
    </div>
  );
}

function SketchColorPicker({
  value,
  onChange,
}: {
  value: SketchColor;
  onChange: (color: SketchColor) => void;
}) {
  return (
    <div role="group" aria-label="pick a color">
      <span className="sketch-color-picker__title">pick a color</span>

      <SketchColorOptions value={value} onChange={onChange} />
    </div>
  );
}
export { SketchColorPicker };
