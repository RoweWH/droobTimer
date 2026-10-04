import { useEffect, useRef, useState } from 'react';

import { SketchButton } from '../../../../../components/Sketch';
import type { StopwatchInputProps } from '../../../types';
import { useSpacebar } from '../useSpacebar';
import { GanTimerDriver, ganBluetoothIsSupported } from './ganTimerDriver';
import type { GanTimerEvent } from './ganTimerProtocol';

type ConnectionStatus = 'unsupported' | 'disconnected' | 'connecting' | 'connected' | 'error';

const STATUS_TEXT: Record<ConnectionStatus, string> = {
  unsupported: 'GAN timers require Web Bluetooth',
  disconnected: 'connect GAN timer',
  connecting: 'selecting GAN timer...',
  connected: 'GAN timer connected',
  error: 'retry GAN timer connection',
};

export function Gan({
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
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(() =>
    ganBluetoothIsSupported() ? 'disconnected' : 'unsupported'
  );

  const [deviceName, setDeviceName] = useState<string>();

  const driver = useRef<GanTimerDriver | null>(null);
  const startedAt = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);
  const currentTime = useRef(0);
  const phaseValues = useRef<number[]>([]);
  const isInspectingRef = useRef(isInspecting);

  function stopUpdatingTime() {
    if (animationFrame.current === null) {
      return;
    }

    cancelAnimationFrame(animationFrame.current);
    animationFrame.current = null;
  }

  function updateTime(now: number) {
    if (startedAt.current === null) {
      return;
    }

    const nextTime = now - startedAt.current;

    currentTime.current = nextTime;
    onTimeUpdate(nextTime);

    animationFrame.current = requestAnimationFrame(updateTime);
  }

  function recordPhase() {
    const intermediatePhaseCount = Math.max(phaseCount - 1, 0);

    if (phaseValues.current.length >= intermediatePhaseCount) {
      return;
    }

    phaseValues.current = [...phaseValues.current, currentTime.current];

    onPhaseValuesChange(phaseValues.current);
  }

  function startTimer() {
    if (startedAt.current !== null) {
      return;
    }

    startedAt.current = performance.now();
    currentTime.current = 0;
    phaseValues.current = [];

    onPhaseValuesChange([]);
    onTimeUpdate(0);
    onStart();

    animationFrame.current = requestAnimationFrame(updateTime);
  }

  function stopTimer(finalTime: number) {
    if (startedAt.current === null) {
      return;
    }

    stopUpdatingTime();

    startedAt.current = null;
    currentTime.current = finalTime;

    onTimeUpdate(finalTime);
    onStop(finalTime);
  }

  function cancelTimer() {
    const shouldCancel = startedAt.current !== null || isInspectingRef.current;

    stopUpdatingTime();

    startedAt.current = null;
    currentTime.current = 0;
    phaseValues.current = [];

    onPhaseValuesChange([]);

    if (shouldCancel) {
      onCancel?.();
    }
  }

  function handleSpacebarRelease() {
    if (startedAt.current !== null) {
      recordPhase();
      return;
    }

    if (!inspectionEnabled || isInspecting) {
      return;
    }

    onStartInspection();
  }

  function handleTimerEvent(event: GanTimerEvent) {
    if (event.elapsedMilliseconds !== undefined) {
      currentTime.current = event.elapsedMilliseconds;
      onTimeUpdate(event.elapsedMilliseconds);
    }

    if (event.state === 'running') {
      startTimer();
      return;
    }

    if (event.state === 'stopped' && event.elapsedMilliseconds !== undefined) {
      if (event.elapsedMilliseconds === 0) {
        cancelTimer();
        return;
      }

      stopTimer(event.elapsedMilliseconds);
    }
  }

  useSpacebar({
    onPress: () => {},
    onRelease: handleSpacebarRelease,
  });

  async function connect() {
    if (!ganBluetoothIsSupported() || driver.current !== null) {
      return;
    }

    setConnectionStatus('connecting');

    const nextDriver = new GanTimerDriver({
      onEvent: handleTimerEvent,

      onDisconnected: () => {
        cancelTimer();

        driver.current = null;

        onTimeUpdate(null);
        setDeviceName(undefined);
        setConnectionStatus('disconnected');
      },
    });

    driver.current = nextDriver;

    try {
      const name = await nextDriver.connect();

      setDeviceName(name);
      setConnectionStatus('connected');
    } catch {
      await nextDriver.disconnect();

      driver.current = null;

      onTimeUpdate(null);
      setConnectionStatus('error');
    }
  }

  async function disconnect() {
    const currentDriver = driver.current;

    driver.current = null;

    cancelTimer();
    onTimeUpdate(null);

    await currentDriver?.disconnect();

    setDeviceName(undefined);
    setConnectionStatus(ganBluetoothIsSupported() ? 'disconnected' : 'unsupported');
  }

  useEffect(() => {
    isInspectingRef.current = isInspecting;
  }, [isInspecting]);

  useEffect(() => {
    onTimeUpdate(null);

    return () => {
      stopUpdatingTime();
      void driver.current?.disconnect();
    };
  }, []);

  const canConnect = connectionStatus === 'disconnected' || connectionStatus === 'error';

  return (
    <div className="gan-input">
      {canConnect ? (
        <SketchButton type="button" onClick={connect}>
          {STATUS_TEXT[connectionStatus]}
        </SketchButton>
      ) : connectionStatus === 'connected' ? (
        <>
          <p>{deviceName ?? STATUS_TEXT.connected}</p>

          <SketchButton type="button" onClick={disconnect}>
            disconnect
          </SketchButton>
        </>
      ) : (
        <p>{STATUS_TEXT[connectionStatus]}</p>
      )}
    </div>
  );
}
