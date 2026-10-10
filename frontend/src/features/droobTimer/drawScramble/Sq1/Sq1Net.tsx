import type { ComponentProps } from 'react';

import { SketchSq1Sticker } from '../../../../components/Sketch/SketchSticker';

import type { Sq1LayerState, Sq1Piece as Sq1PieceState, Sq1PieceId } from './squareOneTypes';

import { getSq1State } from './getSquareOneState';

type CornerSticker = Extract<
  ComponentProps<typeof SketchSq1Sticker>,
  { kind: 'corner' }
>['sticker'];

type EdgeSticker = Extract<ComponentProps<typeof SketchSq1Sticker>, { kind: 'edge' }>['sticker'];

const PIECE_STICKERS: Record<Sq1PieceId, CornerSticker | EdgeSticker> = {
  ufr: 'black-orange-blue',
  urb: 'black-blue-red',
  ubl: 'black-red-green',
  ulf: 'black-green-orange',

  dfr: 'white-orange-blue',
  drb: 'white-blue-red',
  dbl: 'white-red-green',
  dlf: 'white-green-orange',

  uf: 'black-orange',
  ur: 'black-blue',
  ub: 'black-red',
  ul: 'black-green',

  df: 'white-orange',
  dr: 'white-blue',
  db: 'white-red',
  dl: 'white-green',
};

type PiecePlacement = {
  piece: Sq1PieceState;
  start: number;
  width: number;
};

function getPiecePlacements(layer: Sq1LayerState): PiecePlacement[] {
  const placements: PiecePlacement[] = [];

  for (let index = 0; index < layer.length; index += 1) {
    const previous = layer[(index - 1 + layer.length) % layer.length];

    const piece = layer[index];

    if (piece === previous) {
      continue;
    }

    let width = 1;

    while (width < layer.length && layer[(index + width) % layer.length] === piece) {
      width += 1;
    }

    placements.push({
      piece,
      start: index,
      width,
    });
  }

  return placements;
}

type LayerDrawingProps = {
  layer: Sq1LayerState;
  centerX: number;
  centerY: number;
  rotateForBottom?: boolean;
};

function LayerDrawing({ layer, centerX, centerY, rotateForBottom = false }: LayerDrawingProps) {
  return (
    <g>
      {getPiecePlacements(layer).map(({ piece, start, width }) => {
        const topAngle = (start + width / 2) * 30;

        const angle = rotateForBottom ? 180 - topAngle : topAngle;

        const flipped = piece.flipped !== rotateForBottom;

        const common = {
          angle,
          flipped,
          centerX,
          centerY,
        };

        if (piece.kind === 'corner') {
          return (
            <SketchSq1Sticker
              key={`${piece.id}-${start}`}
              kind="corner"
              sticker={PIECE_STICKERS[piece.id] as CornerSticker}
              {...common}
            />
          );
        }

        return (
          <SketchSq1Sticker
            key={`${piece.id}-${start}`}
            kind="edge"
            sticker={PIECE_STICKERS[piece.id] as EdgeSticker}
            {...common}
          />
        );
      })}
    </g>
  );
}

export function Sq1Net({ scramble }: { scramble: string }) {
  const state = getSq1State(scramble);

  return (
    <svg
      className="sq1-drawing"
      viewBox="0 0 760 420"
      role="img"
      aria-label="Top, bottom, and equator drawing of the scrambled Square-1"
    >
      <LayerDrawing layer={state.top} centerX={200} centerY={190} />

      <LayerDrawing layer={state.bottom} centerX={560} centerY={190} rotateForBottom />

      <g transform="translate(300 355) scale(0.533333)">
        <SketchSq1Sticker kind="equator" flipped={state.equatorFlipped} />
      </g>
    </svg>
  );
}
