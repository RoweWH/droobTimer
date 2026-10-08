export type CubeFace = 'U' | 'L' | 'F' | 'R' | 'B' | 'D';

export type StickerColor =
  | 'white'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'blue'
  | 'green';

export type CubeFaceState = StickerColor[];

export type CubeState = Record<CubeFace, CubeFaceState>;
