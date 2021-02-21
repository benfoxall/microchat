import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  SyntheticEvent,
} from 'react';
import { requestDevice } from './puck-stuff';
import { toast } from 'react-toastify';
import { generatePath, NavLink } from 'react-router-dom';
import { DEVICE_ROUTE } from './Device';
import { useGradientStyle } from './util';

interface IDevicesProps {
  value: BluetoothDevice[];
  onChange: Dispatch<SetStateAction<BluetoothDevice[]>>;
}

export const DeviceList: FunctionComponent<IDevicesProps> = ({
  value,
  onChange,
}) => {
  const addDevice = async () => {
    try {
      const device = await requestDevice();

      if (value.includes(device)) {
        toast.warn('already added');
      } else {
        onChange((prev) => prev.concat(device));
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const remove = (device: BluetoothDevice) => (e: SyntheticEvent) => {
    e.preventDefault();
    onChange((devices) => devices.filter((target) => device !== target));
  };

  return (
    <section>
      <ul>
        {value.map((device) => (
          <DeviceListItem key={device.id} device={device} />
        ))}
      </ul>
      <button
        className="rounded-full bg-purple-800 w-12 h-12 hover:bg-purple-700 transition shadow-lg fixed bottom-4 left-1/2 transform -translate-x-1/2 text-white"
        onClick={addDevice}
      >
        +
      </button>
    </section>
  );
};

const DeviceListItem: FunctionComponent<{ device: BluetoothDevice }> = ({
  device,
}) => {
  const link = generatePath(DEVICE_ROUTE, {
    id: device.id,
    name: device.name || '?',
  });

  const background = useGradientStyle(device.id);

  return (
    <li>
      <NavLink
        className="flex items-center text-gray-900 hover:bg-gray-100"
        to={link}
        key={device.id}
      >
        <div
          className="rounded-full bg-gray-800 w-10 h-10 hover:bg-gray-700 transition shadow-md m-5"
          style={background}
        ></div>

        <div className="flex-1">
          <h2 className="text-lg">{device.name}</h2>
          <h3 className="text-gray-800 text-sm">-</h3>
        </div>

        {/* <button className="m-4 bg-red-400 hover:bg-red-700 p-2 rounded-lg">&times;</button> */}
      </NavLink>
    </li>
  );
};
