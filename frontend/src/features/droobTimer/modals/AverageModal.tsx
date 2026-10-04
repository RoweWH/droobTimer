import { SketchModal } from '../../../components/Sketch';
import { useTheme } from '../../../context/ThemeContext';
import type { AverageDisplay, Solve } from '../types';

import './AverageModal.css';

export type AverageModalSolve = {
  solve: Solve;
  number: number;
  display: string;
  scramble: string;
  isDropped: boolean;
};

type AverageModalProps = {
  averageType: AverageDisplay;
  displayAverage: string;
  solves: AverageModalSolve[];
  onSelectSolve: (solve: Solve) => void;
  onClose: () => void;
};

export function AverageModal({
  averageType,
  displayAverage,
  solves,
  onSelectSolve,
  onClose,
}: AverageModalProps) {
  const { theme } = useTheme();

  return (
    <SketchModal
      className="average-modal"
      backdrop={theme.modalBackdrops.average}
      onClose={onClose}
      ariaLabelledBy="average-modal-title"
    >
      <div className="average-modal__inner">
        <header className="average-modal__header">
          <h2 id="average-modal-title" className="average-modal__title">
            {averageType}
          </h2>

          <button
            className="average-modal__close-button"
            type="button"
            onClick={onClose}
            aria-label="Close average"
          >
            ×
          </button>
        </header>

        <div className="average-modal__result">{displayAverage}</div>

        <div className="average-modal__divider" />

        <div className="average-modal__solves">
          {solves.map(({ solve, number, display, scramble, isDropped }) => (
            <button
              key={solve.id}
              className="average-modal__solve"
              type="button"
              onClick={() => onSelectSolve(solve)}
            >
              <span className="average-modal__solve-number">{number}.</span>

              <span className="average-modal__solve-time">
                {isDropped ? `(${display})` : display}
              </span>

              <span className="average-modal__solve-scramble">{scramble}</span>
            </button>
          ))}
        </div>

        <div className="average-modal__divider" />
      </div>
    </SketchModal>
  );
}
