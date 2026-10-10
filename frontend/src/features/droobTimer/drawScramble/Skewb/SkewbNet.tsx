import { getSkewbStickers } from './getSkewbStickers';
import { SkewbFace } from './SkewbFace';
import type { SkewbState } from './types';

export function SkewbNet({ state }: { state: SkewbState }) {
  const stickers = getSkewbStickers(state);

  return (
    <svg
      className="skewb-drawing"
      viewBox="8 12 308 272"
      role="img"
      aria-label="Corner-front drawing of the scrambled Skewb"
    >
      {stickers.map((sticker, index) => (
        <SkewbFace key={index} sticker={sticker} />
      ))}
    </svg>
  );
}
