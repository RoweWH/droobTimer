import { useEffect, useRef, useState } from 'react';

import { SketchButton } from '../../../../../components/Sketch';
import type { StopwatchInputProps } from '../../../types';
import { useSpacebar } from '../useSpacebar';
import { PacketStatus, Stackmat as StackmatDecoder, type Packet } from './stackmatDecoder';

type ConnectionStatus = 'disconnected' | 'waiting' | 'connected' | 'error';

const STATUS_TEXT: Record<ConnectionStatus, string> = {
  disconnected: 'connect stackmat',
  waiting: 'waiting for stackmat signal...',
  connected: 'stackmat connected',
  error: 'retry stackmat connection',
};

export function Stackmat({
  inspectionEnabled,
  isInspecting,
  phaseCount,
  onPhaseValuesChange,
  onStartInspection,
  onStart,
  onTimeUpdate,
  onStop,
  onCancel,
}: StopwatchInputProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  const decoder = useRef<StackmatDecoder | null>(null);

  const wasRunning = useRef(false);
  const currentTime = useRef(0);
  const phaseValues = useRef<number[]>([]);

  const isInspectingRef = useRef(isInspecting);
  const phaseCountRef = useRef(phaseCount);

  const onPhaseValuesChangeRef = useRef(onPhaseValuesChange);
  const onStartInspectionRef = useRef(onStartInspection);
  const onStartRef = useRef(onStart);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onStopRef = useRef(onStop);
  const onCancelRef = useRef(onCancel);

  function recordPhase() {
    const intermediatePhaseCount = Math.max(phaseCountRef.current - 1, 0);

    if (phaseValues.current.length >= intermediatePhaseCount) {
      return;
    }

    phaseValues.current = [...phaseValues.current, currentTime.current];

    onPhaseValuesChangeRef.current(phaseValues.current);
  }

  function handleSpacebarRelease() {
    if (wasRunning.current) {
      recordPhase();
      return;
    }

    if (!inspectionEnabled || isInspectingRef.current) {
      return;
    }

    onStartInspectionRef.current();
  }

  function handlePacket(packet: Packet) {
    const time = packet.timeInMilliseconds;
    const isRunning = packet.status === PacketStatus.RUNNING;

    currentTime.current = time;

    onTimeUpdateRef.current(time);

    if (isRunning && !wasRunning.current) {
      phaseValues.current = [];

      onPhaseValuesChangeRef.current([]);
      onStartRef.current();
    }

    if (!isRunning && wasRunning.current) {
      if (time > 0) {
        onStopRef.current(time);
      } else {
        phaseValues.current = [];

        onPhaseValuesChangeRef.current([]);
        onCancelRef.current?.();
      }
    }

    wasRunning.current = isRunning;
  }

  useSpacebar({
    onPress: () => {},
    onRelease: handleSpacebarRelease,
  });

  async function connect() {
    if (decoder.current !== null) {
      return;
    }

    setConnectionStatus('waiting');

    const nextDecoder = new StackmatDecoder();

    nextDecoder.on('timerConnected', () => {
      setConnectionStatus('connected');
    });

    nextDecoder.on('timerDisconnected', () => {
      if (wasRunning.current || isInspectingRef.current) {
        phaseValues.current = [];

        onPhaseValuesChangeRef.current([]);
        onCancelRef.current?.();
      }

      wasRunning.current = false;
      currentTime.current = 0;

      onTimeUpdateRef.current(null);

      setConnectionStatus('waiting');
    });

    nextDecoder.on('packetReceived', handlePacket);

    decoder.current = nextDecoder;

    try {
      await nextDecoder.start();
    } catch {
      nextDecoder.destroy();
      decoder.current = null;

      onTimeUpdateRef.current(null);

      setConnectionStatus('error');
    }
  }

  useEffect(() => {
    isInspectingRef.current = isInspecting;
  }, [isInspecting]);

  useEffect(() => {
    phaseCountRef.current = phaseCount;
  }, [phaseCount]);

  useEffect(() => {
    onPhaseValuesChangeRef.current = onPhaseValuesChange;
    onStartInspectionRef.current = onStartInspection;
    onStartRef.current = onStart;
    onTimeUpdateRef.current = onTimeUpdate;
    onStopRef.current = onStop;
    onCancelRef.current = onCancel;
  }, [onPhaseValuesChange, onStartInspection, onStart, onTimeUpdate, onStop, onCancel]);

  useEffect(() => {
    onTimeUpdateRef.current(null);

    return () => {
      decoder.current?.destroy();
    };
  }, []);

  const canConnect = connectionStatus === 'disconnected' || connectionStatus === 'error';

  return (
    <div className="stackmat-input">
      {canConnect ? (
        <SketchButton type="button" onClick={connect}>
          {STATUS_TEXT[connectionStatus]}
        </SketchButton>
      ) : (
        <p>{STATUS_TEXT[connectionStatus]}</p>
      )}
    </div>
  );
}
