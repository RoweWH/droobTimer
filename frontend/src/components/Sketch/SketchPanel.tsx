import { useMemo, type ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

import './SketchPanel.css';

type SketchPanelProps = {
  children: ReactNode;
  className?: string;
  fitContent?: boolean;
  backdrop?: string;
};

export function SketchPanel({
  children,
  className = '',
  fitContent = false,
  backdrop,
}: SketchPanelProps) {
  const { theme } = useTheme();

  const panelTheme = useMemo(() => {
    return theme.assets.getRandomPanelTheme();
  }, [theme]);

  const panelClassName = useMemo(() => {
    return ['sketch-panel', fitContent && 'sketch-panel--fit-content', className]
      .filter(Boolean)
      .join(' ');
  }, [className, fitContent]);

  const backgroundImage = backdrop ?? theme.assets.backgrounds.default;

  return (
    <div className={panelClassName}>
      <div
        className="sketch-panel-background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden="true"
      />

      <div className="sketch-panel-slices" aria-hidden="true">
        {Object.entries(panelTheme).map(([position, image]) => (
          <img
            key={position}
            className={`sketch-panel-slice sketch-panel-slice--${position}`}
            src={image}
            alt=""
            draggable={false}
          />
        ))}
      </div>

      <div className="sketch-panel-content">{children}</div>
    </div>
  );
}
