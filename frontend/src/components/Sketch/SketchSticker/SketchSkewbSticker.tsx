import { useTheme } from '../../../context/ThemeContext';

type SketchSkewbStickerColor = 'white' | 'yellow' | 'orange' | 'red' | 'blue' | 'green';

type SketchSkewbStickerKind = 'center' | 'corner';

type SketchStickerPoint = {
  x: number;
  y: number;
};

type SketchSkewbStickerProps = {
  color: SketchSkewbStickerColor;
  kind: SketchSkewbStickerKind;
  origin: SketchStickerPoint;
  xAxisEnd: SketchStickerPoint;
  yAxisEnd: SketchStickerPoint;
};

function getProjectionTransform(
  origin: SketchStickerPoint,
  xAxisEnd: SketchStickerPoint,
  yAxisEnd: SketchStickerPoint
): string {
  const a = (xAxisEnd.x - origin.x) / 100;
  const b = (xAxisEnd.y - origin.y) / 100;
  const c = (yAxisEnd.x - origin.x) / 100;
  const d = (yAxisEnd.y - origin.y) / 100;

  return `matrix(${a} ${b} ${c} ${d} ${origin.x} ${origin.y})`;
}

export function SketchSkewbSticker({
  color,
  kind,
  origin,
  xAxisEnd,
  yAxisEnd,
}: SketchSkewbStickerProps) {
  const { theme } = useTheme();

  const stickers = theme.assets.drawScramble.skewb[kind];

  return (
    <image
      href={stickers[color]}
      x={0}
      y={0}
      width={100}
      height={100}
      preserveAspectRatio="none"
      transform={getProjectionTransform(origin, xAxisEnd, yAxisEnd)}
    />
  );
}
