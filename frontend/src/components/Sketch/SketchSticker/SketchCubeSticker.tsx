import { useTheme } from '../../../context/ThemeContext';

type SketchCubeStickerColor = 'white' | 'yellow' | 'orange' | 'red' | 'blue' | 'green';

type SketchCubeStickerProps = {
  color: SketchCubeStickerColor;
  x: number;
  y: number;
  width: number;
  height?: number;
  rotation?: number;
};

export function SketchCubeSticker({
  color,
  x,
  y,
  width,
  height = width,
  rotation = 0,
}: SketchCubeStickerProps) {
  const { theme } = useTheme();

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return (
    <image
      href={theme.assets.drawScramble.cube[color]}
      x={x}
      y={y}
      width={width}
      height={height}
      preserveAspectRatio="none"
      transform={rotation === 0 ? undefined : `rotate(${rotation} ${centerX} ${centerY})`}
    />
  );
}
