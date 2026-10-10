import type {
  FaceProjection,
  Point,
  SkewbColor,
  SkewbFaceName,
  SkewbState,
  SkewbSticker,
} from './types';

const STICKER_GAP = 3;

const FACE_PROJECTIONS: readonly FaceProjection[] = [
  {
    face: 'L',
    corners: [
      { x: 18, y: 22 },
      { x: 92, y: 64 },
      { x: 92, y: 148 },
      { x: 18, y: 106 },
    ],
  },
  {
    face: 'B',
    corners: [
      { x: 232, y: 64 },
      { x: 306, y: 22 },
      { x: 306, y: 106 },
      { x: 232, y: 148 },
    ],
  },
  {
    face: 'U',
    corners: [
      { x: 92, y: 64 },
      { x: 162, y: 22 },
      { x: 232, y: 64 },
      { x: 162, y: 106 },
    ],
  },
  {
    face: 'F',
    corners: [
      { x: 92, y: 64 },
      { x: 162, y: 106 },
      { x: 162, y: 190 },
      { x: 92, y: 148 },
    ],
  },
  {
    face: 'R',
    corners: [
      { x: 162, y: 106 },
      { x: 232, y: 64 },
      { x: 232, y: 148 },
      { x: 162, y: 190 },
    ],
  },
  {
    face: 'D',
    corners: [
      { x: 92, y: 148 },
      { x: 162, y: 190 },
      { x: 162, y: 274 },
      { x: 92, y: 232 },
    ],
  },
];

const CENTER_FACES: readonly SkewbFaceName[] = ['F', 'R', 'D', 'U', 'L', 'B'];

const FACE_COLORS: Record<SkewbFaceName, SkewbColor> = {
  U: 'white',
  D: 'yellow',
  R: 'red',
  L: 'orange',
  F: 'green',
  B: 'blue',
};

const CORNER_FACES: readonly (readonly [SkewbFaceName, SkewbFaceName, SkewbFaceName])[] = [
  ['U', 'F', 'L'],
  ['U', 'B', 'R'],
  ['D', 'F', 'R'],
  ['U', 'R', 'F'],
  ['D', 'L', 'F'],
  ['D', 'R', 'B'],
  ['U', 'L', 'B'],
  ['D', 'B', 'L'],
];

const FACE_CORNERS: Record<SkewbFaceName, readonly [number, number, number, number]> = {
  U: [0, 6, 1, 3],
  F: [0, 3, 2, 4],
  R: [3, 1, 5, 2],
  D: [4, 2, 5, 7],
  L: [6, 0, 4, 7],
  B: [1, 6, 7, 5],
};

function midpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

function cornerColor(state: SkewbState, location: number, face: SkewbFaceName): SkewbColor {
  const piece = state.CORNERS.pieces[location];
  const twist = state.CORNERS.orientation[location];

  const stickerIndex = CORNER_FACES[location].indexOf(face);
  const pieceFace = CORNER_FACES[piece][(stickerIndex - twist + 3) % 3];

  return FACE_COLORS[pieceFace];
}

function addSpacing(sticker: SkewbSticker): SkewbSticker {
  const { origin, xAxisEnd, yAxisEnd } = sticker;

  const center = {
    x: (origin.x + xAxisEnd.x + yAxisEnd.x) / 3,
    y: (origin.y + xAxisEnd.y + yAxisEnd.y) / 3,
  };

  function moveInward(point: Point): Point {
    const dx = center.x - point.x;
    const dy = center.y - point.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) return point;

    return {
      x: point.x + (dx / distance) * STICKER_GAP,
      y: point.y + (dy / distance) * STICKER_GAP,
    };
  }

  return {
    ...sticker,
    origin: moveInward(origin),
    xAxisEnd: moveInward(xAxisEnd),
    yAxisEnd: moveInward(yAxisEnd),
  };
}

export function getSkewbStickers(state: SkewbState): SkewbSticker[] {
  return FACE_PROJECTIONS.flatMap(({ face, corners }) => {
    const [upperLeft, upperRight, lowerRight, lowerLeft] = corners;

    const top = midpoint(upperLeft, upperRight);
    const right = midpoint(upperRight, lowerRight);
    const bottom = midpoint(lowerRight, lowerLeft);
    const left = midpoint(lowerLeft, upperLeft);

    const locations = FACE_CORNERS[face];

    const centerLocation = CENTER_FACES.indexOf(face);
    const centerFace = CENTER_FACES[state.CENTERS.pieces[centerLocation]];

    const stickers: SkewbSticker[] = [
      {
        color: cornerColor(state, locations[0], face),
        kind: 'corner',
        origin: upperLeft,
        xAxisEnd: top,
        yAxisEnd: left,
      },
      {
        color: cornerColor(state, locations[1], face),
        kind: 'corner',
        origin: upperRight,
        xAxisEnd: right,
        yAxisEnd: top,
      },
      {
        color: cornerColor(state, locations[2], face),
        kind: 'corner',
        origin: lowerRight,
        xAxisEnd: bottom,
        yAxisEnd: right,
      },
      {
        color: cornerColor(state, locations[3], face),
        kind: 'corner',
        origin: lowerLeft,
        xAxisEnd: left,
        yAxisEnd: bottom,
      },
      {
        color: FACE_COLORS[centerFace],
        kind: 'center',
        origin: top,
        xAxisEnd: right,
        yAxisEnd: left,
      },
    ];

    return stickers.map(addSpacing);
  });
}
