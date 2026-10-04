import type { GeneratedPuzzle } from '../../../tdrooble';
import type { ActiveSession, Phase, TimedSolve, TimerSettings } from '../types';
import { getAverageDisplay, getSolveValue } from '../utils/averages';

import { Stopwatch } from './Stopwatch/Stopwatch';

import './StandardTimer.css';

type StandardTimerProps = {
  session: ActiveSession;
  puzzle: GeneratedPuzzle | null;
  timerSettings: TimerSettings;
  onUpdateSession: (session: ActiveSession) => Promise<void>;
  onSolveComplete: () => void;
};


function getSolveDifference(session: ActiveSession): number | null {
  if (session.solves.length < 2) {
    return null;
  }

  const current = getSolveValue(session.solves[0], session);

  const previous = getSolveValue(session.solves[1], session);

  if (current === null || previous === null) {
    return null;
  }

  return current - previous;
}

export function StandardTimer({
  session,
  puzzle,
  timerSettings,
  onUpdateSession,
  onSolveComplete,
}: StandardTimerProps) {
  const phases: Phase[] = session.phases.map(name => ({
    name,
    value: null,
  }));

  const difference = getSolveDifference(session);

  const averages = [
    {
      label: session.firstAverage,
      value: getAverageDisplay(session, 0, session.firstAverage),
    },
    {
      label: session.secondAverage,
      value: getAverageDisplay(session, 0, session.secondAverage),
    },
  ];

  async function handleComplete(
    time: number,
    inspectionPenalty: 'none' | 'plusTwo' | 'dnf',
    completedPhases: Phase[]
  ) {
    if (!puzzle || puzzle.eventId !== session.eventId) {
      return;
    }

    const now = Date.now();

    const newSolve: TimedSolve = {
      id: now,
      sessionId: session.id,
      time,
      plusTwoCount: inspectionPenalty === 'plusTwo' ? 1 : 0,
      isDNF: inspectionPenalty === 'dnf',
      phases: completedPhases,
      createdAt: now,
      puzzle,
    };

    await onUpdateSession({
      ...session,
      solves: [newSolve, ...session.solves],
    });

    onSolveComplete();
  }

  return (
    <div className="standard-timer">
      <Stopwatch
        settings={timerSettings}
        eventId={session.eventId}
        phases={phases}
        difference={difference}
        averages={averages}
        onComplete={result =>
          void handleComplete(result.time, result.inspectionPenalty, result.phases)
        }
      />
    </div>
  );
}
