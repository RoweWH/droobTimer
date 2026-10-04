import { useEffect, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { SketchPanel } from './SketchPanel';

import './SketchModal.css';

type SketchModalProps = {
  children: ReactNode;
  onClose: () => void;
  className?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  ariaLabelledBy?: string;
  backdrop?: string;
};

export function SketchModal({
  children,
  onClose,
  className = '',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  ariaLabelledBy,
  backdrop,
}: SketchModalProps) {
  useEffect(() => {
    if (!closeOnEscape) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  }

  return createPortal(
    <div className="sketch-modal-backdrop" onClick={handleBackdropClick}>
      <div
        className={`sketch-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
      >
        <SketchPanel className="sketch-modal-surface" backdrop={backdrop}>
          <div className="sketch-modal-content">{children}</div>
        </SketchPanel>
      </div>
    </div>,
    document.body
  );
}
