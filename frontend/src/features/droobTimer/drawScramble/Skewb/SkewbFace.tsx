import { SketchSkewbSticker } from '../../../../components/Sketch/SketchSticker';
import type { SkewbSticker } from './types';

export function SkewbFace({ sticker }: { sticker: SkewbSticker }) {
  return <SketchSkewbSticker {...sticker} />;
}
