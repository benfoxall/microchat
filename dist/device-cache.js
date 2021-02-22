import {createContext, useCallback, useContext, useState} from "../_snowpack/pkg/react.js";
import {requestDevice, requestDeviceByName} from "./puck-stuff.js";
const context = createContext(new Set());
export const useDevice = (name) => {
  const devices = useContext(context);
  const [device, setDevice] = useState(() => {
    for (const device2 of devices) {
      if (device2.name === name)
        return device2;
    }
  });
  const reconnect = useCallback(async () => {
    try {
      const newDevice = await requestDeviceByName(name);
      for (const other of devices) {
        if (other.name === newDevice.name)
          devices.delete(other);
      }
      devices.add(newDevice);
      setDevice(newDevice);
    } catch (e) {
      console.warn(e);
    }
  }, [name]);
  const clear = useCallback(async () => {
    if (device) {
      for (const other of devices)
        if (other.name === device.name)
          devices.delete(other);
    }
    setDevice(void 0);
  }, [device]);
  return [device, reconnect, clear];
};
export const useRequestDevice = () => {
  const devices = useContext(context);
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
