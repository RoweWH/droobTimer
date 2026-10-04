import { useEffect, useRef } from 'react';

import type { StopwatchInputProps } from '../../../types';
import { useSpacebar } from '../useSpacebar';

export function Spacebar({
  status,
  inspectionEnabled,
  isInspecting,
  phaseCount,
  onPhaseValuesChange,
  onStartInspection,
  onStart,
  onTimeUpdate,
  onStop,
}: StopwatchInputProps) {
  const startedAt = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);
  const phaseValues = useRef<number[]>([]);

  function stopUpdatingTime() {
    if (animationFrame.current === null) {
      return;
    }

    cancelAnimationFrame(animationFrame.current);
    animationFrame.current = null;
  }

  function getCurrentTime() {
    if (startedAt.current === null) {
      return null;
    }

    return performance.now() - startedAt.current;
  }

  function updateTime(now: number) {
    if (startedAt.current === null) {
      return;
    }

    onTimeUpdate(now - startedAt.current);
    animationFrame.current = requestAnimationFrame(updateTime);
  }

  function startTimer() {
    if (startedAt.current !== null) {
      return;
    }

    startedAt.current = performance.now();
    phaseValues.current = [];

    onPhaseValuesChange([]);
    onTimeUpdate(0);
    onStart();

    animationFrame.current = requestAnimationFrame(updateTime);
  }

  function recordPhase() {
    const currentTime = getCurrentTime();
    const intermediatePhaseCount = Math.max(phaseCount - 1, 0);

    if (currentTime === null || phaseValues.current.length >= intermediatePhaseCount) {
      return;
    }

    phaseValues.current = [...phaseValues.current, currentTime];

    onPhaseValuesChange(phaseValues.current);
  }

  function stopTimer() {
    const finalTime = getCurrentTime();

    if (finalTime === null) {
      return;
    }

    stopUpdatingTime();
    startedAt.current = null;

    onTimeUpdate(finalTime);
    onStop(finalTime);
  }

  function handleRelease() {
    if (status === 'running') {
      const intermediatePhaseCount = Math.max(phaseCount - 1, 0);

      if (phaseValues.current.length < intermediatePhaseCount) {
        recordPhase();
        return;
      }

      stopTimer();
      return;
    }

    if (!inspectionEnabled) {
      startTimer();
      return;
    }

    if (!isInspecting) {
      onStartInspection();
      return;
    }

    startTimer();
  }

  useSpacebar({
    onPress: () => {},
    onRelease: handleRelease,
  });

  useEffect(() => {
    onTimeUpdate(0);

    return stopUpdatingTime;
  }, []);

  return null;
}
