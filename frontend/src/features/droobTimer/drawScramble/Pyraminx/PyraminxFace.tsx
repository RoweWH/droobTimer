import { SketchPyraminxSticker } from '../../../../components/Sketch/SketchSticker';
import type { PyraminxColor } from './types';

type PyraminxFaceProps = {
  color: PyraminxColor;
  x: number;
  y: number;
  pointsDown: boolean;
};

export function PyraminxFace({ color, x, y, pointsDown }: PyraminxFaceProps) {
  const width = 80;
  const height = 69.282;
  const scale = 0.85;

  const centerX = x + width / 2;
  const centerY = y + (pointsDown ? height / 3 : (height * 2) / 3);

  return (
    <g
      transform={`translate(${centerX} ${centerY}) scale(${scale}) translate(${-centerX} ${-centerY})`}
    >
      <SketchPyraminxSticker
        color={color}
        x={x}
        y={y}
        width={width}
        height={height}
        rotation={pointsDown ? 180 : 0}
      />
    </g>
  );
}
