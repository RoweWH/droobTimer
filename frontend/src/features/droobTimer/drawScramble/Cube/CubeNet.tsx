import type { KPatternData } from 'cubing/kpuzzle';
import { CubeFace } from './CubeFace';
import { getCubeStickers } from './getCubeStickers';

type CubeNetProps = {
  size: number;
  state: KPatternData;
};

const FACE_SIZE = 84;
const GAP = 4;

export function CubeNet({ size, state }: CubeNetProps) {
  const faces = getCubeStickers(state, size);
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
      <CubeFace stickers={faces.U} size={size} stickerSize={stickerSize} x={centerX} y={GAP} />
      <CubeFace stickers={faces.L} size={size} stickerSize={stickerSize} x={GAP} y={GAP + step} />
      <CubeFace
        stickers={faces.F}
        size={size}
        stickerSize={stickerSize}
        x={centerX}
        y={GAP + step}
      />
      <CubeFace
        stickers={faces.R}
        size={size}
        stickerSize={stickerSize}
        x={GAP + step * 2}
        y={GAP + step}
      />
      <CubeFace
        stickers={faces.B}
        size={size}
        stickerSize={stickerSize}
        x={GAP + step * 3}
        y={GAP + step}
      />
      <CubeFace
        stickers={faces.D}
        size={size}
        stickerSize={stickerSize}
        x={centerX}
        y={GAP + step * 2}
      />
    </svg>
  );
}
