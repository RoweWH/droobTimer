import { useEffect, useRef, useState } from 'react';

import type { SketchColor } from '../SketchColorPicker/SketchColorSwatch';

import { SketchDividerPicker, type DividerStyle } from './SketchDividerPicker';

import { useTheme } from '../../../context/ThemeContext';

import './SketchDivider.css';

export function SketchDivider({
  className = '',
  interactive = true,
}: {
  className?: string;
  interactive?: boolean;
}) {
  const { theme } = useTheme();

  const [style, setStyle] = useState<DividerStyle>('marker');
  const [color, setColor] = useState<SketchColor>('blue');
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const dividerRef = useRef<HTMLDivElement>(null);

  const dividerImage = theme.assets.dividers[style][color];

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    function closeWhenOutside(event: PointerEvent) {
      if (event.target instanceof Node && !dividerRef.current?.contains(event.target)) {
        setIsPickerOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsPickerOpen(false);
      }
    }

    document.addEventListener('pointerdown', closeWhenOutside);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeWhenOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isPickerOpen]);

  return (
    <div ref={dividerRef} className={`sketch-divider ${className}`.trim()}>
      {interactive ? (
        <button
          type="button"
          className="sketch-divider__button"
          aria-label="Choose divider appearance"
          aria-haspopup="dialog"
          aria-expanded={isPickerOpen}
          onClick={() => setIsPickerOpen(!isPickerOpen)}
        >
          <img className="sketch-divider__image" src={dividerImage} alt="" draggable={false} />
        </button>
      ) : (
        <img className="sketch-divider__image" src={dividerImage} alt="" draggable={false} />
      )}

      {interactive && isPickerOpen && (
        <SketchDividerPicker
          style={style}
          color={color}
          onStyleChange={setStyle}
          onColorChange={setColor}
        />
      )}
    </div>
  );
}
