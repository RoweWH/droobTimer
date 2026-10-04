export type WcaEventId =
  | '222'
  | '333'
  | '333bf'
  | '333oh'
  | '333fm'
  | '444'
  | '444bf'
  | '555'
  | '555bf'
  | '666'
  | '777'
  | 'clock'
  | 'minx'
  | 'pyram'
  | 'skewb'
  | 'sq1'
  | 'mbld';

export type CubePuzzleId =
  | '2x2x2'
  | '3x3x3'
  | '4x4x4'
  | '5x5x5'
  | '6x6x6'
  | '7x7x7';

export type PuzzleId =
  | CubePuzzleId
  | 'clock'
  | 'megaminx'
  | 'pyraminx'
  | 'skewb'
  | 'square1';

export const PUZZLE_IDS: Record<WcaEventId, PuzzleId> = {
  '222': '2x2x2',
  '333': '3x3x3',
  '333bf': '3x3x3',
  '333oh': '3x3x3',
  '333fm': '3x3x3',
  '444': '4x4x4',
  '444bf': '4x4x4',
  '555': '5x5x5',
  '555bf': '5x5x5',
  '666': '6x6x6',
  '777': '7x7x7',
  'clock': 'clock',
  'minx': 'megaminx',
  'pyram': 'pyraminx',
  'skewb': 'skewb',
  'sq1': 'square1',
  'mbld': '3x3x3',
};
