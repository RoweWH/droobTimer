import './DrawScramble.css';
import { getCubeState } from '../../../tdrooble';
import type { GeneratedPuzzle } from '../../../tdrooble';
import { CubeNet } from './CubeNet';
import { useState } from 'react';
import { SketchButton } from '../../../components/Sketch';

type DrawScramblePanelProps = {
  puzzle: GeneratedPuzzle;
  mode: DrawScrambleMode;
  onModeChange: (mode: DrawScrambleMode) => void;
};

export type DrawScrambleMode = 'background' | 'standard';

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
  if (Array.isArray(puzzle.scramble)) {
    return null;
  }

  const size = CUBE_SIZES[puzzle.puzzleId as keyof typeof CUBE_SIZES];

  if (size === undefined) {
    return null;
  }

  const state = getCubeState(puzzle.scramble, size);

  return (
    <div className={`draw-scramble ${mode === 'background' ? 'draw-scramble--background' : ''}`}>
      <div className="draw-scramble__drawing">
        {showScramble && <CubeNet size={size} state={state} />}
      </div>

      <div className="draw-scramble__controls">
        {showScramble &&
        <SketchButton onClick={() => onModeChange(mode === 'background' ? 'standard' : 'background')}>
          {mode === 'background' ? 'Standard' : 'Background'}
        </SketchButton>
        }
        <SketchButton onClick={() => setShowScramble(current => !current)}>
          {showScramble ? 'Hide Scramble' : 'Show Scramble'}
        </SketchButton>
      </div>
    </div>
  );
}
