export const PacketStatus = {
  IDLE: 'I',
  STARTING: 'A',
  RUNNING: ' ',
  STOPPED: 'S',
  LEFT_HAND: 'L',
  RIGHT_HAND: 'R',
  BOTH_HANDS: 'C',
  INVALID: 'X',
} as const;

export type PacketStatus = (typeof PacketStatus)[keyof typeof PacketStatus];

export type Packet = {
  isValid: boolean;
  status: PacketStatus;
  stringDigits: string[];
  timeInMilliseconds: number;
  timeAsString: string;
  isLeftHandDown: boolean;
  isRightHandDown: boolean;
  areBothHandsDown: boolean;
};

type StackmatEvent = 'packetReceived' | 'timerConnected' | 'timerDisconnected';

type EventPayloadMap = {
  packetReceived: Packet;
  timerConnected: Packet;
  timerDisconnected: Packet;
};

type EventHandler<T extends StackmatEvent> = (packet: EventPayloadMap[T]) => void;

type WorkletMessage = {
  type: 'chunk';
  data: Float32Array;
};

const CONNECTION_TIMEOUT_MS = 1000;
const CONNECTION_WATCH_INTERVAL_MS = 100;

function readBufferSize(): number {
  const defaultValue = 1024;

  const environmentValue = Number(import.meta.env.VITE_STACKMAT_BUFFER_SIZE ?? '');

  if (Number.isFinite(environmentValue) && environmentValue >= 256) {
    return Math.floor(environmentValue);
  }

  const storedValue = Number(window.localStorage.getItem('droobtimer:stackmat-buffer-size') ?? '');

  if (Number.isFinite(storedValue) && storedValue >= 256) {
    return Math.floor(storedValue);
  }

  return defaultValue;
}

function createWorkletModuleUrl(): string {
  const source = `
    class StackmatWorkletProcessor extends AudioWorkletProcessor {
      constructor(options) {
        super();

        const configuredBufferSize = Number(
          options?.processorOptions?.bufferSize ?? 1024
        );

        this.bufferSize =
          Number.isFinite(configuredBufferSize) &&
          configuredBufferSize > 0
            ? Math.floor(configuredBufferSize)
            : 1024;

        this.chunkBuffer = new Float32Array(this.bufferSize);
        this.offset = 0;
      }

      process(inputs) {
        const input = inputs[0];
        const inputChannel = input?.[0];

        if (!inputChannel || inputChannel.length === 0) {
          return true;
        }

        let inputOffset = 0;

        while (inputOffset < inputChannel.length) {
          const remainingInChunk =
            this.bufferSize - this.offset;

          const available =
            inputChannel.length - inputOffset;

          const copyLength = Math.min(
            remainingInChunk,
            available
          );

          this.chunkBuffer.set(
            inputChannel.subarray(
              inputOffset,
              inputOffset + copyLength
            ),
            this.offset
          );

          this.offset += copyLength;
          inputOffset += copyLength;

          if (this.offset >= this.bufferSize) {
            this.port.postMessage({
              type: 'chunk',
              data: this.chunkBuffer,
            });

            this.chunkBuffer =
              new Float32Array(this.bufferSize);

            this.offset = 0;
          }
        }

        return true;
      }
    }

    registerProcessor(
      'stackmat-processor',
      StackmatWorkletProcessor
    );
  `;

  const blob = new Blob([source], {
    type: 'application/javascript',
  });

  return URL.createObjectURL(blob);
}

function isPacketStatusCharCode(charCode: number): boolean {
  const character = String.fromCharCode(charCode);

  return 'IA SLRC'.includes(character);
}

function isNumberCharCode(charCode: number): boolean {
  const character = String.fromCharCode(charCode);

  return '0123456789'.includes(character);
}

function isChecksumValid(checksum: number, digitCharCodes: number[]): boolean {
  const digitTotal = digitCharCodes
    .map(charCode => Number(String.fromCharCode(charCode)))
    .reduce((total, digit) => total + digit, 0);

  return checksum === digitTotal + 64;
}

class PacketAbstract implements Packet {
  isValid: boolean;
  status: PacketStatus;
  stringDigits: string[];
  timeInMilliseconds: number;

  constructor(
    isValid: boolean,
    status: PacketStatus = PacketStatus.INVALID,
    stringDigits: string[] = [],
    timeInMilliseconds = 0
  ) {
    this.isValid = isValid;
    this.status = status;
    this.stringDigits = stringDigits;
    this.timeInMilliseconds = timeInMilliseconds;
  }

  get timeAsString(): string {
    const minutes = this.stringDigits.slice(0, 1);
    const seconds = this.stringDigits.slice(1, 3).join('');
    const fraction = this.stringDigits.slice(3).join('');

    return `${minutes}:${seconds}.${fraction}`;
  }

  get isLeftHandDown(): boolean {
    return (
      this.status === PacketStatus.LEFT_HAND ||
      this.status === PacketStatus.BOTH_HANDS ||
      this.status === PacketStatus.STARTING
    );
  }

  get isRightHandDown(): boolean {
    return (
      this.status === PacketStatus.RIGHT_HAND ||
      this.status === PacketStatus.BOTH_HANDS ||
      this.status === PacketStatus.STARTING
    );
  }

  get areBothHandsDown(): boolean {
    return this.status === PacketStatus.BOTH_HANDS || this.status === PacketStatus.STARTING;
  }
}

class PacketInvalid extends PacketAbstract {
  constructor() {
    super(false);
  }
}

class PacketGen3 extends PacketAbstract {
  static isValid(rawData: number[]): boolean {
    return (
      rawData.length === 9 &&
      isPacketStatusCharCode(rawData[0]) &&
      isNumberCharCode(rawData[1]) &&
      isNumberCharCode(rawData[2]) &&
      isNumberCharCode(rawData[3]) &&
      isNumberCharCode(rawData[4]) &&
      isNumberCharCode(rawData[5]) &&
      isChecksumValid(rawData[6], rawData.slice(1, 6)) &&
      rawData[7] === 10 &&
      rawData[8] === 13
    );
  }

  constructor(rawData: number[]) {
    if (!PacketGen3.isValid(rawData)) {
      super(false);
      return;
    }

    const status = String.fromCharCode(rawData[0]) as PacketStatus;

    const stringDigits = rawData.slice(1, 6).map(charCode => String.fromCharCode(charCode));

    const minutes = Number(stringDigits[0]);
    const seconds = Number(stringDigits.slice(1, 3).join(''));

    const milliseconds = Number(`${stringDigits.slice(3).join('')}0`);

    const timeInMilliseconds = minutes * 60_000 + seconds * 1_000 + milliseconds;

    super(true, status, stringDigits, timeInMilliseconds);
  }
}

class PacketGen4 extends PacketAbstract {
  static isValid(rawData: number[]): boolean {
    return (
      rawData.length === 10 &&
      isPacketStatusCharCode(rawData[0]) &&
      isNumberCharCode(rawData[1]) &&
      isNumberCharCode(rawData[2]) &&
      isNumberCharCode(rawData[3]) &&
      isNumberCharCode(rawData[4]) &&
      isNumberCharCode(rawData[5]) &&
      isNumberCharCode(rawData[6]) &&
      isChecksumValid(rawData[7], rawData.slice(1, 7)) &&
      rawData[8] === 10 &&
      rawData[9] === 13
    );
  }

  constructor(rawData: number[]) {
    if (!PacketGen4.isValid(rawData)) {
      super(false);
      return;
    }

    const status = String.fromCharCode(rawData[0]) as PacketStatus;

    const stringDigits = rawData.slice(1, 7).map(charCode => String.fromCharCode(charCode));

    const minutes = Number(stringDigits[0]);
    const seconds = Number(stringDigits.slice(1, 3).join(''));

    const milliseconds = Number(stringDigits.slice(3).join(''));

    const timeInMilliseconds = minutes * 60_000 + seconds * 1_000 + milliseconds;

    super(true, status, stringDigits, timeInMilliseconds);
  }
}

function decodeByte(bits: number[], offset: number): number {
  let result = 0;

  for (let index = 0; index < 8; index++) {
    result += bits[offset + index] << index;
  }

  return result;
}

function getPacket(bits: number[]): Packet {
  const bytes: number[] = [];

  for (let index = 0; index <= 9; index++) {
    bytes.push(decodeByte(bits, index * 10));
  }

  const gen4Packet = new PacketGen4(bytes);

  if (gen4Packet.isValid) {
    return gen4Packet;
  }

  return new PacketGen3(bytes.slice(0, -1));
}

type RunLengthBit = {
  bit: 0 | 1;
  length: number;
};

function runLengthEncode(bits: number[]): RunLengthBit[] {
  const result: RunLengthBit[] = [];

  for (const bit of bits) {
    const lastEntry = result.at(-1);

    if (!lastEntry || lastEntry.bit !== bit) {
      result.push({
        bit: bit as 0 | 1,
        length: 1,
      });

      continue;
    }

    lastEntry.length++;
  }

  return result;
}

class SignalDecoder {
  private ticksPerBit: number;
  private onPacket: (packet: Packet) => void;
  private rollingBits: number[] = [];
  private maximumRollingBits: number;

  private lastPacketSignature: string | null = null;
  private lastPacketTime = 0;

  constructor(sampleRate: number, onPacket: (packet: Packet) => void) {
    this.ticksPerBit = sampleRate / 1200;
    this.onPacket = onPacket;

    this.maximumRollingBits = Math.max(Math.ceil(sampleRate * 0.5), 10_240);
  }

  decode(data: Float32Array): void {
    for (const signal of data) {
      this.rollingBits.push(signal <= 0 ? 1 : 0);
    }

    if (this.rollingBits.length > this.maximumRollingBits) {
      const extraBits = this.rollingBits.length - this.maximumRollingBits;

      this.rollingBits.splice(0, extraBits);
    }

    const startIndex = this.findLatestSignalStart(this.rollingBits);

    if (startIndex === undefined) {
      return;
    }

    const encodedSignal = runLengthEncode(this.rollingBits.slice(startIndex));

    const bits = this.expandSignal(encodedSignal);

    if (bits.length < 100) {
      return;
    }

    const packet = getPacket(bits.slice(1));

    if (!packet.isValid) {
      return;
    }

    const signature = `${packet.status}:${packet.timeInMilliseconds}`;

    const now = performance.now();

    if (signature === this.lastPacketSignature && now - this.lastPacketTime < 30) {
      return;
    }

    this.lastPacketSignature = signature;
    this.lastPacketTime = now;

    this.onPacket(packet);
  }

  private findLatestSignalStart(bits: number[]): number | undefined {
    let consecutiveOnes = 0;
    let waitingForZero = false;
    let latestStartIndex: number | undefined;

    for (let index = 0; index < bits.length; index++) {
      if (bits[index] === 1) {
        consecutiveOnes++;

        if (consecutiveOnes > 9 * this.ticksPerBit) {
          waitingForZero = true;
        }

        continue;
      }

      consecutiveOnes = 0;

      if (waitingForZero) {
        latestStartIndex = index;
        waitingForZero = false;
      }
    }

    return latestStartIndex;
  }

  private expandSignal(encodedSignal: RunLengthBit[]): number[] {
    return encodedSignal.flatMap(entry => {
      const length = Math.round(entry.length / this.ticksPerBit);

      return Array<number>(length).fill(entry.bit);
    });
  }
}

class AudioProcessor {
  private stream?: MediaStream;
  private context?: AudioContext;
  private source?: MediaStreamAudioSourceNode;
  private workletNode?: AudioWorkletNode;
  private workletUrl?: string;

  private onPacket: (packet: Packet) => void;
  private bufferSize: number;

  constructor(onPacket: (packet: Packet) => void, bufferSize: number) {
    this.onPacket = onPacket;
    this.bufferSize = bufferSize;
  }

  async start(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Audio input is not supported by this browser.');
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    this.context = new AudioContext();

    this.source = this.context.createMediaStreamSource(this.stream);

    const signalDecoder = new SignalDecoder(this.context.sampleRate, this.onPacket);

    this.workletUrl = createWorkletModuleUrl();

    await this.context.audioWorklet.addModule(this.workletUrl);

    this.workletNode = new AudioWorkletNode(this.context, 'stackmat-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      processorOptions: {
        bufferSize: this.bufferSize,
      },
    });

    this.workletNode.port.onmessage = (event: MessageEvent<WorkletMessage>) => {
      if (event.data.type === 'chunk') {
        signalDecoder.decode(event.data.data);
      }
    };

    this.source.connect(this.workletNode);

    this.workletNode.connect(this.context.destination);
  }

  stop(): void {
    if (this.workletNode) {
      this.workletNode.port.onmessage = null;
      this.workletNode.disconnect();
      this.workletNode = undefined;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = undefined;
    }

    if (this.context) {
      void this.context.close();
      this.context = undefined;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());

      this.stream = undefined;
    }

    if (this.workletUrl) {
      URL.revokeObjectURL(this.workletUrl);
      this.workletUrl = undefined;
    }
  }
}

class TimerEventManager {
  private handlers = new Map<StackmatEvent, Array<(packet: Packet) => void>>();

  private connected = false;
  private lastPacketReceivedAt = 0;
  private lastPacket: Packet = new PacketInvalid();

  private intervalId: number;

  constructor() {
    this.intervalId = window.setInterval(() => {
      this.checkConnection();
    }, CONNECTION_WATCH_INTERVAL_MS);
  }

  on<T extends StackmatEvent>(event: T, callback: EventHandler<T>): void {
    const handlers = this.handlers.get(event) ?? [];

    handlers.push(callback as (packet: Packet) => void);

    this.handlers.set(event, handlers);
  }

  off(event?: StackmatEvent): void {
    if (event === undefined) {
      this.handlers.clear();
      return;
    }

    this.handlers.delete(event);
  }

  receivePacket(packet: Packet): void {
    this.lastPacketReceivedAt = Date.now();
    this.lastPacket = packet;

    this.fire('packetReceived', packet);
  }

  destroy(): void {
    window.clearInterval(this.intervalId);
    this.handlers.clear();
  }

  private checkConnection(): void {
    if (this.lastPacketReceivedAt === 0) {
      return;
    }

    const millisecondsSinceLastPacket = Date.now() - this.lastPacketReceivedAt;

    if (this.connected && millisecondsSinceLastPacket > CONNECTION_TIMEOUT_MS) {
      this.connected = false;

      this.fire('timerDisconnected', this.lastPacket);

      return;
    }

    if (!this.connected && millisecondsSinceLastPacket <= CONNECTION_TIMEOUT_MS) {
      this.connected = true;

      this.fire('timerConnected', this.lastPacket);
    }
  }

  private fire(event: StackmatEvent, packet: Packet): void {
    const handlers = this.handlers.get(event) ?? [];

    handlers.forEach(handler => {
      handler(packet);
    });
  }
}

export class Stackmat {
  private eventManager = new TimerEventManager();
  private audioProcessor?: AudioProcessor;
  private bufferSize = readBufferSize();

  on<T extends StackmatEvent>(event: T, callback: EventHandler<T>): void {
    this.eventManager.on(event, callback);
  }

  off(event?: StackmatEvent): void {
    this.eventManager.off(event);
  }

  async start(): Promise<void> {
    this.stop();

    this.audioProcessor = new AudioProcessor(packet => {
      this.eventManager.receivePacket(packet);
    }, this.bufferSize);

    try {
      await this.audioProcessor.start();
    } catch (error) {
      this.audioProcessor.stop();
      this.audioProcessor = undefined;

      throw error;
    }
  }

  stop(): void {
    this.audioProcessor?.stop();
    this.audioProcessor = undefined;
  }

  destroy(): void {
    this.stop();
    this.eventManager.destroy();
  }
}
