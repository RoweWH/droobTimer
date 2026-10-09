import type { PyraminxColor, PyraminxOrbitName, PyraminxState } from './types';

type StickerSlot = {
  orbit: PyraminxOrbitName;
  location: number;
  orientation: number;
  x: number;
  y: number;
  pointsDown: boolean;
};

const X_STEP = 40;
const Y_STEP = 69.282;

function slot(
  orbit: PyraminxOrbitName,
  location: number,
  orientation: number,
  x: number,
  y: number,
  pointsDown: boolean
): StickerSlot {
  return {
    orbit,
    location,
    orientation,
    x: x * X_STEP,
    y: y * Y_STEP,
    pointsDown,
  };
}

const STICKER_SLOTS: StickerSlot[] = [
  slot('CORNERS', 0, 0, 5.2, 1.066666667, true),
  slot('CORNERS', 0, 1, 3, 0, false),
  slot('CORNERS', 0, 2, 7.4, 0, false),
  slot('CORNERS', 3, 0, 4.2, 3.2, false),
  slot('CORNERS', 3, 1, 2, 1, false),
  slot('CORNERS', 3, 2, 4.2, 2.066666667, true),
  slot('CORNERS', 2, 0, 6.2, 3.2, false),
  slot('CORNERS', 2, 1, 6.2, 2.066666667, true),
  slot('CORNERS', 2, 2, 8.4, 1, false),
  slot('CORNERS', 1, 1, 9.4, 0, false),
  slot('CORNERS', 1, 2, 1, 0, false),
  slot('CORNERS', 1, 0, 5.2, 4.2, false),

  slot('CORNERS2', 0, 0, 5.2, 0.066666667, false),
  slot('CORNERS2', 0, 1, 4, 0, true),
  slot('CORNERS2', 0, 2, 6.4, 0, true),
  slot('CORNERS2', 3, 0, 3.2, 3.2, true),
  slot('CORNERS2', 3, 1, 2, 2, true),
  slot('CORNERS2', 3, 2, 3.2, 2.066666667, false),
  slot('CORNERS2', 2, 0, 7.2, 3.2, true),
  slot('CORNERS2', 2, 1, 7.2, 2.066666667, false),
  slot('CORNERS2', 2, 2, 8.4, 2, true),
  slot('CORNERS2', 1, 1, 10.4, 0, true),
  slot('CORNERS2', 1, 2, 0, 0, true),
  slot('CORNERS2', 1, 0, 5.2, 5.2, true),

  slot('EDGES', 0, 0, 3, 1, true),
  slot('EDGES', 0, 1, 4.2, 1.066666667, false),
  slot('EDGES', 5, 0, 6.2, 1.066666667, false),
  slot('EDGES', 5, 1, 7.4, 1, true),
  slot('EDGES', 1, 0, 8.4, 0, true),
  slot('EDGES', 1, 1, 2, 0, true),
  slot('EDGES', 2, 0, 5.2, 3.2, true),
  slot('EDGES', 2, 1, 5.2, 2.066666667, false),
  slot('EDGES', 3, 0, 9.4, 1, true),
  slot('EDGES', 3, 1, 6.2, 4.2, true),
  slot('EDGES', 4, 0, 4.2, 4.2, true),
  slot('EDGES', 4, 1, 1, 1, true),
];

const SOLVED_PIECE_COLORS: Record<PyraminxOrbitName, PyraminxColor[][]> = {
  CORNERS: [
    ['green', 'red', 'blue'],
    ['yellow', 'blue', 'red'],
    ['yellow', 'green', 'blue'],
    ['yellow', 'red', 'green'],
  ],
  CORNERS2: [
    ['green', 'red', 'blue'],
    ['yellow', 'blue', 'red'],
    ['yellow', 'green', 'blue'],
    ['yellow', 'red', 'green'],
  ],
  EDGES: [
    ['red', 'green'],
    ['blue', 'red'],
    ['yellow', 'green'],
    ['blue', 'yellow'],
    ['yellow', 'red'],
    ['green', 'blue'],
  ],
};

function colorForSlot(state: PyraminxState, stickerSlot: StickerSlot): PyraminxColor {
  const orbit = state[stickerSlot.orbit];
  const piece = orbit.pieces[stickerSlot.location];
  const orientation = orbit.orientation[stickerSlot.location];
  const pieceColors = SOLVED_PIECE_COLORS[stickerSlot.orbit][piece];

  const colorIndex =
    (stickerSlot.orientation - orientation + pieceColors.length) % pieceColors.length;

  return pieceColors[colorIndex];
}

export function getPyraminxStickers(state: PyraminxState) {
  return STICKER_SLOTS.map(stickerSlot => ({
    color: colorForSlot(state, stickerSlot),
    x: stickerSlot.x,
    y: stickerSlot.y,
    pointsDown: stickerSlot.pointsDown,
  }));
}
