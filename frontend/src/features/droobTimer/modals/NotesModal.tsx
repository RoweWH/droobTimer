import { SketchButton, SketchModal } from '../../../components/Sketch';
import { useTheme } from '../../../context/ThemeContext';

import './NotesModal.css';

type NotesModalProps = {
  note: string;
  onChange: (note: string) => void;
  onClose: () => void;
};

export function NotesModal({ note, onChange, onClose }: NotesModalProps) {
  const { theme } = useTheme();

  return (
    <SketchModal
      className="notes-modal"
      backdrop={theme.modalBackdrops.notes}
      onClose={onClose}
      ariaLabelledBy="notes-modal-title"
    >
      <div className="notes-modal__inner">
        <header className="notes-modal__header">
          <h2 id="notes-modal-title">notes</h2>

          <button
            className="notes-modal__close-button"
            type="button"
            onClick={onClose}
            aria-label="Close notes"
          >
            ×
          </button>
        </header>

        <textarea
          className="notes-modal__input"
          value={note}
          autoFocus
          onChange={event => onChange(event.target.value)}
        />

        <SketchButton className="notes-modal__save" onClick={onClose}>
          save
        </SketchButton>
      </div>
    </SketchModal>
  );
}
