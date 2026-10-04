import { randomScrambleForEvent } from 'cubing/scramble';

import type { WcaEventId } from '../types';
import {
  BLD_SCRAMBLE_ORIENTATIONS,
  FIVE_BLD_SCRAMBLE_ORIENTATIONS,
  FMC_START_END,
  FOUR_BLD_SCRAMBLE_ORIENTATIONS,
} from './scramblerConstants';

function getRandomOrientation(orientations: readonly string[]): string {
  return orientations[Math.floor(Math.random() * orientations.length)];
}

function addOrientation(scramble: string, orientations: readonly string[]): string {
  const orientation = getRandomOrientation(orientations);

  return orientation ? `${scramble} ${orientation}` : scramble;
}

function trimFmcScramble(scramble: string): string {
  const moves = scramble.trim().split(/\s+/);

  if (/^F(?:2|')?$/.test(moves[0] ?? '')) {
    moves.shift();
  }

  if (/^R(?:2|')?$/.test(moves[moves.length - 1] ?? '')) {
    moves.pop();
  }

  return moves.join(' ');
}

function correctClockScramble(scramble: string): string {
  const movedSection = scramble.slice(22, 42);
  const remainingScramble = scramble.slice(0, 22) + scramble.slice(42);

  return movedSection + remainingScramble;
}

async function generateStandardScramble(eventId: string): Promise<string> {
  return (await randomScrambleForEvent(eventId)).toString();
}

async function generateBlindScramble(
  eventId: string,
  orientations: readonly string[],
): Promise<string> {
  const scramble = await generateStandardScramble(eventId);

  return addOrientation(scramble, orientations);
}

async function generateFmcScramble(): Promise<string> {
  const scramble = trimFmcScramble(await generateStandardScramble('333'));

  return `${FMC_START_END} ${scramble} ${FMC_START_END}`;
}

export async function generateScramble(
  eventId: WcaEventId,
  numberOfScrambles = 1,
) {
  if (eventId === '333fm') {
    return generateFmcScramble();
  }

  if (eventId === '333bf') {
    return generateBlindScramble('333', BLD_SCRAMBLE_ORIENTATIONS);
  }

  if (eventId === '444bf') {
    return generateBlindScramble('444', FOUR_BLD_SCRAMBLE_ORIENTATIONS);
  }

  if (eventId === '555bf') {
    return generateBlindScramble('555', FIVE_BLD_SCRAMBLE_ORIENTATIONS);
  }

  if (eventId === 'mbld') {
    const count = Math.min(100, Math.max(1, Math.trunc(numberOfScrambles)));

    return Promise.all(
      Array.from({ length: count }, () =>
        generateBlindScramble('333', BLD_SCRAMBLE_ORIENTATIONS),
      ),
    );
  }

  if (eventId === 'clock') {
    return correctClockScramble(await generateStandardScramble('clock'));
  }

  return generateStandardScramble(eventId);
}
