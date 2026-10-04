import { puzzles } from 'cubing/puzzles';

import { PUZZLE_IDS } from './types';
import type { PuzzleId, WcaEventId } from './types';
import { generateScramble } from './vendors/generateCubingJsScramble';

async function getState(scramble: string, puzzleId: PuzzleId) {
  const puzzle = await puzzles[puzzleId].kpuzzle();
  return puzzle.defaultPattern().applyAlg(scramble).patternData;
}

export async function generatePuzzle(
  eventId: WcaEventId,
  numberOfScrambles = 1,
) {
  const scramble = await generateScramble(eventId, numberOfScrambles);
  const puzzleId = PUZZLE_IDS[eventId];

  if (Array.isArray(scramble)) {
    return {
      eventId,
      puzzleId,
      scramble,
      state: await Promise.all(scramble.map(item => getState(item, puzzleId))),
    };
  }

  return {
    eventId,
    puzzleId,
    scramble,
    state: await getState(scramble, puzzleId),
  };
}

export type GeneratedPuzzle = Awaited<ReturnType<typeof generatePuzzle>>;
