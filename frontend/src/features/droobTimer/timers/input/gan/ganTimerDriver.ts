import {
  GAN_TIMER_SERVICE_UUID,
  GAN_TIMER_STATE_UUID,
  GAN_TIMER_TIME_UUID,
  parseGanTimerPacket,
  parseGanTimerStoredTime,
  type GanTimerEvent,
} from './ganTimerProtocol';

type BluetoothCharacteristic = EventTarget & {
  startNotifications(): Promise<BluetoothCharacteristic>;
  stopNotifications(): Promise<BluetoothCharacteristic>;
  readValue(): Promise<DataView>;
  value?: DataView;
};

type BluetoothService = {
  getCharacteristic(uuid: string): Promise<BluetoothCharacteristic>;
};

type BluetoothServer = {
  connected: boolean;
  getPrimaryService(uuid: string): Promise<BluetoothService>;
  disconnect(): void;
};

type BluetoothDevice = EventTarget & {
  name?: string;
  gatt?: {
    connect(): Promise<BluetoothServer>;
  };
};

type BluetoothNavigator = Navigator & {
  bluetooth?: {
    requestDevice(options: {
      filters: Array<{ namePrefix: string }>;
      optionalServices: string[];
    }): Promise<BluetoothDevice>;
  };
};

type GanTimerDriverOptions = {
  onEvent: (event: GanTimerEvent) => void;
  onDisconnected: () => void;
};

export function ganBluetoothIsSupported(): boolean {
  return (navigator as BluetoothNavigator).bluetooth !== undefined;
}

export class GanTimerDriver {
  private device: BluetoothDevice | null = null;
  private server: BluetoothServer | null = null;
  private stateCharacteristic: BluetoothCharacteristic | null = null;

  private options: GanTimerDriverOptions;

  constructor(options: GanTimerDriverOptions) {
    this.options = options;
  }

  async connect(): Promise<string | undefined> {
    const bluetooth = (navigator as BluetoothNavigator).bluetooth;

    if (bluetooth === undefined) {
      throw new Error('Web Bluetooth is not supported by this browser.');
    }

    this.device = await bluetooth.requestDevice({
      filters: [{ namePrefix: 'GAN' }],
      optionalServices: [GAN_TIMER_SERVICE_UUID],
    });

    if (this.device.gatt === undefined) {
      throw new Error('The selected device does not expose Bluetooth services.');
    }

    this.device.addEventListener('gattserverdisconnected', this.handleDisconnected);

    this.server = await this.device.gatt.connect();

    const service = await this.server.getPrimaryService(GAN_TIMER_SERVICE_UUID);

    this.stateCharacteristic = await service.getCharacteristic(GAN_TIMER_STATE_UUID);

    this.stateCharacteristic.addEventListener(
      'characteristicvaluechanged',
      this.handleNotification
    );

    await this.stateCharacteristic.startNotifications();

    const timeCharacteristic = await service.getCharacteristic(GAN_TIMER_TIME_UUID);

    const storedTimes = await timeCharacteristic.readValue();

    const currentTime = parseGanTimerStoredTime(storedTimes);

    if (currentTime !== null) {
      this.options.onEvent({
        state: 'idle',
        elapsedMilliseconds: currentTime,
      });
    }

    return this.device.name;
  }

  async disconnect(): Promise<void> {
    const stateCharacteristic = this.stateCharacteristic;

    this.stateCharacteristic = null;

    if (stateCharacteristic !== null) {
      stateCharacteristic.removeEventListener(
        'characteristicvaluechanged',
        this.handleNotification
      );

      try {
        await stateCharacteristic.stopNotifications();
      } catch {
        // The timer may already be disconnected.
      }
    }

    if (this.device !== null) {
      this.device.removeEventListener('gattserverdisconnected', this.handleDisconnected);
    }

    if (this.server?.connected === true) {
      this.server.disconnect();
    }

    this.server = null;
    this.device = null;
  }

  private handleNotification = (event: Event): void => {
    const characteristic = event.target as BluetoothCharacteristic | null;

    const value = characteristic?.value;

    if (value === undefined) {
      return;
    }

    const timerEvent = parseGanTimerPacket(value);

    if (timerEvent !== null) {
      this.options.onEvent(timerEvent);
    }
  };

  private handleDisconnected = (): void => {
    this.stateCharacteristic = null;
    this.server = null;
    this.device = null;

    this.options.onDisconnected();
  };
}
