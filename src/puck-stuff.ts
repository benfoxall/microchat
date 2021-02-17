// things from https://www.puck-js.com/puck.js
// MPL 2

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

// other things

function assert(value: any): asserts value {
  if (!value) {
    throw new Error('Assertation Error');
  }
}


class Queue<T> implements AsyncIterable<T> {
  private next: Promise<Queue<T>>;
  private resolve: (value: Queue<T>) => void = () => { };

  constructor(readonly value: T | null = null) {
    this.next = new Promise(resolve => this.resolve = resolve)
  }

  add(value: T) {
    const next = new Queue(value)
    this.resolve(next);
    this.resolve = next.resolve;
  }

  end() {
    this.resolve(new Queue())
  }

  async*[Symbol.asyncIterator]() {
    while (true) {
      const current = await this.next;

      this.next = current.next;

      if (current.value === null) break

      yield current.value
    }
  }
}


class Socket {
  private txq = new Queue<string>();
  private listeners = new Set<(value: string) => void>();

  constructor(private device: BluetoothDevice, signal: AbortController['signal']) {

    (async () => {
      assert(this.device.gatt);

      const gatt = await this.device.gatt.connect();

      const service = await gatt.getPrimaryService(NORDIC_SERVICE);

      const tx = await service.getCharacteristic(NORDIC_TX);
      const rx = await service.getCharacteristic(NORDIC_RX);

      const handleRX = (event: any) => {
        const value = new TextDecoder().decode(event.target.value);

        console.log('Socket: [RX] ↓ ', value);

        for (const listener of this.listeners) {
          listener(value);
        }
      }

      rx.addEventListener('characteristicvaluechanged', handleRX);
      rx.startNotifications();

      console.log('socket: connected');

      for await (const value of this.txq) {
        const u8 = new TextEncoder().encode(value);

        console.log('Socket: [TX] ↑ ', value);

        await tx.writeValue(u8);
      }

      rx.removeEventListener('characteristicvaluechanged', handleRX);
      rx.stopNotifications();

      console.log('socket: disconnected');
    })();



    if (signal.aborted) {
      this.disconnect()
    } else {
      signal.addEventListener('abort', () => this.disconnect());
    }
  }

  send(val: string) {
    this.txq.add(val);
  }

  listen(cb: (value: string) => void) {
    this.listeners.add(cb);
  }

  disconnect() {
    this.txq.end()
  }
}


interface REPLOptions {
  signal?: AbortController['signal'];
}

export interface IRepl {
  eval: (code: string) => Promise<string>;
}

export const repl = (device: BluetoothDevice, opts?: REPLOptions): IRepl => {
  const signal = opts?.signal || new AbortController().signal;

  const sock = new Socket(device, signal)

  // todo -- init puck

  return {
    eval(code: string) {
      sock.send(code + '\n');

      return Promise.resolve('Not implemented');
    },
  };
};
