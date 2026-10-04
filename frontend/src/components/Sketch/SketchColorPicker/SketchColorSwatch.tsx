import { useTheme } from '../../../context/ThemeContext';

export type SketchColor =
  'blue' | 'brown' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow';

export function SketchColorSwatch({ color }: { color: SketchColor }) {
  const { theme } = useTheme();

  return (
    <img
      className="sketch-color-swatch"
      src={theme.assets.colorPicker[color]}
      alt=""
      draggable={false}
    />
  );
}
