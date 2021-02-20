import React, { Dispatch, FunctionComponent, SetStateAction, SyntheticEvent } from 'react';
import { requestDevice } from './puck-stuff';
import { toast } from 'react-toastify';
import { generatePath, NavLink } from 'react-router-dom';
import { DEVICE_ROUTE } from './Device';

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
    e.preventDefault()
    onChange((devices) => devices.filter((target) => device !== target));
  }


  return (
    <section>
      <ul>
        {value.map((device) => (
          <NavLink
            to={generatePath(DEVICE_ROUTE, {
              id: device.id,
              name: device.name || '?',
            })}
            key={device.id}
          >
            <li className="flex items-center justify-between text-green-200">

              <div className="rounded-full bg-gray-800 w-12 h-12 hover:bg-gray-700 transition shadow-md m-5" ></div>

              <h2 className=" flex-1">
                {device.name}
              </h2>

              <button className="m-4 bg-red-400 hover:bg-red-700 p-2 rounded-lg" onClick={remove(device)}>&times;</button>
            </li>
          </NavLink>
        ))}
      </ul>
      <button className="rounded-full bg-purple-800 w-12 h-12 hover:bg-purple-700 transition shadow-lg fixed bottom-4 right-4 text-white" onClick={addDevice}>
        +
      </button>
    </section>
  );
};
