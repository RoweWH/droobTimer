import { SketchPyraminxSticker } from '../../../../components/Sketch/SketchSticker';
import type { PyraminxColor } from './types';

type PyraminxFaceProps = {
  color: PyraminxColor;
  x: number;
  y: number;
  pointsDown: boolean;
};

export function PyraminxFace({ color, x, y, pointsDown }: PyraminxFaceProps) {
  return (
    <SketchPyraminxSticker
      color={color}
      x={x}
      y={y}
      width={80}
      height={69.282}
      rotation={pointsDown ? 180 : 0}
    />
  );
}
