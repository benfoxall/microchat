// things from https://www.puck-js.com/puck.js
// MPL 2

import { useCallback, useEffect, useRef, useState } from 'react';
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

  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string>('');
  const [state, setState] = useState<SocketState>();

  const [sock, setSock] = useState<Socket>();

  useEffect(() => {
    if (device) {
      const socket = new Socket(device);

      setError(null);
      setSock(socket);

      return () => socket.close();

    } else {
      setSock(undefined)
    }
  }, [device]);


  const send = useCallback((value: string) => sock?.send(value + '\n'), [sock]);

  useListener(sock, 'error', (event: ErrorEvent) => {
    setError(String(event.error) || 'Error');
  })

  useListener(sock, 'close', () => {
    setError('closed');
  })

  useListener(sock, 'state-changed', () => {
    setState(sock!.state);
  })

  useListener(sock, 'data', (event: MessageEvent<string>) => {
    setOutput((prev) => prev + event.data);
  })



  return { error, output, send, state };
};



const useListener = <T extends EventTarget>(target: T | undefined, name: string, callback: (event: any) => void) => {
  const fn = useRef(callback);
  fn.current = callback;

  useEffect(() => {
    if (target) {
      target.addEventListener(name, handle)

      return () => target.removeEventListener(name, handle)

      function handle(event: any) {
        fn.current(event)
      }
    }
  }, [target, name]);

}