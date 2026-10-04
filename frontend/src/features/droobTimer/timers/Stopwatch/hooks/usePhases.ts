import { useRef, useState } from 'react';

import type { Phase } from '../../../types';

export function usePhases(phases: Phase[]) {
  const [activePhases, setActivePhases] = useState<Phase[]>([]);
  const phaseValuesRef = useRef<(number | null)[]>([]);

  function startPhases() {
    const newPhases = phases.map(phase => ({
      ...phase,
      value: null,
    }));

    phaseValuesRef.current = newPhases.map(() => null);
    setActivePhases(newPhases);
  }

  function updatePhaseValues(values: (number | null)[]) {
    const updatedPhases = phases.map((phase, index) => ({
      ...phase,
      value: values[index] ?? null,
    }));

    phaseValuesRef.current = updatedPhases.map(phase => phase.value);
    setActivePhases(updatedPhases);
  }

  function finishPhases(finalTime: number) {
    const completedPhases = phases.map((phase, index) => {
      const isFinalPhase = index === phases.length - 1;

      return {
        ...phase,
        value: isFinalPhase ? finalTime : (phaseValuesRef.current[index] ?? null),
      };
    });

    phaseValuesRef.current = completedPhases.map(phase => phase.value);
    setActivePhases(completedPhases);

    return completedPhases;
  }

  function resetPhases() {
    phaseValuesRef.current = [];
    setActivePhases([]);
  }

  return {
    activePhases,
    startPhases,
    updatePhaseValues,
    finishPhases,
    resetPhases,
  };
}
