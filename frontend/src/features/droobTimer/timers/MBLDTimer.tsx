import { useState } from 'react';

import type { GeneratedPuzzle } from '../../../tdrooble';
import type { ActiveSession, MbldSolve, Phase, TimerSettings } from '../types';
import { getAverageDisplay, getSolveValue } from '../utils/averages';
import { MBLDResultModal, type MBLDResult } from './MBLDResultModal';

import { Stopwatch } from './Stopwatch/Stopwatch';

import './MBLDTimer.css';

type MBLDTimerProps = {
  session: ActiveSession;
  puzzle: GeneratedPuzzle | null;
  timerSettings: TimerSettings;
  onUpdateSession: (session: ActiveSession) => Promise<void>;
  onSolveComplete: () => void;
};

type PendingResult = {
  time: number;
  phases: Phase[];
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

export function MBLDTimer({
  session,
  puzzle,
  timerSettings,
  onUpdateSession,
  onSolveComplete,
}: MBLDTimerProps) {
  const [pendingResult, setPendingResult] = useState<PendingResult | null>(null);

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

  function handleTimerComplete(time: number, completedPhases: Phase[]) {
    if (!puzzle || puzzle.eventId !== 'mbld') {
      return;
    }

    setPendingResult({
      time,
      phases: completedPhases,
    });
  }

  async function handleResultSubmit(result: MBLDResult) {
    if (!puzzle || puzzle.eventId !== 'mbld' || !pendingResult) {
      return;
    }

    const now = Date.now();

    const newSolve: MbldSolve = {
      id: now,
      sessionId: session.id,
      time: pendingResult.time,
      solved: result.solved,
      attempted: puzzle.scramble.length,
      plusTwoCount: result.plusTwoCount,
      solvedAtHour: result.solvedAtHour,
      isDNF: result.isDNF,
      ...(result.note ? { note: result.note } : {}),
      phases: pendingResult.phases,
      createdAt: now,
      puzzle,
    };

    await onUpdateSession({
      ...session,
      solves: [newSolve, ...session.solves],
    });

    setPendingResult(null);
    onSolveComplete();
  }

  return (
    <div className="mbld-timer">
      <Stopwatch
        settings={timerSettings}
        eventId="mbld"
        phases={phases}
        difference={difference}
        averages={averages}
        onComplete={result => handleTimerComplete(result.time, result.phases)}
      />

      {pendingResult && puzzle?.eventId === 'mbld' && (
        <MBLDResultModal
          time={pendingResult.time}
          attempted={puzzle.scramble.length}
          displayValue={session.mbldDisplayValue ?? 'wca'}
          onSubmit={(result: MBLDResult) => void handleResultSubmit(result)}
          onClose={() => setPendingResult(null)}
        />
      )}
    </div>
  );
}
