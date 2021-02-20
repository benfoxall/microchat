import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { requestDevice } from './puck-stuff';
import { toast } from 'react-toastify';
import { generatePath, NavLink } from 'react-router-dom';
import { DEVICE_ROUTE } from './Device';

interface IDevicesProps {
  value: BluetoothDevice[];
  onChange: Dispatch<SetStateAction<BluetoothDevice[]>>;
}

export const Devices: FunctionComponent<IDevicesProps> = ({
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
      toast.warn('Not added');
    }
  };

  const remove = (device: BluetoothDevice) => () =>
    onChange((devices) => devices.filter((target) => device !== target));

  return (
    <section className="DeviceList">
      <ul>
        {value.map((device) => (
          <NavLink
            to={generatePath(DEVICE_ROUTE, {
              id: device.id,
              name: device.name || '?',
            })}
            key={device.id}
          >
            <li>
              <h2>
                {device.name}

                <button onClick={remove(device)}>&times;</button>
              </h2>
            </li>
          </NavLink>
        ))}
      </ul>
      <button onClick={addDevice}>Add</button>
    </section>
  );
};
