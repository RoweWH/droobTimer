export type PyraminxColor = 'yellow' | 'red' | 'blue' | 'green';
export type PyraminxOrbitName = 'EDGES' | 'CORNERS' | 'CORNERS2';
export type PyraminxState = Record<PyraminxOrbitName, {
  pieces: number[];
  orientation: number[];
}>;
