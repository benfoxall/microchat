import React, { FunctionComponent, SyntheticEvent } from 'react';
import { toast } from 'react-toastify';
import { generatePath, NavLink } from 'react-router-dom';
import { DEVICE_ROUTE } from './Device';
import { useGradientStyle } from './util';
import { db, IDevice } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRequestDevice } from './device-cache';

export const DeviceList: FunctionComponent = () => {
  const connect = useRequestDevice();

  const addDevice = async () => {
    const device = await connect();

    if (device) {
      const count = await db.devices.where('id').equals(device.id).count();

      if (count > 0) {
        toast.warn('already added');
      } else {
        db.devices.add(
          {
            id: device.id,
            name: device.name || '',
            createdAt: Date.now(),
            nickname: '',
            notes: '',
          },
          device.id,
        );
      }
    }
  };

  const deviceData = useLiveQuery(() => db.devices.toArray(), []);

  return (
    <section>
      <div className="bg-green-400 p-5">
        <h1 className=" text-3xl">MicroChat</h1>
        <p className=" text-lg text-gray-800">A chat ui for Espruino boards</p>
      </div>
      <ul>
        {deviceData?.map((data) => (
          <DeviceListItem key={data.id} device={data} />
        ))}
      </ul>
      <button
        className="rounded-full bg-green-400 w-12 h-12 hover:bg-green-700 transition shadow-lg fixed bottom-10 left-1/2 transform -translate-x-1/2 text-white"
        onClick={addDevice}
      >
        +
      </button>
    </section>
  );
};

const DeviceListItem: FunctionComponent<{ device: IDevice }> = ({ device }) => {
  const link = generatePath(DEVICE_ROUTE, {
    id: device.id,
    name: device.name || '?',
  });

  const background = useGradientStyle(device.id);

  const remove = (e: SyntheticEvent) => {
    e.preventDefault();
    if (confirm('Remove?')) db.devices.delete(device.id);
  };

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

        <button
          onClick={remove}
          className="m-3 h-7 w-7 hover:bg-red-100 text-red-500 p-0 rounded-full flex items-center justify-center"
        >
          &times;
        </button>
      </NavLink>
    </li>
  );
};
