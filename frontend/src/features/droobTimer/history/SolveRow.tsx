import { SketchCircle } from '../../../components/Sketch';

import type { Solve } from '../types';

import './SolveRow.css';

type SolveRowProps = {
  solve: Solve;
  number: number;
  displaySolve: string;
  displayAverage1: string;
  displayAverage2: string;
  isBestSolve: boolean;
  isBestAverage1: boolean;
  isBestAverage2: boolean;
  onSelectSolve: (solve: Solve) => void;
  onSelectAverage1: () => void;
  onSelectAverage2: () => void;
};

export function SolveRow({
  solve,
  number,
  displaySolve,
  displayAverage1,
  displayAverage2,
  isBestSolve,
  isBestAverage1,
  isBestAverage2,
  onSelectSolve,
  onSelectAverage1,
  onSelectAverage2,
}: SolveRowProps) {
  const solveDisplay = (
    <>
      {solve.note?.trim() ? '*' : ''}
      {'plusTwoCount' in solve && solve.plusTwoCount > 0 ? `${displaySolve}+` : displaySolve}
    </>
  );

  return (
    <div className="solve-row">
      <span className="solve-row__number">{number}.</span>

      <button className="solve-row__solve" type="button" onClick={() => onSelectSolve(solve)}>
        {isBestSolve ? <SketchCircle>{solveDisplay}</SketchCircle> : solveDisplay}
      </button>

      <button
        className="solve-row__average"
        type="button"
        disabled={displayAverage1 === '-'}
        onClick={onSelectAverage1}
      >
        {isBestAverage1 ? <SketchCircle>{displayAverage1}</SketchCircle> : displayAverage1}
      </button>

      <button
        className="solve-row__average"
        type="button"
        disabled={displayAverage2 === '-'}
        onClick={onSelectAverage2}
      >
        {isBestAverage2 ? <SketchCircle>{displayAverage2}</SketchCircle> : displayAverage2}
      </button>
    </div>
  );
}
