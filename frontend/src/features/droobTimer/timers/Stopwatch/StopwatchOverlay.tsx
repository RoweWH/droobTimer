import { formatTime } from '../../utils/formatTime';

import './StopwatchOverlay.css';

type Phase = {
  name: string;
  value: number | null;
};

type StopwatchOverlayProps = {
  time: number;
  phases: Phase[];
  update: 'none' | 'x' | '.x' | '.xx';
};

function getDisplayTime(time: number, update: StopwatchOverlayProps['update']): string {
  if (update === 'none') {
    return 'solving...';
  }

  if (update === 'x') {
    return Math.floor(time / 1000).toString();
  }

  if (update === '.x') {
    return (Math.floor(time / 100) / 10).toFixed(1);
  }

  return formatTime(Math.floor(time / 10) * 10);
}

export function StopwatchOverlay({ time, phases, update }: StopwatchOverlayProps) {
  const completedPhases = phases.filter(phase => phase.value !== null);

  return (
    <div className="stopwatch-overlay">
      <div className="stopwatch-overlay__time">{getDisplayTime(time, update)}</div>

      {completedPhases.length > 0 && (
        <div className="stopwatch-overlay__phases">
          {completedPhases.map(phase => (
            <div key={phase.name} className="stopwatch-overlay__phase">
              <span>{phase.name}</span>
              <span>{formatTime(phase.value!)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
