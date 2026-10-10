import { SketchClockSticker } from '../../../../components/Sketch/SketchSticker';

type ClockState = Record<string, { orientation: number[] }>;

export function ClockNet({ state }: { state: ClockState }) {
  const dials = state.DIALS?.orientation;

  if (!dials || dials.length !== 18) return null;

  const size = 44;
  const gap = 4;
  const faceWidth = size * 3 + gap * 2;
  const faceGap = 24;

  return (
    <svg
      className="cube-net"
      viewBox={`0 0 ${faceWidth * 2 + faceGap} ${faceWidth}`}
      role="img"
      aria-label="Front and back views of the scrambled Clock"
    >
      {dials.map((position, index) => {
        const face = Math.floor(index / 9);
        const dial = index % 9;
        const x = face * (faceWidth + faceGap) + (dial % 3) * (size + gap);
        const y = Math.floor(dial / 3) * (size + gap);

        return (
          <SketchClockSticker
            key={index}
            color={face === 0 ? 'white' : 'black'}
            rotation={position * 30}
            x={x}
            y={y}
            size={size}
          />
        );
      })}
    </svg>
  );
}
