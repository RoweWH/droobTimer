import type { CubeState } from '../../../../tdrooble';
import { CubeFace } from './CubeFace';

type CubeNetProps = {
  size: number;
  state: CubeState;
};

const FACE_SIZE = 84;
const GAP = 4;

export function CubeNet({ size, state }: CubeNetProps) {
  const stickerSize = FACE_SIZE / size;
  const step = FACE_SIZE + GAP;
  const width = FACE_SIZE * 4 + GAP * 5;
  const height = FACE_SIZE * 3 + GAP * 4;
  const centerX = GAP + step;

  return (
    <svg
      className="cube-net"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Flat drawing of the scrambled ${size} by ${size} cube`}
    >
      <CubeFace stickers={state.U} size={size} stickerSize={stickerSize} x={centerX} y={GAP} />
      <CubeFace stickers={state.L} size={size} stickerSize={stickerSize} x={GAP} y={GAP + step} />
      <CubeFace stickers={state.F} size={size} stickerSize={stickerSize} x={centerX} y={GAP + step} />
      <CubeFace stickers={state.R} size={size} stickerSize={stickerSize} x={GAP + step * 2} y={GAP + step} />
      <CubeFace stickers={state.B} size={size} stickerSize={stickerSize} x={GAP + step * 3} y={GAP + step} />
      <CubeFace stickers={state.D} size={size} stickerSize={stickerSize} x={centerX} y={GAP + step * 2} />
    </svg>
  );
}
