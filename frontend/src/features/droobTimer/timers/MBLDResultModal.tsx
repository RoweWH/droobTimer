import { useState } from 'react';

import { SketchButton, SketchInput, SketchModal } from '../../../components/Sketch';
import { useTheme } from '../../../context/ThemeContext';
import type { MbldDisplayValue } from '../types';
import { NotesModal } from './../modals/NotesModal';

import './MBLDResultModal.css';

const ONE_HOUR = 3_600_000;

export type MBLDResult = {
  solved: number;
  solvedAtHour: number;
  plusTwoCount: number;
  isDNF: boolean;
  note: string;
};

type MBLDResultModalProps = {
  time: number;
  attempted: number;
  displayValue: MbldDisplayValue;
  onSubmit: (result: MBLDResult) => void;
  onClose: () => void;
};

function formatMbldTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseInput(value: string, max: number) {
  if (value.trim() === '') {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return clamp(parsed, 0, max);
}

export function MBLDResultModal({
  time,
  attempted,
  displayValue,
  onSubmit,
  onClose,
}: MBLDResultModalProps) {
  const { theme } = useTheme();

  const [solved, setSolved] = useState(attempted);
  const [solvedAtHour, setSolvedAtHour] = useState(attempted);
  const [plusTwoCount, setPlusTwoCount] = useState(0);
  const [isDNF, setIsDNF] = useState(false);
  const [note, setNote] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);

  const isOverHour = time > ONE_HOUR;
  const useWcaHourCutoff = displayValue === 'wca' && isOverHour;

  const displaySolved = useWcaHourCutoff ? solvedAtHour : solved;
  const displayTime = useWcaHourCutoff ? ONE_HOUR : time;

  function handleSolvedChange(value: string) {
    const nextSolved = parseInput(value, attempted);

    setSolved(nextSolved);

    if (!isOverHour) {
      setSolvedAtHour(nextSolved);
      return;
    }

    setSolvedAtHour(current => Math.min(current, nextSolved));
  }

  function handleSolvedAtHourChange(value: string) {
    setSolvedAtHour(parseInput(value, solved));
  }

  function handlePlusTwoChange(value: string) {
    setPlusTwoCount(parseInput(value, attempted));
  }

  function handleSubmit() {
    onSubmit({
      solved,
      solvedAtHour: isOverHour ? solvedAtHour : solved,
      plusTwoCount,
      isDNF,
      note,
    });
  }

  return (
    <>
      <SketchModal
        className="mbld-result-modal"
        backdrop={theme.modalBackdrops.solve}
        onClose={onClose}
        closeOnEscape={!notesOpen}
        ariaLabelledBy="mbld-result-modal-title"
      >
        <div className="mbld-result-modal__inner">
          <h2 id="mbld-result-modal-title" className="mbld-result-modal__title">
            Enter result
          </h2>

          <div className="mbld-result-modal__body">
            <div className="mbld-result-modal__entries">
              <div className="mbld-result-modal__entry">
                <label htmlFor="mbld-total-solved" className="mbld-result-modal__label">
                  total solved
                </label>

                <div className="mbld-result-modal__input-row">
                  <SketchInput
                    id="mbld-total-solved"
                    className="mbld-result-modal__number-input"
                    type="number"
                    min={0}
                    max={attempted}
                    value={solved}
                    onChange={event => handleSolvedChange(event.target.value)}
                  />

                  <span className="mbld-result-modal__attempted">/{attempted}</span>
                </div>
              </div>

              {isOverHour && (
                <div className="mbld-result-modal__entry">
                  <label htmlFor="mbld-solved-at-hour" className="mbld-result-modal__label">
                    solved at one hour
                  </label>

                  <div className="mbld-result-modal__input-row">
                    <SketchInput
                      id="mbld-solved-at-hour"
                      className="mbld-result-modal__number-input"
                      type="number"
                      min={0}
                      max={solved}
                      value={solvedAtHour}
                      onChange={event => handleSolvedAtHourChange(event.target.value)}
                    />

                    <span className="mbld-result-modal__attempted">/{attempted}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mbld-result-modal__preview">
              <div className="mbld-result-modal__score">
                {isDNF ? 'DNF' : `${displaySolved}/${attempted}`}
              </div>

              <div className="mbld-result-modal__time">{formatMbldTime(displayTime)}</div>

              <div className="mbld-result-modal__display-type">
                {displayValue === 'wca' ? 'WCA' : 'old style'}
              </div>
            </div>
          </div>

          <div className="mbld-result-modal__plus-two">
            <label htmlFor="mbld-plus-twos">+2s</label>

            <SketchInput
              id="mbld-plus-twos"
              className="mbld-result-modal__plus-two-input"
              type="number"
              min={0}
              max={attempted}
              value={plusTwoCount}
              onChange={event => handlePlusTwoChange(event.target.value)}
            />
          </div>

          <div className="mbld-result-modal__actions">
            <SketchButton
              className={
                isDNF ? 'mbld-result-modal__button is-active' : 'mbld-result-modal__button'
              }
              onClick={() => setIsDNF(current => !current)}
            >
              DNF
            </SketchButton>

            <SketchButton className="mbld-result-modal__button" onClick={() => setNotesOpen(true)}>
              notes
            </SketchButton>

            <SketchButton className="mbld-result-modal__button" onClick={handleSubmit}>
              submit
            </SketchButton>
          </div>
        </div>
      </SketchModal>

      {notesOpen && (
        <NotesModal note={note} onChange={setNote} onClose={() => setNotesOpen(false)} />
      )}
    </>
  );
}
