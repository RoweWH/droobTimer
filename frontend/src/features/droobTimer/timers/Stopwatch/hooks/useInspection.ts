import { useEffect, useRef, useState } from 'react';
import type { InspectionPenalty } from '../../../types';

export function useInspection() {
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionTime, setInspectionTime] = useState(0);
  const [inspectionPenalty, setInspectionPenalty] = useState<InspectionPenalty>('none');

  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInspecting) {
      return;
    }

    const interval = window.setInterval(() => {
      if (startedAtRef.current === null) {
        return;
      }

      setInspectionTime((performance.now() - startedAtRef.current) / 1000);
    }, 10);

    return () => {
      window.clearInterval(interval);
    };
  }, [isInspecting]);

  function startInspection() {
    startedAtRef.current = performance.now();

    setInspectionTime(0);
    setInspectionPenalty('none');
    setIsInspecting(true);
  }

  function endInspection() {
    if (startedAtRef.current === null) {
      return;
    }

    const finalInspectionTime = (performance.now() - startedAtRef.current) / 1000;

    setInspectionTime(finalInspectionTime);
    setIsInspecting(false);
    startedAtRef.current = null;

    if (finalInspectionTime > 17) {
      setInspectionPenalty('dnf');
    } else if (finalInspectionTime > 15) {
      setInspectionPenalty('plusTwo');
    } else {
      setInspectionPenalty('none');
    }
  }

  function resetInspection() {
    startedAtRef.current = null;

    setIsInspecting(false);
    setInspectionTime(0);
    setInspectionPenalty('none');
  }

  return {
    isInspecting,
    inspectionTime,
    inspectionPenalty,
    startInspection,
    endInspection,
    resetInspection,
  };
}
