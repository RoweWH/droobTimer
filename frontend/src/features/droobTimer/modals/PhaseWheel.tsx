import { useRef, useState } from 'react';

import type { Phase } from '../types';
import { formatTime } from '../utils/formatTime';

import './PhaseWheel.css';

type PhaseWheelProps = {
  phases: Phase[];
};

function getPhaseDuration(phases: Phase[], index: number): number | null {
  const value = phases[index].value;

  if (value === null) {
    return null;
  }

  if (index === 0) {
    return value;
  }

  const previousValue = phases[index - 1].value;

  if (previousValue === null) {
    return null;
  }

  return value - previousValue;
}

export function PhaseWheel({ phases }: PhaseWheelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelAmount = useRef(0);

  function handleWheel(event: React.WheelEvent) {
    event.preventDefault();

    wheelAmount.current += event.deltaY;

    if (Math.abs(wheelAmount.current) < 80) {
      return;
    }

    const direction = wheelAmount.current > 0 ? 1 : -1;

    setActiveIndex(index => Math.max(0, Math.min(phases.length - 1, index + direction)));

    wheelAmount.current = 0;
  }

  return (
    <div className="phase-wheel" onWheel={handleWheel}>
      <div
        className="phase-wheel__list"
        style={{
          transform: `translateY(calc(2.5rem - ${activeIndex * 3}rem))`,
        }}
      >
        {phases.map((phase, index) => {
          const distance = Math.abs(index - activeIndex);
          const duration = getPhaseDuration(phases, index);

          return (
            <div
              className="phase-wheel__item"
              data-distance={Math.min(distance, 2)}
              key={`${phase.name}-${index}`}
            >
              <span>{phase.name}:</span>
              <span>{duration === null ? '?' : formatTime(duration)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
