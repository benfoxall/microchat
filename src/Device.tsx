import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { CodeInput } from './CodeInput';
import { Socket, assert, requestDeviceByName, LSocket } from './puck-stuff';

export const DEVICE_ROUTE = '/→/:id/:name';
export interface IDEVICE_ROUTE {
  id: string;
  name: string;
}

interface IProps {
  devices: BluetoothDevice[];
  setDevices: Dispatch<SetStateAction<BluetoothDevice[]>>;
}

export const Device: FunctionComponent<IProps> = ({ devices, setDevices }) => {
  const route = useRouteMatch<IDEVICE_ROUTE>(DEVICE_ROUTE);

  assert(route);

  // todo: request if not connected
  const device = devices.find(
    (device) => device.id === decodeURIComponent(route.params.id),
  );

  const { rx, send } = useSocket(device);

  if (!device) {
    console.log(devices, route);

    const connect = async () => {
      console.log('NAME', route.params.name);
      const device = await requestDeviceByName(route.params.name);
      setDevices((prev) => prev.concat(device));
    };

    return (
      <div>
        <Link to="/">Back</Link>
        <h2>{decodeURIComponent(route.params.name)}</h2>
        <h3>not connected</h3>
        <button onClick={connect}>Connect</button>
      </div>
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
      const value = new LSocket(device, controller.signal);

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
