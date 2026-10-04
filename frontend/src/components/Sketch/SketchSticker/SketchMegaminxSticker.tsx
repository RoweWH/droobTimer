import { useTheme } from '../../../context/ThemeContext';

type SketchMegaminxStickerColor =
  | 'white'
  | 'dark-green'
  | 'red'
  | 'dark-blue'
  | 'yellow'
  | 'purple'
  | 'gray'
  | 'light-green'
  | 'orange'
  | 'light-blue'
  | 'cream'
  | 'pink';

type SketchMegaminxStickerKind = 'center' | 'edge' | 'corner';

type SketchMegaminxStickerProps = {
  kind: SketchMegaminxStickerKind;
  color: SketchMegaminxStickerColor;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export function SketchMegaminxSticker({
  kind,
  color,
  x,
  y,
  width,
  height,
  rotation,
}: SketchMegaminxStickerProps) {
  const { theme } = useTheme();

  const stickers = theme.assets.drawScramble.megaminx[kind];

  return (
    <image
      href={stickers[color]}
      x={x - width / 2}
      y={y - height / 2}
      width={width}
      height={height}
      transform={`rotate(${rotation} ${x} ${y})`}
      preserveAspectRatio="none"
    />
  );
}
