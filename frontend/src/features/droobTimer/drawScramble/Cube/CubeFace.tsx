import { SketchCubeSticker } from '../../../../components/Sketch/SketchSticker';
import type { CubeColor } from './getCubeStickers';

type CubeFaceProps = {
  stickers: CubeColor[];
  size: number;
  stickerSize: number;
  x: number;
  y: number;
};

export function CubeFace({ stickers, size, stickerSize, x, y }: CubeFaceProps) {
  return (
    <>
      {stickers.map((color, index) => (
        <SketchCubeSticker
          key={index}
          color={color}
          x={x + (index % size) * stickerSize}
          y={y + Math.floor(index / size) * stickerSize}
          width={stickerSize}
        />
      ))}
    </>
  );
}
