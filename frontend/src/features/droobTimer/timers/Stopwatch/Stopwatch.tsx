import { useState } from 'react';

import { Gan, Manual, Spacebar, Stackmat } from '../input';
import { formatTime } from '../../utils/formatTime';
import { InspectionOverlay } from './InspectionOverlay';
import { StopwatchOverlay } from './StopwatchOverlay';
import { NON_INSPECTION_EVENTS, type Phase, type StopwatchResult, type StopwatchStatus, type TimerSettings } from '../../types';
import { useInspection } from './hooks/useInspection';
import { usePhases } from './hooks/usePhases';

import './Stopwatch.css';
import type { WcaEventId } from '../../../../tdrooble';

type AverageDisplay = {
  label: string;
  value: string;
};

type StopwatchProps = {
  settings: TimerSettings;
  eventId: WcaEventId;
  phases: Phase[];
  difference: number | null;
  averages: AverageDisplay[];
  onComplete: (result: StopwatchResult) => void;
};

export function Stopwatch({ settings, eventId, phases, difference, averages, onComplete }: StopwatchProps) {
  const [status, setStatus] = useState<StopwatchStatus>('idle');

  const [time, setTime] = useState<number | null>(null);

  const {
    isInspecting,
    inspectionTime,
    inspectionPenalty,
    startInspection,
    endInspection,
    resetInspection,
  } = useInspection();

  const { activePhases, startPhases, updatePhaseValues, finishPhases, resetPhases } =
    usePhases(phases);

  const inspectionEnabled =
    settings.inspection !== 'none' &&
    !settings.exceptions.includes(eventId) &&
    !NON_INSPECTION_EVENTS.includes(eventId);

  function startSolve() {
    endInspection();
    startPhases();
    setStatus('running');
  }

  function updateSolveTime(nextTime: number | null) {
    setTime(nextTime);
  }

  function finishSolve(finalTime: number) {
    const completedPhases = finishPhases(finalTime);

    setTime(finalTime);
    setStatus('idle');

    onComplete({
      time: finalTime,
      inspectionPenalty,
      phases: completedPhases,
    });

    resetInspection();
  }

  function cancelSolve() {
    setStatus('idle');
    resetInspection();
    resetPhases();
  }

  function getDifferenceDisplay() {
    if (difference === null) {
      return null;
    }

    const sign = difference > 0 ? '+' : difference < 0 ? '-' : '';

    return `${sign}${formatTime(Math.abs(difference))}`;
  }

  const differenceDisplay = getDifferenceDisplay();

  return (
    <div className="stopwatch">
      <div className="stopwatch-content">
        {status === 'idle' && !isInspecting && settings.input !== 'manual' && (
          <div className="stopwatch__time-row">
            <div className="stopwatch__time">{time === null ? '--.--' : formatTime(time)}</div>

            {time !== null && differenceDisplay && (
              <div
                className={`stopwatch__difference ${
                  difference !== null && difference > 0
                    ? 'stopwatch__difference--slower'
                    : difference !== null && difference < 0
                      ? 'stopwatch__difference--faster'
                      : ''
                }`}
              >
                ({differenceDisplay})
              </div>
            )}
          </div>
        )}

        {settings.input === 'manual' && (
          <Manual
            inspectionEnabled={inspectionEnabled}
            isInspecting={isInspecting}
            onStartInspection={startInspection}
            onEndInspection={endInspection}
            onSubmit={finishSolve}
          />
        )}

        {status === 'idle' && !isInspecting && (
          <div className="stopwatch__averages">
            {averages.map((average, index) => (
              <div className="stopwatch__average" key={index}>
                {average.label}: {average.value}
              </div>
            ))}
          </div>
        )}

        {settings.input === 'spacebar' && (
          <Spacebar
            status={status}
            inspectionEnabled={inspectionEnabled}
            isInspecting={isInspecting}
            phaseCount={phases.length}
            onPhaseValuesChange={updatePhaseValues}
            onStartInspection={startInspection}
            onStart={startSolve}
            onTimeUpdate={updateSolveTime}
            onStop={finishSolve}
          />
        )}

        {settings.input === 'stackmat' && (
          <Stackmat
            status={status}
            inspectionEnabled={inspectionEnabled}
            isInspecting={isInspecting}
            phaseCount={phases.length}
            onPhaseValuesChange={updatePhaseValues}
            onStartInspection={startInspection}
            onStart={startSolve}
            onTimeUpdate={updateSolveTime}
            onStop={finishSolve}
            onCancel={cancelSolve}
          />
        )}

        {settings.input === 'gan' && (
          <Gan
            status={status}
            inspectionEnabled={inspectionEnabled}
            isInspecting={isInspecting}
            phaseCount={phases.length}
            onPhaseValuesChange={updatePhaseValues}
            onStartInspection={startInspection}
            onStart={startSolve}
            onTimeUpdate={updateSolveTime}
            onStop={finishSolve}
            onCancel={cancelSolve}
          />
        )}

        {isInspecting && (
          <InspectionOverlay inspection={settings.inspection} inspectionTime={inspectionTime} />
        )}

        {status === 'running' && time !== null && (
          <StopwatchOverlay time={time} phases={activePhases} update={settings.update} />
        )}
      </div>
    </div>
  );
}
