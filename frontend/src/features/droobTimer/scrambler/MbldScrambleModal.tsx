import { SketchModal } from '../../../components/Sketch';
import { useTheme } from '../../../context/ThemeContext';

import './MbldScrambleModal.css';

type MbldScrambleModalProps = {
  scrambles: string[];
  onClose: () => void;
};

export function MbldScrambleModal({ scrambles, onClose }: MbldScrambleModalProps) {
  const { theme } = useTheme();

  return (
    <SketchModal
      className="mbld-scrambles-modal"
      backdrop={theme.modalBackdrops.mbldScramble}
      onClose={onClose}
    >
      <header className="mbld-scrambles-modal__header">
        <h2>Scrambles ({scrambles.length})</h2>

        <button type="button" onClick={onClose} aria-label="Close MBLD scrambles modal">
          ×
        </button>
      </header>

      <div className="mbld-scrambles-modal__content">
        {scrambles.map((scramble, index) => (
          <div key={index} className="mbld-scrambles-modal__scramble">
            <span>{index + 1}.</span>
            <span>{scramble}</span>
          </div>
        ))}
      </div>
    </SketchModal>
  );
}
