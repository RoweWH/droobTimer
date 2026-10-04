
import { useState } from 'react';

import { SketchPanel } from '../../../components/Sketch';
import { AverageModal } from '../modals/AverageModal';
import { SolveModal } from '../modals/SolveModal';
import { StatsModal } from '../stats/StatsModal';
import type { ActiveSession, AverageDisplay, Session, Solve } from '../types';
import {
  calculateAverage,
  getAverageDisplay,
  getAverageSize,
  getDroppedIndexes,
  getSolveValue,
} from '../utils/averages';
import { formatTime } from '../utils/formatTime';

import { SolveHistoryHeader } from './SolveHistoryHeader';
import { SolveRow } from './SolveRow';

import './SolveHistory.css';

const ONE_HOUR = 3_600_000;

type SolveHistoryProps = {
  activeSession: ActiveSession;
  sessions: Session[];
  onUpdateSession: (session: ActiveSession) => void;
  onChangeSession: (sessionId: number) => void;
  onCreateSession: () => void;
  onClearSession: () => void;
  onOpenSettings: () => void;
};

type SelectedAverage = {
  solveIndex: number;
  averageType: AverageDisplay;
};

function getSolveDisplay(solve: Solve, activeSession: ActiveSession): string {
  const value = getSolveValue(solve, activeSession);

  if (value === null) {
    return 'DNF';
  }

  if ('moves' in solve) {
    return String(value);
  }

 if ('solved' in solve) {
   const ONE_HOUR = 3_600_000;

   const baseDisplayTime =
     activeSession.mbldDisplayValue === 'wca' && solve.time > ONE_HOUR ? ONE_HOUR : solve.time;

   const displayTime = baseDisplayTime + solve.plusTwoCount * 2_000;

   const time = displayTime >= ONE_HOUR ? formatTime(displayTime, false) : formatTime(displayTime);

   return `${value}/${solve.attempted} ${time}`;
 }

  return formatTime(value);
}

function getScrambleDisplay(solve: Solve): string {
  if (Array.isArray(solve.puzzle.scramble)) {
    return solve.puzzle.scramble.join(' | ');
  }

  return solve.puzzle.scramble;
}

function getAverageValue(
  activeSession: ActiveSession,
  index: number,
  averageType: AverageDisplay
): number | null {
  const size = getAverageSize(averageType);
  const solves = activeSession.solves.slice(index, index + size);

  if (solves.length < size) {
    return null;
  }

  const values = solves.map(solve => getSolveValue(solve, activeSession));

  return calculateAverage(values, averageType);
}

function getBestValue(values: (number | null)[], higherIsBetter: boolean): number | null {
  const validValues = values.filter((value): value is number => value !== null);

  if (validValues.length === 0) {
    return null;
  }

  return higherIsBetter ? Math.max(...validValues) : Math.min(...validValues);
}

export function SolveHistory({
  activeSession,
  sessions,
  onUpdateSession,
  onChangeSession,
  onCreateSession,
  onClearSession,
  onOpenSettings,
}: SolveHistoryProps) {
  const [selectedSolveId, setSelectedSolveId] = useState<number | null>(null);

  const [selectedAverage, setSelectedAverage] = useState<SelectedAverage | null>(null);

  const [isStatsOpen, setIsStatsOpen] = useState(false);

  function updateSolve(updatedSolve: Solve) {
    onUpdateSession({
      ...activeSession,
      solves: activeSession.solves.map(solve =>
        solve.id === updatedSolve.id ? updatedSolve : solve
      ),
    });
  }

  function deleteSolve(solveId: number) {
    onUpdateSession({
      ...activeSession,
      solves: activeSession.solves.filter(solve => solve.id !== solveId),
    });

    setSelectedSolveId(null);
    setSelectedAverage(null);
  }

  const selectedSolveIndex =
    selectedSolveId === null
      ? -1
      : activeSession.solves.findIndex(solve => solve.id === selectedSolveId);

  const selectedSolve =
    selectedSolveIndex === -1 ? null : activeSession.solves[selectedSolveIndex];

  const averageSolves = selectedAverage
    ? activeSession.solves.slice(
        selectedAverage.solveIndex,
        selectedAverage.solveIndex + getAverageSize(selectedAverage.averageType)
      )
    : [];

  const droppedIndexes = selectedAverage
    ? getDroppedIndexes(averageSolves, activeSession, selectedAverage.averageType)
    : new Set<number>();

  const averageDisplay = selectedAverage
    ? getAverageDisplay(
        activeSession,
        selectedAverage.solveIndex,
        selectedAverage.averageType
      )
    : '';

  const solveValues = activeSession.solves.map(solve =>
    getSolveValue(solve, activeSession)
  );

  const average1Values = activeSession.solves.map((_, index) =>
    getAverageValue(activeSession, index, activeSession.firstAverage)
  );

  const average2Values = activeSession.solves.map((_, index) =>
    getAverageValue(activeSession, index, activeSession.secondAverage)
  );

  const higherIsBetter = activeSession.eventId === 'mbld';

  const bestSolve = getBestValue(solveValues, higherIsBetter);
  const bestAverage1 = getBestValue(average1Values, higherIsBetter);
  const bestAverage2 = getBestValue(average2Values, higherIsBetter);

  return (
    <>
      <div className="solve-history">
        <SketchPanel backdrop="">
          <SolveHistoryHeader
            activeSession={activeSession}
            sessions={sessions}
            onChangeSession={onChangeSession}
            onCreateSession={onCreateSession}
            onClearSession={onClearSession}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenSettings={onOpenSettings}
          />

          <div className="solve-history__column-header">
            <span />
            <span>solve</span>
            <span>{activeSession.firstAverage}</span>
            <span>{activeSession.secondAverage}</span>
          </div>

          <div className="solve-history__divider" />

          <div className="solve-history__list">
            {activeSession.solves.map((solve, index) => {
              const displaySolve = getSolveDisplay(solve, activeSession);

              const displayAverage1 = getAverageDisplay(
                activeSession,
                index,
                activeSession.firstAverage
              );

              const displayAverage2 = getAverageDisplay(
                activeSession,
                index,
                activeSession.secondAverage
              );

              return (
                <SolveRow
                  key={solve.id}
                  solve={solve}
                  number={activeSession.solves.length - index}
                  displaySolve={displaySolve}
                  displayAverage1={displayAverage1}
                  displayAverage2={displayAverage2}
                  isBestSolve={bestSolve !== null && solveValues[index] === bestSolve}
                  isBestAverage1={
                    bestAverage1 !== null && average1Values[index] === bestAverage1
                  }
                  isBestAverage2={
                    bestAverage2 !== null && average2Values[index] === bestAverage2
                  }
                  onSelectSolve={solve => setSelectedSolveId(solve.id)}
                  onSelectAverage1={() =>
                    setSelectedAverage({
                      solveIndex: index,
                      averageType: activeSession.firstAverage,
                    })
                  }
                  onSelectAverage2={() =>
                    setSelectedAverage({
                      solveIndex: index,
                      averageType: activeSession.secondAverage,
                    })
                  }
                />
              );
            })}
          </div>
        </SketchPanel>
      </div>

      {isStatsOpen && (
        <StatsModal
          activeSession={activeSession}
          onClose={() => setIsStatsOpen(false)}
        />
      )}

      {selectedAverage && (
        <AverageModal
          averageType={selectedAverage.averageType}
          displayAverage={averageDisplay}
          solves={averageSolves.map((solve, offset) => {
            const solveIndex = selectedAverage.solveIndex + offset;

            return {
              solve,
              number: activeSession.solves.length - solveIndex,
              display: getSolveDisplay(solve, activeSession),
              scramble: getScrambleDisplay(solve),
              isDropped: droppedIndexes.has(offset),
            };
          })}
          onSelectSolve={solve => setSelectedSolveId(solve.id)}
          onClose={() => setSelectedAverage(null)}
        />
      )}

      {selectedSolve && selectedSolveIndex !== -1 && (
        <SolveModal
          solve={selectedSolve}
          number={activeSession.solves.length - selectedSolveIndex}
          activeSession={activeSession}
          onUpdate={updateSolve}
          onDelete={deleteSolve}
          onClose={() => setSelectedSolveId(null)}
        />
      )}
    </>
  );
}