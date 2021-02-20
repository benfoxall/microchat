import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
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

  const { socket, rx, send } = useSocket(device);

  const run = () => {};

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
      <main>
        <pre>{rx}</pre>
      </main>
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

    const value = new Socket(device, controller.signal);

    setRx('');

    value.listen((v) => {
      setRx((prev) => prev + v);
    });

    setSocket(value);

    return () => controller.abort();
  }, [device]);

  return { socket, rx, send };
};

// const SocketCtx = React.createContext({ connected: false });

// const Connect: FunctionComponent<{ device?: BluetoothDevice }> = ({
//   device,
//   children,
// }) => {
//   return <>{children}</>;
// };
