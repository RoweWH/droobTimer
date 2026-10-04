import { useTheme } from '../../../context/ThemeContext';

type SketchPyraminxStickerColor = 'yellow' | 'red' | 'blue' | 'green';

type SketchPyraminxStickerProps = {
  color: SketchPyraminxStickerColor;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export function SketchPyraminxSticker({
  color,
  x,
  y,
  width,
  height,
  rotation = 0,
}: SketchPyraminxStickerProps) {
  const { theme } = useTheme();

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return (
    <image
      href={theme.assets.drawScramble.pyraminx[color]}
      x={x}
      y={y}
      width={width}
      height={height}
      preserveAspectRatio="none"
      transform={rotation === 0 ? undefined : `rotate(${rotation} ${centerX} ${centerY})`}
    />
  );
}
