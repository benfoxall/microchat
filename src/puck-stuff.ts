// things from https://www.puck-js.com/puck.js
// MPL 2

import { assert, Queue } from './util';

const NORDIC_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NORDIC_TX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const NORDIC_RX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const CHUNKSIZE = 16;

export function requestDevice() {
  return navigator.bluetooth.requestDevice({
    filters: [
      { namePrefix: 'Puck.js' },
      { namePrefix: 'Pixl.js' },
      { namePrefix: 'MDBT42Q' },
      { namePrefix: 'RuuviTag' },
      { namePrefix: 'iTracker' },
      { namePrefix: 'Thingy' },
      { namePrefix: 'Espruino' },
      { services: [NORDIC_SERVICE] },
    ],
    optionalServices: [NORDIC_SERVICE],
  });
}

export function requestDeviceByName(name: string) {
  return navigator.bluetooth.requestDevice({
    filters: [{ name }],
    optionalServices: [NORDIC_SERVICE],
  });
}

// other things

export class Socket extends EventTarget {
  #messageQueue = new Queue<string>();

  constructor(private device: BluetoothDevice) {
    super();

    (async () => {
      assert(this.device.gatt);

      // FIXME: This may throw no longer in range
      const gatt = await this.device.gatt.connect();

      const service = await gatt.getPrimaryService(NORDIC_SERVICE);

      const tx = await service.getCharacteristic(NORDIC_TX);
      const rx = await service.getCharacteristic(NORDIC_RX);

      const onValueChanged = (event: any) => {
        const data = new TextDecoder().decode(event.target.value);

        console.log('Socket: [RX] ↓ ', data);

        this.dispatchEvent(new MessageEvent('data', { data }));
      };

      rx.addEventListener('characteristicvaluechanged', onValueChanged);
      rx.startNotifications();

      console.log('socket: connected');

      for await (const value of this.#messageQueue) {
        const u8 = new TextEncoder().encode(value);

        console.log('Socket: [TX] ↑ ', value);

        await tx.writeValue(u8);
      }

      rx.removeEventListener('characteristicvaluechanged', onValueChanged);
      rx.stopNotifications();

      console.log('socket: disconnected');
    })();
  }

  send(value: string) {
    for (let i = 0; i < value.length; i += CHUNKSIZE) {
      this.#messageQueue.add(value.substring(i, i + CHUNKSIZE));
    }
  }

  close() {
    this.#messageQueue.end();
  }
}
