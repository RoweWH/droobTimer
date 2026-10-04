import { useMemo } from 'react';

import { useTheme } from '../../context/ThemeContext';

import './SketchSelect.css';

type SketchSelectOption<T extends string> = {
  value: T;
  label: string;
};

type SketchSelectProps<T extends string> = {
  value: T;
  options: SketchSelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
};

export function SketchSelect<T extends string>({
  value,
  options,
  onChange,
  className = '',
  disabled = false,
}: SketchSelectProps<T>) {
  const { theme } = useTheme();

  const buttonTheme = useMemo(() => {
    return theme.assets.getRandomButtonTheme();
  }, [theme]);

  return (
    <div className={`sketch-select ${className}`.trim()}>
      <img className="sketch-select-left" src={buttonTheme.left} alt="" draggable={false} />

      <img className="sketch-select-middle" src={buttonTheme.middle} alt="" draggable={false} />

      <img className="sketch-select-right" src={buttonTheme.right} alt="" draggable={false} />

      <select
        className="sketch-select-control"
        value={value}
        onChange={event => onChange(event.target.value as T)}
        disabled={disabled}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
