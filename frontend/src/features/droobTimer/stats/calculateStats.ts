import type { ActiveSession, Solve } from '../types';
import { getSolveValue } from '../utils/averages';

export type StatsAverage = {
  kind: 'mo' | 'ao';
  size: number;
};

export type AverageStat = {
  average: StatsAverage;
  current: number | null;
  best: number | null;
};

export type SessionStats = {
  solveCount: number;
  bestSingle: Solve | null;
  mean: number | null;
  standardDeviation: number | null;
  averages: AverageStat[];
};

export const STATS_AVERAGES: StatsAverage[] = [
  { kind: 'mo', size: 3 },
  { kind: 'ao', size: 5 },
  { kind: 'ao', size: 12 },
  { kind: 'ao', size: 25 },
  { kind: 'ao', size: 50 },
  { kind: 'ao', size: 100 },
  { kind: 'ao', size: 1000 },
];

function calculateAverage(values: (number | null)[], average: StatsAverage): number | null {
  if (values.length !== average.size) {
    return null;
  }

  if (average.kind === 'mo') {
    if (values.some(value => value === null)) {
      return null;
    }

    const numbers = values as number[];

    return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  }

  const dropCount = Math.ceil(values.length * 0.05);

  const sorted = [...values].sort((a, b) => {
    if (a === null) {
      return 1;
    }

    if (b === null) {
      return -1;
    }

    return a - b;
  });

  const remaining = sorted.slice(dropCount, sorted.length - dropCount);

  if (remaining.length === 0 || remaining.some(value => value === null)) {
    return null;
  }

  const numbers = remaining as number[];

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function getCurrentAverage(session: ActiveSession, average: StatsAverage): number | null {
  const solves = session.solves.slice(0, average.size);

  if (solves.length < average.size) {
    return null;
  }

  const values = solves.map(solve => getSolveValue(solve, session));

  return calculateAverage(values, average);
}

function getBestAverage(session: ActiveSession, average: StatsAverage): number | null {
  if (session.solves.length < average.size) {
    return null;
  }

  let best: number | null = null;

  for (let index = 0; index <= session.solves.length - average.size; index += 1) {
    const solves = session.solves.slice(index, index + average.size);

    const values = solves.map(solve => getSolveValue(solve, session));

    const result = calculateAverage(values, average);

    if (result === null) {
      continue;
    }

    if (best === null) {
      best = result;
      continue;
    }

    if (session.eventId === 'mbld') {
      if (result > best) {
        best = result;
      }

      continue;
    }

    if (result < best) {
      best = result;
    }
  }

  return best;
}

function getBestSingle(session: ActiveSession): Solve | null {
  const validSolves = session.solves.filter(solve => getSolveValue(solve, session) !== null);

  if (validSolves.length === 0) {
    return null;
  }

  return validSolves.reduce((best, solve) => {
    const bestValue = getSolveValue(best, session);
    const solveValue = getSolveValue(solve, session);

    if (bestValue === null) {
      return solve;
    }

    if (solveValue === null) {
      return best;
    }

    if (session.eventId === 'mbld') {
      return solveValue > bestValue ? solve : best;
    }

    return solveValue < bestValue ? solve : best;
  });
}

function getValues(session: ActiveSession): number[] {
  return session.solves
    .map(solve => getSolveValue(solve, session))
    .filter((value): value is number => value !== null);
}

function getMean(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getStandardDeviation(values: number[]): number | null {
  const mean = getMean(values);

  if (mean === null) {
    return null;
  }

  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;

  return Math.sqrt(variance);
}

export function calculateStats(session: ActiveSession): SessionStats {
  const values = getValues(session);

  return {
    solveCount: session.solves.length,
    bestSingle: getBestSingle(session),
    mean: getMean(values),
    standardDeviation: getStandardDeviation(values),
    averages: STATS_AVERAGES.map(average => ({
      average,
      current: getCurrentAverage(session, average),
      best: getBestAverage(session, average),
    })),
  };
}
