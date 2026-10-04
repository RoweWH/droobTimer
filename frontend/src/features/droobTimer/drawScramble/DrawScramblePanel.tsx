import type { GeneratedPuzzle } from '../../../tdrooble';
import { CubeNet } from './CubeNet';

type DrawScramblePanelProps = {
  puzzle: GeneratedPuzzle;
};

export function DrawScramblePanel({ puzzle }: DrawScramblePanelProps) {
  if (Array.isArray(puzzle.state)) {
    return null;
  }

  switch (puzzle.puzzleId) {
    case '2x2x2':
      return <CubeNet size={2} state={puzzle.state} />;
    case '3x3x3':
      return <CubeNet size={3} state={puzzle.state} />;
    case '4x4x4':
      return <CubeNet size={4} state={puzzle.state} />;
    case '5x5x5':
      return <CubeNet size={5} state={puzzle.state} />;
    case '6x6x6':
      return <CubeNet size={6} state={puzzle.state} />;
    case '7x7x7':
      return <CubeNet size={7} state={puzzle.state} />;
    default:
      return null;
  }
}
