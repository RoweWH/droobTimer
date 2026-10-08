import type {
  CubeFace,
  CubeState,
  StickerColor,
} from './cubeTypes';

type CubeSize = 2 | 3 | 4 | 5 | 6 | 7;
type Axis = 'x' | 'y' | 'z';

type Vector = {
  x: number;
  y: number;
  z: number;
};

type Sticker = {
  color: StickerColor;
  position: Vector;
  normal: Vector;
};

const FACE_COLORS: Record<CubeFace, StickerColor> = {
  U: 'white',
  L: 'orange',
  F: 'green',
  R: 'red',
  B: 'blue',
  D: 'yellow',
};

const FACES: CubeFace[] = ['U', 'L', 'F', 'R', 'B', 'D'];

function coordinate(index: number, size: number): number {
  return index * 2 - (size - 1);
}

function stickerGeometry(
  face: CubeFace,
  row: number,
  column: number,
  size: number,
): Pick<Sticker, 'position' | 'normal'> {
  const across = coordinate(column, size);
  const down = coordinate(row, size);
  const outer = size - 1;

  switch (face) {
    case 'U':
      return {
        position: { x: across, y: outer, z: down },
        normal: { x: 0, y: 1, z: 0 },
      };
    case 'D':
      return {
        position: { x: across, y: -outer, z: -down },
        normal: { x: 0, y: -1, z: 0 },
      };
    case 'F':
      return {
        position: { x: across, y: -down, z: outer },
        normal: { x: 0, y: 0, z: 1 },
      };
    case 'B':
      return {
        position: { x: -across, y: -down, z: -outer },
        normal: { x: 0, y: 0, z: -1 },
      };
    case 'R':
      return {
        position: { x: outer, y: -down, z: -across },
        normal: { x: 1, y: 0, z: 0 },
      };
    case 'L':
      return {
        position: { x: -outer, y: -down, z: across },
        normal: { x: -1, y: 0, z: 0 },
      };
  }
}

function createSolvedStickers(size: CubeSize): Sticker[] {
  return FACES.flatMap((face) =>
    Array.from({ length: size * size }, (_, index) => ({
      color: FACE_COLORS[face],
      ...stickerGeometry(
        face,
        Math.floor(index / size),
        index % size,
        size,
      ),
    })),
  );
}

function rotatePositiveQuarter(vector: Vector, axis: Axis): Vector {
  switch (axis) {
    case 'x':
      return { x: vector.x, y: -vector.z, z: vector.y };
    case 'y':
      return { x: vector.z, y: vector.y, z: -vector.x };
    case 'z':
      return { x: -vector.y, y: vector.x, z: vector.z };
  }
}

function rotateVector(
  vector: Vector,
  axis: Axis,
  quarterTurns: number,
): Vector {
  const turns = ((quarterTurns % 4) + 4) % 4;
  let rotated = vector;

  for (let turn = 0; turn < turns; turn += 1) {
    rotated = rotatePositiveQuarter(rotated, axis);
  }

  return rotated;
}

function applyMove(stickers: Sticker[], token: string, size: CubeSize): void {
  const rotationMatch = /^([xyz])(2|')?$/.exec(token);

  if (rotationMatch !== null) {
    const axis = rotationMatch[1] as Axis;
    const suffix = rotationMatch[2] ?? '';
    const quarterTurns = suffix === '2' ? 2 : suffix === "'" ? 1 : -1;

    for (const sticker of stickers) {
      sticker.position = rotateVector(sticker.position, axis, quarterTurns);
      sticker.normal = rotateVector(sticker.normal, axis, quarterTurns);
    }

    return;
  }

  const match = /^(\d+)?([ULFRBD])(w)?(2|')?$/.exec(token);

  if (match === null) {
    throw new Error(`Unsupported ${size}x${size} move: ${token}`);
  }

  const explicitWidth = match[1] === undefined ? null : Number(match[1]);
  const face = match[2] as CubeFace;
  const isWide = match[3] === 'w';
  const suffix = match[4] ?? '';
  const width = explicitWidth ?? (isWide ? 2 : 1);

  if ((!isWide && explicitWidth !== null) || width < 1 || width > size) {
    throw new Error(`Unsupported ${size}x${size} move: ${token}`);
  }

  const moveAxis: Record<CubeFace, { axis: Axis; side: 1 | -1 }> = {
    U: { axis: 'y', side: 1 },
    D: { axis: 'y', side: -1 },
    F: { axis: 'z', side: 1 },
    B: { axis: 'z', side: -1 },
    R: { axis: 'x', side: 1 },
    L: { axis: 'x', side: -1 },
  };

  const { axis, side } = moveAxis[face];
  const outer = size - 1;
  const minimumLayer = outer - (width - 1) * 2;
  const clockwiseTurns = suffix === '2' ? 2 : suffix === "'" ? 1 : -1;
  const positiveAxisTurns = clockwiseTurns * side;

  for (const sticker of stickers) {
    if (sticker.position[axis] * side < minimumLayer) continue;

    sticker.position = rotateVector(
      sticker.position,
      axis,
      positiveAxisTurns,
    );
    sticker.normal = rotateVector(sticker.normal, axis, positiveAxisTurns);
  }
}

function faceForNormal(normal: Vector): CubeFace {
  if (normal.y === 1) return 'U';
  if (normal.y === -1) return 'D';
  if (normal.z === 1) return 'F';
  if (normal.z === -1) return 'B';
  if (normal.x === 1) return 'R';
  return 'L';
}

function indexFromCoordinate(value: number, size: CubeSize): number {
  return (value + size - 1) / 2;
}

function faceIndex(
  face: CubeFace,
  position: Vector,
  size: CubeSize,
): number {
  let row: number;
  let column: number;

  switch (face) {
    case 'U':
      row = indexFromCoordinate(position.z, size);
      column = indexFromCoordinate(position.x, size);
      break;
    case 'D':
      row = indexFromCoordinate(-position.z, size);
      column = indexFromCoordinate(position.x, size);
      break;
    case 'F':
      row = indexFromCoordinate(-position.y, size);
      column = indexFromCoordinate(position.x, size);
      break;
    case 'B':
      row = indexFromCoordinate(-position.y, size);
      column = indexFromCoordinate(-position.x, size);
      break;
    case 'R':
      row = indexFromCoordinate(-position.y, size);
      column = indexFromCoordinate(-position.z, size);
      break;
    case 'L':
      row = indexFromCoordinate(-position.y, size);
      column = indexFromCoordinate(position.z, size);
      break;
  }

  return row * size + column;
}

function stickersToState(stickers: Sticker[], size: CubeSize): CubeState {
  const state = Object.fromEntries(
    FACES.map((face) => [
      face,
      Array<StickerColor>(size * size).fill(FACE_COLORS[face]),
    ]),
  ) as CubeState;

  for (const sticker of stickers) {
    const face = faceForNormal(sticker.normal);
    state[face][faceIndex(face, sticker.position, size)] = sticker.color;
  }

  return state;
}

export function getCubeState(scramble: string, size: CubeSize): CubeState {
  const stickers = createSolvedStickers(size);
  const moves = scramble.trim().split(/\s+/).filter(Boolean);

  for (const move of moves) {
    applyMove(stickers, move, size);
  }

  return stickersToState(stickers, size);
}

export function getSolvedCubeState(size: CubeSize): CubeState {
  return Object.fromEntries(
    FACES.map((face) => [
      face,
      Array<StickerColor>(size * size).fill(FACE_COLORS[face]),
    ]),
  ) as CubeState;
}

export function getThreeByThreeState(scramble: string): CubeState {
  return getCubeState(scramble, 3);
}

export function getSolvedThreeByThreeState(): CubeState {
  return getSolvedCubeState(3);
}
