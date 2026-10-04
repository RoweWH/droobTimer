import { useTheme } from '../../../context/ThemeContext';

import { SketchColorPicker, type SketchColor } from '../SketchColorPicker';

import { SketchPanel } from '../SketchPanel';

export type DividerStyle = 'lines' | 'marker' | 'tangled' | 'wavy';

const dividerStyles: {
  style: DividerStyle;
  label: string;
}[] = [
  {
    style: 'lines',
    label: 'lines',
  },
  {
    style: 'marker',
    label: 'Marker',
  },
  {
    style: 'tangled',
    label: 'Tangled',
  },
  {
    style: 'wavy',
    label: 'Wavy',
  },
];

export function SketchDividerPicker({
  style,
  color,
  onStyleChange,
  onColorChange,
}: {
  style: DividerStyle;
  color: SketchColor;
  onStyleChange: (style: DividerStyle) => void;
  onColorChange: (color: SketchColor) => void;
}) {
  const { theme } = useTheme();

  return (
    <SketchPanel fitContent className="sketch-divider-picker">
      <div role="dialog" aria-label="Divider appearance">
        <p className="sketch-divider-picker__title">Pick a style</p>

        <div className="sketch-divider-picker__styles">
          {dividerStyles.map(option => {
            const isSelected = option.style === style;

            return (
              <button
                key={option.style}
                type="button"
                className={
                  isSelected
                    ? 'sketch-divider-picker__style is-selected'
                    : 'sketch-divider-picker__style'
                }
                aria-label={`Use ${option.label} divider`}
                aria-pressed={isSelected}
                onClick={() => onStyleChange(option.style)}
              >
                <img
                  className="sketch-divider-picker__style-image"
                  src={theme.assets.dividers[option.style][color]}
                  alt=""
                  draggable={false}
                />

                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        <SketchColorPicker value={color} onChange={onColorChange} />
      </div>
    </SketchPanel>
  );
}
