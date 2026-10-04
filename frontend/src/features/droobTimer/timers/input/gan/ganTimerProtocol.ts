export const GAN_TIMER_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';

export const GAN_TIMER_TIME_UUID = '0000fff2-0000-1000-8000-00805f9b34fb';

export const GAN_TIMER_STATE_UUID = '0000fff5-0000-1000-8000-00805f9b34fb';

export type GanTimerState =
  'getSet' | 'handsOff' | 'running' | 'stopped' | 'idle' | 'handsOn' | 'finished';

export type GanTimerEvent = {
  state: GanTimerState;
  elapsedMilliseconds?: number;
};

const STATE_BY_CODE: Record<number, GanTimerState | undefined> = {
  0x01: 'getSet',
  0x02: 'handsOff',
  0x03: 'running',
  0x04: 'stopped',
  0x05: 'idle',
  0x06: 'handsOn',
  0x07: 'finished',
};

function calculateCrc(data: Uint8Array): number {
  let crc = 0xffff;

  for (const byte of data) {
    crc ^= byte << 8;

    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc;
}

function parseTimestamp(bytes: Uint8Array, startIndex: number): number | null {
  if (bytes.length < startIndex + 4) {
    return null;
  }

  const minutes = bytes[startIndex];
  const seconds = bytes[startIndex + 1];
  const milliseconds = bytes[startIndex + 2] | (bytes[startIndex + 3] << 8);

  return (minutes * 60 + seconds) * 1000 + milliseconds;
}

export function parseGanTimerStoredTime(value: DataView): number | null {
  const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);

  return parseTimestamp(bytes, 0);
}

export function parseGanTimerPacket(value: DataView): GanTimerEvent | null {
  const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);

  if (bytes.length < 6 || bytes[0] !== 0xfe || bytes[1] !== bytes.length - 2 || bytes[2] !== 0x01) {
    return null;
  }

  const expectedCrc = bytes[bytes.length - 2] | (bytes[bytes.length - 1] << 8);

  const actualCrc = calculateCrc(bytes.subarray(2, bytes.length - 2));

  if (actualCrc !== expectedCrc) {
    return null;
  }

  const state = STATE_BY_CODE[bytes[3]];

  if (state === undefined) {
    return null;
  }

  if (state === 'stopped' || state === 'idle') {
    const elapsedMilliseconds = parseTimestamp(bytes, 4);

    if (elapsedMilliseconds !== null) {
      return {
        state,
        elapsedMilliseconds,
      };
    }
  }

  return { state };
}
