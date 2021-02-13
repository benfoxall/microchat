import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { requestDevice } from './puck-stuff';
import { toast } from 'react-toastify';

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
          <li key={device.id}>
            <h2>{device.name}</h2>
            <h3>{device.id}</h3>
            <button onClick={remove(device)}>remove</button>
          </li>
        ))}
      </ul>
      <button onClick={addDevice}>Add</button>
    </section>
  );
};
