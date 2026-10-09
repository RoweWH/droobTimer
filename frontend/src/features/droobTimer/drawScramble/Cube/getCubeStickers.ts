import type { KPatternData } from 'cubing/kpuzzle';
import { getPuzzleGeometryByName } from 'cubing/puzzle-geometry';

export type CubeColor = 'white' | 'yellow' | 'orange' | 'red' | 'blue' | 'green';

export type CubeFaceName = 'U' | 'L' | 'F' | 'R' | 'B' | 'D';

export type CubeStickers = Record<CubeFaceName, CubeColor[]>;

type Sticker = {
  orbit: string;
  ord: number;
  ori: number;
  coords: number[];
  isDup?: boolean;
};

type MappedSticker = {
  face: CubeFaceName;
  index: number;
  orbit: string;
  ord: number;
  ori: number;
};

type CubeMapping = {
  stickers: MappedSticker[];
  solvedColors: Map<string, CubeColor>;
  orientations: Map<string, number>;
};

const COLORS: Record<CubeFaceName, CubeColor> = {
  U: 'white',
  L: 'orange',
  F: 'green',
  R: 'red',
  B: 'blue',
  D: 'yellow',
};

const FACE_NAMES: CubeFaceName[] = ['U', 'L', 'F', 'R', 'B', 'D'];

// EDGES2 indices derived from the 5x5 R, U, F and L move states.
// These are the twelve middle edges on odd-order cubes.
const MIDGE_POSITIONS = [
  'DF',
  'FL',
  'DR',
  'DB',
  'FR',
  'DL',
  'UR',
  'BR',
  'UL',
  'UB',
  'BL',
  'UF',
] as const;

const cache = new Map<number, CubeMapping>();

function stickerCenter(coords: number[]): [number, number, number] {
  const count = coords.length / 3;

  let x = 0;
  let y = 0;
  let z = 0;

  for (let i = 0; i < coords.length; i += 3) {
    x += coords[i];
    y += coords[i + 1];
    z += coords[i + 2];
  }

  return [x / count, y / count, z / count];
}

function faceAt([x, y, z]: number[]): CubeFaceName {
  const a = [Math.abs(x), Math.abs(y), Math.abs(z)];
  const largest = Math.max(...a);

  if (a[1] === largest) return y > 0 ? 'U' : 'D';
  if (a[0] === largest) return x > 0 ? 'R' : 'L';

  return z > 0 ? 'F' : 'B';
}

function positionOnFace(face: CubeFaceName, [x, y, z]: number[]): [number, number] {
  switch (face) {
    case 'U':
      return [x, z];
    case 'D':
      return [x, -z];
    case 'F':
      return [x, -y];
    case 'B':
      return [-x, -y];
    case 'R':
      return [-z, -y];
    case 'L':
      return [z, -y];
  }
}

function makeMapping(size: number): CubeMapping {
  const geometry = getPuzzleGeometryByName(`${size}x${size}x${size}`);
  const stickers = geometry.get3d().stickers as Sticker[];

  const mapped: MappedSticker[] = [];
  const solvedColors = new Map<string, CubeColor>();
  const orientations = new Map<string, number>();

  const faces = new Map<
    CubeFaceName,
    Array<{
      sticker: Sticker;
      point: [number, number];
    }>
  >();

  for (const face of FACE_NAMES) {
    faces.set(face, []);
  }

  for (const sticker of stickers) {
    if (sticker.isDup) continue;

    const center = stickerCenter(sticker.coords);
    const face = faceAt(center);

    faces.get(face)!.push({
      sticker,
      point: positionOnFace(face, center),
    });

    solvedColors.set(`${sticker.orbit}:${sticker.ord}:${sticker.ori}`, COLORS[face]);

    orientations.set(
      sticker.orbit,
      Math.max(orientations.get(sticker.orbit) ?? 0, sticker.ori + 1)
    );
  }

  for (const face of FACE_NAMES) {
    const entries = faces.get(face)!;

    const xs = [...new Set(entries.map(entry => Number(entry.point[0].toFixed(5))))].sort(
      (a, b) => a - b
    );

    const ys = [...new Set(entries.map(entry => Number(entry.point[1].toFixed(5))))].sort(
      (a, b) => a - b
    );

    if (xs.length !== size || ys.length !== size || entries.length !== size * size) {
      throw new Error(`Could not map ${size}x${size} ${face} stickers`);
    }

    for (const { sticker, point } of entries) {
      const col = xs.indexOf(Number(point[0].toFixed(5)));
      const row = ys.indexOf(Number(point[1].toFixed(5)));

      mapped.push({
        face,
        index: row * size + col,
        orbit: sticker.orbit,
        ord: sticker.ord,
        ori: sticker.ori,
      });
    }
  }

  const result = {
    stickers: mapped,
    solvedColors,
    orientations,
  };

  cache.set(size, result);

  return result;
}

export function getCubeStickers(state: KPatternData, size: number): CubeStickers {
  const mapping = cache.get(size) ?? makeMapping(size);

  const result = Object.fromEntries(
    FACE_NAMES.map(face => [face, Array<CubeColor>(size * size).fill(COLORS[face])])
  ) as CubeStickers;

  for (const sticker of mapping.stickers) {
    const orbit = state[sticker.orbit];

    if (!orbit) {
      throw new Error(`Missing cube orbit: ${sticker.orbit}`);
    }

    if (sticker.orbit === 'EDGES2' && (size === 5 || size === 7)) {
      // Geometry supplies the facelet's physical location, but its orbit
      // numbering does not match the saved EDGES2 KPattern numbering.
      const locationFaces = mapping.stickers
        .filter(other => other.orbit === 'EDGES2' && other.ord === sticker.ord)
        .map(other => other.face);

      const location = MIDGE_POSITIONS.findIndex(edge =>
        locationFaces.every(face => edge.includes(face))
      );

      if (location < 0) {
        throw new Error('Unknown middle edge location');
      }

      const piece = orbit.pieces[location];
      const orientation = orbit.orientation[location];
      const pieceFaces = MIDGE_POSITIONS[piece];
      const stickerIndex = MIDGE_POSITIONS[location].indexOf(sticker.face);
      const colorIndex = (stickerIndex + orientation) % 2;

      result[sticker.face][sticker.index] = COLORS[pieceFaces[colorIndex] as CubeFaceName];

      continue;
    }

    const piece = orbit.pieces[sticker.ord];
    const orientation = orbit.orientation[sticker.ord];
    const count = mapping.orientations.get(sticker.orbit)!;

    const ori =
      sticker.orbit === 'CORNERS'
        ? (sticker.ori - orientation + count) % count
        : (sticker.ori + orientation) % count;

    const color = mapping.solvedColors.get(`${sticker.orbit}:${piece}:${ori}`);

    if (!color) {
      throw new Error(`Missing sticker color: ${sticker.orbit}:${piece}:${ori}`);
    }

    result[sticker.face][sticker.index] = color;
  }

  return result;
}
