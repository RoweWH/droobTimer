import { useMemo, type ReactNode } from 'react';

import { useTheme } from '../../context/ThemeContext';

import './SketchCircle.css';

type SketchCircleProps = {
  children: ReactNode;
};

export function SketchCircle({ children }: SketchCircleProps) {
  const { theme } = useTheme();

  const circle = useMemo(() => theme.assets.getRandomBestCircle(), [theme]);

  return (
    <span className="sketch-circle">
      <img className="sketch-circle__image" src={circle} alt="" draggable={false} />

      <span className="sketch-circle__content">{children}</span>
    </span>
  );
}
