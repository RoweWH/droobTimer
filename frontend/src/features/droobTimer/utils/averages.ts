import type { ActiveSession, AverageDisplay, Solve } from '../types';

import { formatTime } from './formatTime';

export function calculateAverage(
  values: (number | null)[],
  averageType: AverageDisplay
): number | null {
  if (values.length === 0) {
    return null;
  }

  if (averageType === 'mo3') {
    if (values.length !== 3) {
      return null;
    }

    if (values.some(value => value === null || value < 0)) {
      return null;
    }

    const total = values.reduce<number>((sum, value) => sum + (value ?? 0), 0);

    return total / values.length;
  }

  const dropCount = Math.ceil(values.length * 0.05);

  const sorted = [...values].sort((a, b) => {
    const aValue = a === null || a < 0 ? Infinity : a;
    const bValue = b === null || b < 0 ? Infinity : b;

    return aValue - bValue;
  });

  const remaining = sorted.slice(dropCount, sorted.length - dropCount);

  if (remaining.some(value => value === null || value < 0)) {
    return null;
  }

  const numbers = remaining as number[];

  if (numbers.length === 0) {
    return null;
  }

  const total = numbers.reduce((sum, value) => sum + value, 0);

  return total / numbers.length;
}

export function getSolveValue(solve: Solve, activeSession: ActiveSession): number | null {
  if (solve.isDNF) {
    return null;
  }

  if ('moves' in solve) {
    return solve.moves;
  }

  if ('solved' in solve) {
    const useSolvedAtHour = activeSession.mbldDisplayValue === 'wca' && solve.time >= 3_600_000;

    const solved = useSolvedAtHour ? solve.solvedAtHour : solve.solved;

    const points = solved - (solve.attempted - solved);

    return points < 0 ? null : solved;
  }

  return solve.time + solve.plusTwoCount * 2000;
}

export function getAverageSize(averageType: AverageDisplay): number {
  return Number(averageType.slice(2));
}

export function getAverageDisplay(
  activeSession: ActiveSession,
  index: number,
  averageType: AverageDisplay
): string {
  const averageSize = getAverageSize(averageType);

  const solves = activeSession.solves.slice(index, index + averageSize);

  if (solves.length < averageSize) {
    return '-';
  }

  const values = solves.map(solve => getSolveValue(solve, activeSession));

  const average = calculateAverage(values, averageType);

  if (average === null) {
    return 'DNF';
  }

  if ('moves' in solves[0] || 'solved' in solves[0]) {
    return average.toFixed(2);
  }

  return formatTime(average);
}

export function getDroppedIndexes(
  solves: Solve[],
  activeSession: ActiveSession,
  averageType: AverageDisplay
): Set<number> {
  if (averageType === 'mo3') {
    return new Set();
  }

  const dropCount = Math.ceil(solves.length * 0.05);

  const sorted = solves
    .map((solve, index) => ({
      index,
      value: getSolveValue(solve, activeSession),
    }))
    .sort((a, b) => {
      if (a.value === null && b.value === null) {
        return 0;
      }

      if (a.value === null) {
        return 1;
      }

      if (b.value === null) {
        return -1;
      }

      return a.value - b.value;
    });

  const dropped = new Set<number>();

  for (let i = 0; i < dropCount; i++) {
    dropped.add(sorted[i].index);
    dropped.add(sorted[sorted.length - 1 - i].index);
  }

  return dropped;
}
