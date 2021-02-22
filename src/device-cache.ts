// getDevices would avoid this

import { createContext, useCallback, useContext, useState } from 'react';
import { requestDevice, requestDeviceByName } from './puck-stuff';

const context = createContext(new Set<BluetoothDevice>());

export const useDevice = (name: string) => {
  const devices = useContext(context);

  const [device, setDevice] = useState(() => {
    for (const device of devices) {
      if (device.name === name) return device;
    }
  });

  /** must be called from user action */
  const reconnect = useCallback(async () => {
    try {
      const newDevice = await requestDeviceByName(name);

      for (const other of devices) {
        if (other.name === newDevice.name) devices.delete(other);
      }

      devices.add(newDevice);

      setDevice(newDevice);
    } catch (e) {
      console.warn(e);
    }
  }, [name]);

  const clear = useCallback(async () => {
    if (device)
      for (const other of devices)
        if (other.name === device.name) devices.delete(other);

    setDevice(undefined);
  }, [device]);

  return [device, reconnect, clear] as [
    BluetoothDevice | undefined,
    () => Promise<void>,
    () => Promise<void>,
  ];
};

/** request any device (and add to cache) */
export const useRequestDevice = () => {
  const devices = useContext(context);

  /** must be called from user action */
  return useCallback(async () => {
    try {
      const newDevice = await requestDevice();

      devices.add(newDevice);

      return newDevice;
    } catch (e) {
      console.warn(e);
    }
  }, []);
};
