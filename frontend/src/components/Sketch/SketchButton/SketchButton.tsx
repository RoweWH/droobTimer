import { useMemo, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { useTheme } from '../../../context/ThemeContext';

import './SketchButton.css';

type SketchButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function SketchButton({
  children,
  className = '',
  type = 'button',
  ...buttonProps
}: SketchButtonProps) {
  const { theme } = useTheme();

  const buttonTheme = useMemo(() => theme.assets.getRandomButtonTheme(), [theme]);

  const buttonClassName = ['sketch-button', className].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClassName}
      {...buttonProps}
    >
      <span className="sketch-button__background" aria-hidden="true">
        <img
          className="sketch-button__piece sketch-button__piece--left"
          src={buttonTheme.left}
          alt=""
          draggable={false}
        />

        <img
          className="sketch-button__piece sketch-button__piece--middle"
          src={buttonTheme.middle}
          alt=""
          draggable={false}
        />

        <img
          className="sketch-button__piece sketch-button__piece--right"
          src={buttonTheme.right}
          alt=""
          draggable={false}
        />
      </span>

      <span className="sketch-button__label">{children}</span>
    </button>
  );
}
