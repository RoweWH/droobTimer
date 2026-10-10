export type SkewbColor = 'white' | 'yellow' | 'orange' | 'red' | 'blue' | 'green';

export type SkewbFaceName = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

export type SkewbOrbitName = 'CENTERS' | 'CORNERS';

export type SkewbState = Record<
  SkewbOrbitName,
  {
    pieces: number[];
    orientation: number[];
  }
>;

export type Point = {
  x: number;
  y: number;
};

export type FaceProjection = {
  face: SkewbFaceName;
  corners: readonly [Point, Point, Point, Point];
};

export type SkewbSticker = {
  color: SkewbColor;
  kind: 'corner' | 'center';
  origin: Point;
  xAxisEnd: Point;
  yAxisEnd: Point;
};
