import { useState } from 'react';

import { SketchButton, SketchInput, SketchSelect } from '../../../components/Sketch';
import { type GeneratedPuzzle, type WcaEventId } from '../../../tdrooble';

import { formatScramble } from './formatScramble';
import { WCA_EVENTS } from '../types';

import './Scrambler.css';
import { MbldScrambleModal } from './MbldScrambleModal';

type ScramblerProps = {
  eventId: WcaEventId;
  puzzle: GeneratedPuzzle | null;
  previousPuzzle: GeneratedPuzzle | null;
  onEventChange: (eventId: WcaEventId) => void;
  isGenerating: boolean;
  mbldCubeCount: string;
  onMbldCubeCountChange: (count: string) => void;
  onNextScramble: () => Promise<void>;
  onPreviousPuzzle: () => void;
};

export function Scrambler({
  eventId,
  puzzle,
  previousPuzzle,
  onEventChange,
  isGenerating,
  mbldCubeCount,
  onMbldCubeCountChange,
  onNextScramble,
  onPreviousPuzzle,
}: ScramblerProps) {
  const [mbldModalOpen, setMbldModalOpen] = useState(false);

  function selectEvent(value: string) {
    onEventChange(value as WcaEventId);
  }

  const scrambleText = puzzle && !Array.isArray(puzzle.scramble) ? puzzle.scramble : '';
  const formattedScramble = formatScramble(puzzle?.eventId ?? eventId, scrambleText);

  function showPreviousPuzzle() {
    if (!previousPuzzle) {
      return;
    }

    onPreviousPuzzle();

    if (previousPuzzle.eventId === 'mbld') {
      onMbldCubeCountChange(
        Array.isArray(previousPuzzle.scramble) ? previousPuzzle.scramble.length.toString() : '5'
      );

      setMbldModalOpen(true);
    }
  }

  async function autoOpenMbldScrambles() {
    await onNextScramble();
    setMbldModalOpen(true);
  }

  return (
    <>
      <div className="scrambler">
        <div className="scramble-display">
          {puzzle?.eventId === 'mbld' ? (
            <SketchButton className="mbld-view-scrambles" onClick={() => setMbldModalOpen(true)}>
              View Scrambles
            </SketchButton>
          ) : (
            <div
              className={
                formattedScramble.type === 'lines' ? 'scramble scramble--megaminx' : 'scramble'
              }
              style={{
                fontSize: `${formattedScramble.fontSize}rem`,
              }}
            >
              {isGenerating
                ? 'generating scramble...'
                : Array.isArray(puzzle?.scramble)
                  ? puzzle.scramble.join('\n')
                  : formattedScramble.type === 'lines'
                    ? formattedScramble.value.map((line, index) => (
                        <span key={`${line}-${index}`}>
                          {line}
                          {index < formattedScramble.value.length - 1 && <br />}
                        </span>
                      ))
                    : formattedScramble.type === 'squareOne'
                      ? formattedScramble.value.map((token, index) => (
                          <span key={`${token.type}-${index}`}>
                            {token.value}
                            {token.type === 'move' && ' '}
                          </span>
                        ))
                      : formattedScramble.value}
            </div>
          )}
        </div>

        <div className="scrambler-controls">
          <div className="scrambler-controls__event">
            <SketchSelect
              value={eventId}
              options={WCA_EVENTS}
              onChange={selectEvent}
              disabled={isGenerating}
            />

            {eventId === 'mbld' && (
              <SketchInput
                type="number"
                inputMode="numeric"
                value={mbldCubeCount}
                min={2}
                max={100}
                step={1}
                disabled={isGenerating}
                onChange={event => {
                  const value = Math.min(Number(event.target.value), 100);
                  onMbldCubeCountChange(String(value));
                }}
                onBlur={autoOpenMbldScrambles}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    void autoOpenMbldScrambles();
                  }
                }}
              />
            )}
          </div>

          <SketchButton className="scrambler-controls__hate-scramble">
            i hate this scramble
          </SketchButton>

          <div className="scrambler-controls__nav">
            <SketchButton onClick={showPreviousPuzzle} disabled={!previousPuzzle || isGenerating}>
              prev
            </SketchButton>

            <SketchButton
              onClick={puzzle?.eventId === 'mbld' ? autoOpenMbldScrambles : onNextScramble}
              disabled={isGenerating}
            >
              next
            </SketchButton>
          </div>
        </div>
      </div>

      {mbldModalOpen && (
        <MbldScrambleModal
          scrambles={Array.isArray(puzzle?.scramble) ? puzzle.scramble : []}
          onClose={() => setMbldModalOpen(false)}
        />
      )}
    </>
  );
}
