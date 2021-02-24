// things from https://www.puck-js.com/puck.js
// MPL 2

import { useCallback, useEffect, useMemo, useState } from 'react';
import { assert, Queue } from './util';

const NORDIC_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NORDIC_TX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const NORDIC_RX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const CHUNKSIZE = 10;

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

type SocketState = 'connecting' | 'connected' | 'closed' | 'error';

export class Socket extends EventTarget {
  state: SocketState = 'connecting';

  constructor(
    private device: BluetoothDevice,
    private queue = new Queue<string>(),
  ) {
    super();

    const setState = (state: SocketState) => {
      this.state = state;
      this.dispatchEvent(new Event('state-changed'));
      console.info(device.name, state);
    };

    (async () => {
      assert(this.device.gatt);

      // not perfect, but might give previous socket time to close
      await new Promise((resolve) => setTimeout(resolve, 500));

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
      await rx.startNotifications();

      setState('connected');

      for await (const value of this.queue) {
        const u8 = new TextEncoder().encode(value);

        for (let i = 0; i < u8.length; i += CHUNKSIZE) {
          await tx.writeValue(u8.subarray(i, i + CHUNKSIZE));

          console.log('Socket: [TX] ↑ ', value);
        }
      }

      rx.removeEventListener('characteristicvaluechanged', onValueChanged);
      await rx.stopNotifications();

      gatt.disconnect();
    })().then(
      () => {
        setState('closed');

        this.dispatchEvent(new CloseEvent('close'));
      },
      (error) => {
        setState('error');
        console.warn(error);
        this.dispatchEvent(new ErrorEvent('error', { error }));
      },
    );
  }

  send(value: string) {
    this.queue.add(value);
  }

  close() {
    this.queue.end();
  }
}

// react bindings

export const useSocket = (device?: BluetoothDevice) => {
  const [queue] = useState(() => new Queue<string>());
  const send = useCallback((value: string) => queue.add(value + '\n'), [queue]);

  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string>('');
  const [state, setState] = useState<SocketState>();

  useEffect(() => {
    setError(null);

    if (!device) return;

    const socket = new Socket(device, queue);

    let cancel = false;

    socket.addEventListener('error', (event) => {
      setError(String((event as ErrorEvent).error) || 'Error');
    });

    socket.addEventListener('close', () => {
      if (cancel) return;
      setError('closed');
    });

    socket.addEventListener('state-changed', () => {
      if (cancel) return;
      setState(socket.state);
    });

    socket.addEventListener('data', (event) => {
      if (cancel) return;
      const payload = (event as MessageEvent<string>).data;
      setOutput((prev) => prev + payload);
    });

    return () => {
      socket.close();
    };
  }, [device]);

  return { error, output, send, state };
};
