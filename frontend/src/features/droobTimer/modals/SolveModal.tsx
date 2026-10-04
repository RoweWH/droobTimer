import { useState } from 'react';

import { SketchButton, SketchModal } from '../../../components/Sketch';
import { useTheme } from '../../../context/ThemeContext';
import type { ActiveSession, Solve } from '../types';
import { formatTime } from '../utils/formatTime';

import { NotesModal } from './NotesModal';
import { PhaseWheel } from './PhaseWheel';

import './SolveModal.css';

type SolveModalProps = {
  solve: Solve;
  number: number;
  activeSession: ActiveSession;
  onUpdate: (solve: Solve) => void;
  onDelete: (solveId: number) => void;
  onClose: () => void;
};

function getScramble(solve: Solve): string {
  if (Array.isArray(solve.puzzle)) {
    return '';
  }

  if (Array.isArray(solve.puzzle.scramble)) {
    return solve.puzzle.scramble.join(' | ');
  }

  return solve.puzzle.scramble;
}

function getSolveDisplay(solve: Solve, activeSession: ActiveSession): string {
  if (solve.isDNF) {
    return 'DNF';
  }

  if ('moves' in solve) {
    return String(solve.moves);
  }

  if ('solved' in solve) {
    const useSolvedAtHour = activeSession.mbldDisplayValue === 'wca' && solve.time >= 3_600_000;

    const solved = useSolvedAtHour ? solve.solvedAtHour : solve.solved;

    const time = solve.time >= 3_600_000 ? formatTime(solve.time, false) : formatTime(solve.time);

    return `${solved}/${solve.attempted} ${time}`;
  }

  const display = formatTime(solve.time + solve.plusTwoCount * 2000);

  return solve.plusTwoCount > 0 ? `${display}+` : display;
}

export function SolveModal({
  solve,
  number,
  activeSession,
  onUpdate,
  onDelete,
  onClose,
}: SolveModalProps) {
  const { theme } = useTheme();

  const [notesOpen, setNotesOpen] = useState(false);

  const isTimedSolve = 'time' in solve && !('solved' in solve);
  const hasPhases = 'phases' in solve && solve.phases.length > 0;

  function addPlusTwo() {
    if (!isTimedSolve || !('plusTwoCount' in solve) || solve.plusTwoCount >= 8) {
      return;
    }

    onUpdate({
      ...solve,
      plusTwoCount: solve.plusTwoCount + 1,
    });
  }

  function clearPlusTwo() {
    if (!isTimedSolve || !('plusTwoCount' in solve)) {
      return;
    }

    onUpdate({
      ...solve,
      plusTwoCount: 0,
    });
  }

  function toggleDNF() {
    const isDNF = !solve.isDNF;

    onUpdate({
      ...solve,
      isDNF,
      ...(isTimedSolve && isDNF ? { plusTwoCount: 0 } : {}),
    });
  }

  function handleDelete() {
    onDelete(solve.id);
    onClose();
  }

  return (
    <>
      <SketchModal
        className="solve-modal"
        backdrop={theme.modalBackdrops.solve}
        onClose={onClose}
        closeOnEscape={!notesOpen}
        ariaLabelledBy="solve-modal-title"
      >
        <div className="solve-modal__inner">
          <header className="solve-modal__header">
            <h2 id="solve-modal-title" className="solve-modal__scramble">
              <span>{number}. </span>
              <span>{getScramble(solve)}</span>
            </h2>

            <button
              className="solve-modal__close-button"
              type="button"
              onClick={onClose}
              aria-label="Close solve"
            >
              ×
            </button>
          </header>

          <div className="solve-modal__puzzle-space" />

          <div className="solve-modal__result-area">
            <div className="solve-modal__result">{getSolveDisplay(solve, activeSession)}</div>

            {hasPhases && <PhaseWheel phases={solve.phases} />}
          </div>

          <div className="solve-modal__controls">
            {isTimedSolve && (
              <div className="solve-modal__penalty">
                <SketchButton
                  className="solve-modal__button"
                  onClick={addPlusTwo}
                  disabled={solve.plusTwoCount >= 8}
                >
                  +2
                  {solve.plusTwoCount > 0 && (
                    <span className="solve-modal__penalty-count"> ({solve.plusTwoCount})</span>
                  )}
                </SketchButton>

                {solve.plusTwoCount > 0 && (
                  <SketchButton className="solve-modal__penalty-clear" onClick={clearPlusTwo}>
                    clear
                  </SketchButton>
                )}
              </div>
            )}

            <SketchButton
              className={solve.isDNF ? 'solve-modal__button is-active' : 'solve-modal__button'}
              onClick={toggleDNF}
            >
              DNF
            </SketchButton>

            <SketchButton className="solve-modal__button" onClick={() => setNotesOpen(true)}>
              notes
            </SketchButton>

            <SketchButton
              className="solve-modal__button solve-modal__delete"
              onClick={handleDelete}
            >
              delete
            </SketchButton>
          </div>

          <SketchButton className="solve-modal__save" onClick={onClose}>
            save
          </SketchButton>
        </div>
      </SketchModal>

      {notesOpen && (
        <NotesModal
          note={solve.note ?? ''}
          onChange={note =>
            onUpdate({
              ...solve,
              note,
            })
          }
          onClose={() => setNotesOpen(false)}
        />
      )}
    </>
  );
}
