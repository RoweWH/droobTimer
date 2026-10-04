import { useTheme } from '../../../context/ThemeContext';

import './SketchCubeBlame.css';

type SketchCubeBlameProps = {
  value: number;
  onChange: (value: number) => void;
};

export function SketchCubeBlame({ value, onChange }: SketchCubeBlameProps) {
  const { theme } = useTheme();

  const percentage = Math.min(100, Math.max(0, value));

  // The visible track runs from x=12 to x=288 in a 300-wide SVG.
  const trackStart = 4;
  const trackLength = 92;
  const thumbPosition = trackStart + (percentage / 100) * trackLength;

  const { track, thumb } = theme.assets.sliders.cubeBlame;

  return (
    <div className="sketch-cube-blame">
      <img className="sketch-cube-blame__track" src={track} alt="" draggable={false} />

      <img
        className="sketch-cube-blame__thumb"
        src={thumb}
        alt=""
        draggable={false}
        style={{ left: `${thumbPosition}%` }}
      />

      <input
        type="range"
        min={0}
        max={100}
        value={percentage}
        aria-label="Cube blame"
        onChange={event => onChange(Number(event.target.value))}
      />
    </div>
  );
}
