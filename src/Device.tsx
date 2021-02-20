import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { CodeInput } from './CodeInput';
import { Socket } from './puck-stuff';

export const DEVICE_ROUTE = '/→/:deviceId';
export interface IDEVICE_ROUTE {
  deviceId: string;
}

interface IProps {
  devices: BluetoothDevice[];
}

export const Device: FunctionComponent<IProps> = ({ devices }) => {
  const route = useRouteMatch<IDEVICE_ROUTE>(DEVICE_ROUTE);

  // todo: request if not connected
  const device = devices.find(
    (device) => btoa(device.id) === route?.params.deviceId,
  );

  const { rx, send } = useSocket(device);

  if (!device) {
    console.log(devices, route);
    return (
      <h1>
        <Link to="/">Back</Link>
        no device
      </h1>
    );
  }

  return (
    <section className="Device">
      <h3>
        {' '}
        <Link to="/">Back</Link> → {device.name}
      </h3>
      <main>{rx}</main>
      <footer>
        <CodeInput onChange={send} />
      </footer>
    </section>
  );
};

const useSocket = (device?: BluetoothDevice) => {
  const [socket, setSocket] = useState<Socket>();
  const [rx, setRx] = useState('');
  const send = useCallback(
    (value: string) => {
      socket?.send(value + '\n');
    },
    [socket],
  );

  useEffect(() => {
    if (!device) return;

    const controller = new AbortController();

    setRx('');

    const t = setTimeout(() => {
      const value = new Socket(device, controller.signal);

      value.listen((v) => {
        setRx((prev) => prev + v);
      });

      setSocket(value);
    }, 300);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [device]);

  return { socket, rx, send };
};
