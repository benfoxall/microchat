import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { CodeInput } from './CodeInput';
import { requestDeviceByName, useSocket } from './puck-stuff';
import { useGradientStyle, assert } from './util';

export const DEVICE_ROUTE = '/→/:id/:name';
export interface IDEVICE_ROUTE {
  id: string;
  name: string;
}

export const DEVICE_INFO_ROUTE = DEVICE_ROUTE + '/info';

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

  const { send, output, error } = useSocket(device);

  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    if (main.current) {
      main.current.scrollTo({
        top: main.current.scrollHeight - main.current.clientHeight,
        behavior: 'smooth',
      });
    }
  }, [output]);

  const style = useGradientStyle(route.params.id);
  const [, setExpanded] = useState(false);

  if (!device) {
    console.log(devices, route);

    const connect = async () => {
      console.log('NAME', route.params.name);
      const device = await requestDeviceByName(route.params.name);
      setDevices((prev) => prev.concat(device));
    };

    return (
      <div className="m-4 p-4 bg-yellow-400 rounded-md shadow-lg">
        <div>
          <Link className="p-4 hover:text-blue-600" to="/">
            ←
          </Link>
          connection lost
        </div>

        <button className="m-4 text-xl hover:text-blue-600" onClick={connect}>
          Reconnect {decodeURIComponent(route.params.name)}{' '}
        </button>
      </div>
    );
  }

  return (
    <section className="h-full flex flex-col">
      <header
        className="bg-black text-white p-4 flex items-center justify-between cursor-pointer focus:outline-none"
        tabIndex={-1}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <Link className="px-4 py-2 hover:text-blue-600" to="/">
          ←
        </Link>

        <div
          className="rounded-full bg-gray-800 w-7 h-7 transition shadow-md"
          style={style}
        ></div>

        <p className="px-4 text-xl font-mono flex-1">{device.name}</p>
      </header>

      {/* {expanded && <div className="bg-gray-800 text-white p-8">more info</div>} */}

      <main
        ref={main}
        className="flex-1 font-mono whitespace-pre-wrap p-4 overflow-scroll"
      >
        {output}
      </main>

      {error && (
        <p className="m-4 bg-red-100 text-red-500 rounded-md p-2">
          {error || 'Error'}
        </p>
      )}

      <footer>
        <CodeInput onChange={send} />
      </footer>
    </section>
  );
};
