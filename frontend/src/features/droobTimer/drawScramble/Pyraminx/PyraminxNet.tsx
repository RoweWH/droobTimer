import type { PyraminxState } from './types';
import { getPyraminxStickers } from './getPyraminxStickers';
import { PyraminxFace } from './PyraminxFace';

export function PyraminxNet({ state }: { state: PyraminxState }) {
  const stickers = getPyraminxStickers(state);

  return (
    <svg
      className="pyraminx-net"
      viewBox="-8 -8 512 446"
      role="img"
      aria-label="Flat drawing of the scrambled Pyraminx"
    >
      {stickers.map((sticker, index) => (
        <PyraminxFace
          key={index}
          color={sticker.color}
          x={sticker.x}
          y={sticker.y}
          pointsDown={sticker.pointsDown}
        />
      ))}
    </svg>
  );
}
