import { useTheme } from '../../../context/ThemeContext';

type SketchSq1CornerSticker =
  | 'black-red-green'
  | 'black-green-orange'
  | 'black-orange-blue'
  | 'black-blue-red'
  | 'white-red-green'
  | 'white-green-orange'
  | 'white-orange-blue'
  | 'white-blue-red';

type SketchSq1EdgeSticker =
  | 'black-red'
  | 'black-green'
  | 'black-orange'
  | 'black-blue'
  | 'white-red'
  | 'white-green'
  | 'white-orange'
  | 'white-blue';

type SketchSq1StickerProps =
  | {
      kind: 'corner';
      sticker: SketchSq1CornerSticker;
      angle: number;
      flipped: boolean;
      centerX: number;
      centerY: number;
    }
  | {
      kind: 'edge';
      sticker: SketchSq1EdgeSticker;
      angle: number;
      flipped: boolean;
      centerX: number;
      centerY: number;
    }
  | {
      kind: 'equator';
      flipped: boolean;
    };

const SOURCE_WIDTH = 5.5;
const SOURCE_HEIGHT = 2.82;
const SOURCE_TIP_Y = 2.75;

const DRAWN_WIDTH = 300;
const DRAWN_HEIGHT = (SOURCE_HEIGHT / SOURCE_WIDTH) * DRAWN_WIDTH;
const DRAWN_TIP_Y = (SOURCE_TIP_Y / SOURCE_HEIGHT) * DRAWN_HEIGHT;

const EQUATOR_X = 0;
const EQUATOR_Y = 0;
const EQUATOR_WIDTH = 300;
const EQUATOR_HEIGHT = 100;

export function SketchSq1Sticker(props: SketchSq1StickerProps) {
  const { theme } = useTheme();
  const sq1 = theme.assets.drawScramble.sq1;

  if (props.kind === 'equator') {
    return (
      <image
        href={sq1.equator[props.flipped ? 'odd' : 'even']}
        x={EQUATOR_X}
        y={EQUATOR_Y}
        width={EQUATOR_WIDTH}
        height={EQUATOR_HEIGHT}
        preserveAspectRatio="xMidYMid meet"
      />
    );
  }

  const sticker = props.kind === 'corner' ? sq1.corner[props.sticker] : sq1.edge[props.sticker];

  const transform = [
    `translate(${props.centerX} ${props.centerY})`,
    `rotate(${props.angle})`,
    props.flipped ? 'scale(-1 1)' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g transform={transform}>
      <image
        href={sticker}
        x={-DRAWN_WIDTH / 2}
        y={-DRAWN_TIP_Y}
        width={DRAWN_WIDTH}
        height={DRAWN_HEIGHT}
        preserveAspectRatio="xMidYMid meet"
      />
    </g>
  );
}
