import { useState } from 'react';
import { SketchButton } from '../../../components/Sketch';
import type { GeneratedPuzzle } from '../../../tdrooble';
import { CubeNet } from './Cube';
import { ClockNet } from './Clock/ClockNet';
import { PyraminxNet } from './Pyraminx';
import { SkewbNet } from './Skewb';
import { Sq1Net } from './Sq1/Sq1Net';
import type { PyraminxState } from './Pyraminx/types';
import type { SkewbState } from './Skewb/types';
import './DrawScramble.css';

export type DrawScrambleMode = 'background' | 'standard';

type DrawScramblePanelProps = {
  puzzle: GeneratedPuzzle;
  mode: DrawScrambleMode;
  onModeChange: (mode: DrawScrambleMode) => void;
};

const CUBE_SIZES = {
  '2x2x2': 2,
  '3x3x3': 3,
  '4x4x4': 4,
  '5x5x5': 5,
  '6x6x6': 6,
  '7x7x7': 7,
} as const;

export function DrawScramblePanel({ puzzle, mode, onModeChange }: DrawScramblePanelProps) {
  const [showScramble, setShowScramble] = useState(true);

  if (Array.isArray(puzzle.scramble) || Array.isArray(puzzle.state)) {
    return null;
  }

  const size = CUBE_SIZES[puzzle.puzzleId as keyof typeof CUBE_SIZES];

  const drawing =
    size !== undefined ? (
      <CubeNet size={size} state={puzzle.state} />
    ) : puzzle.puzzleId === 'clock' ? (
      <ClockNet state={puzzle.state as Record<string, { orientation: number[] }>} />
    ) : puzzle.puzzleId === 'pyraminx' ? (
      <PyraminxNet state={puzzle.state as PyraminxState} />
    ) : puzzle.puzzleId === 'skewb' ? (
      <SkewbNet state={puzzle.state as SkewbState} />
    ) : puzzle.puzzleId === 'square1' ? (
      <Sq1Net scramble={puzzle.scramble} />
    ) : null;

  if (!drawing) return null;

  return (
    <div className={`draw-scramble ${mode === 'background' ? 'draw-scramble--background' : ''}`}>
      <div className="draw-scramble__drawing">{showScramble && drawing}</div>

      <div className="draw-scramble__controls">
        {showScramble && (
          <SketchButton
            onClick={() => onModeChange(mode === 'background' ? 'standard' : 'background')}
          >
            {mode === 'background' ? 'Standard' : 'Background'}
          </SketchButton>
        )}

        <SketchButton onClick={() => setShowScramble(current => !current)}>
          {showScramble ? 'Hide Scramble' : 'Show Scramble'}
        </SketchButton>
      </div>
    </div>
  );
}
