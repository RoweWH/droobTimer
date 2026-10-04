import { useTheme } from '../../../context/ThemeContext';

type SketchClockStickerColor = 'white' | 'blue';

type SketchClockStickerProps = {
  color: SketchClockStickerColor;
  rotation: number;
  x: number;
  y: number;
  size: number;
};

export function SketchClockSticker({ color, rotation, x, y, size }: SketchClockStickerProps) {
  const { theme } = useTheme();

  const centerX = x + size / 2;
  const centerY = y + size / 2;

  return (
    <image
      href={theme.assets.drawScramble.clock[color]}
      x={x}
      y={y}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      transform={`rotate(${rotation} ${centerX} ${centerY})`}
    />
  );
}
