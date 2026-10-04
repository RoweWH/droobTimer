import {
  forwardRef,
  useMemo,
  type ForwardedRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

import { useTheme } from '../../../context/ThemeContext';

import './SketchInput.css';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  multiline?: false;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  multiline: true;
};

type SketchInputProps = InputProps | TextareaProps;

export const SketchInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, SketchInputProps>(
  function SketchInput(props, ref) {
    const { theme } = useTheme();

    const inputTheme = useMemo(() => theme.assets.getRandomButtonTheme(), [theme]);

    const className = ['sketch-input', props.className].filter(Boolean).join(' ');
    const disabled = props.disabled ?? false;

    return (
      <div
        className={className}
        data-disabled={disabled ? 'true' : undefined}
        data-multiline={props.multiline ? 'true' : undefined}
      >
        <span className="sketch-input__background" aria-hidden="true">
          <img
            className="sketch-input__piece sketch-input__piece--left"
            src={inputTheme.left}
            alt=""
            draggable={false}
          />

          <img
            className="sketch-input__piece sketch-input__piece--middle"
            src={inputTheme.middle}
            alt=""
            draggable={false}
          />

          <img
            className="sketch-input__piece sketch-input__piece--right"
            src={inputTheme.right}
            alt=""
            draggable={false}
          />
        </span>

        {props.multiline ? (
          <textarea
            {...props}
            ref={ref as ForwardedRef<HTMLTextAreaElement>}
            className="sketch-input__control"
          />
        ) : (
          <input
            {...props}
            ref={ref as ForwardedRef<HTMLInputElement>}
            className="sketch-input__control"
            type={props.type ?? 'text'}
          />
        )}
      </div>
    );
  }
);
