import {useCallback, useEffect, useState} from "../_snowpack/pkg/react.js";
import {assert, Queue} from "./util.js";
const NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NORDIC_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const CHUNKSIZE = 10;
export function requestDevice() {
  return navigator.bluetooth.requestDevice({
    filters: [
      {namePrefix: "Puck.js"},
      {namePrefix: "Pixl.js"},
      {namePrefix: "MDBT42Q"},
      {namePrefix: "RuuviTag"},
      {namePrefix: "iTracker"},
      {namePrefix: "Thingy"},
      {namePrefix: "Espruino"},
      {services: [NORDIC_SERVICE]}
    ],
    optionalServices: [NORDIC_SERVICE]
  });
}
export function requestDeviceByName(name) {
  return navigator.bluetooth.requestDevice({
    filters: [{name}],
    optionalServices: [NORDIC_SERVICE]
  });
}
export class Socket extends EventTarget {
  constructor(device, queue = new Queue()) {
    super();
    this.device = device;
    this.queue = queue;
    this.state = "connecting";
    const setState = (state) => {
      this.state = state;
      this.dispatchEvent(new Event("state-changed"));
      console.info(device.name, state);
    };
    (async () => {
      assert(this.device.gatt);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const gatt = await this.device.gatt.connect();
      const service = await gatt.getPrimaryService(NORDIC_SERVICE);
      const tx = await service.getCharacteristic(NORDIC_TX);
      const rx = await service.getCharacteristic(NORDIC_RX);
      const onValueChanged = (event) => {
        const data = new TextDecoder().decode(event.target.value);
        console.log("Socket: [RX] \u2193 ", data);
        this.dispatchEvent(new MessageEvent("data", {data}));
      };
      rx.addEventListener("characteristicvaluechanged", onValueChanged);
      await rx.startNotifications();
      setState("connected");
      for await (const value of this.queue) {
        const u8 = new TextEncoder().encode(value);
        for (let i = 0; i < u8.length; i += CHUNKSIZE) {
          await tx.writeValue(u8.subarray(i, i + CHUNKSIZE));
          console.log("Socket: [TX] \u2191 ", value);
        }
      }
      rx.removeEventListener("characteristicvaluechanged", onValueChanged);
      await rx.stopNotifications();
      gatt.disconnect();
    })().then(() => {
      setState("closed");
      this.dispatchEvent(new CloseEvent("close"));
    }, (error) => {
      setState("error");
      console.warn(error);
      this.dispatchEvent(new ErrorEvent("error", {error}));
    });
  }
  send(value) {
    this.queue.add(value);
  }
  close() {
    this.queue.end();
  }
}
export const useSocket = (device) => {
  const [queue] = useState(() => new Queue());
  const send = useCallback((value) => queue.add(value + "\n"), [queue]);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState("");
  const [state, setState] = useState();
  useEffect(() => {
    setError(null);
    if (!device)
      return;
    const socket = new Socket(device, queue);
    let cancel = false;
    socket.addEventListener("error", (event) => {
      setError(String(event.error) || "Error");
    });
    socket.addEventListener("close", () => {
      if (cancel)
        return;
      setError("closed");
    });
    socket.addEventListener("state-changed", () => {
      if (cancel)
        return;
      setState(socket.state);
    });
    socket.addEventListener("data", (event) => {
      if (cancel)
        return;
      const payload = event.data;
      setOutput((prev) => prev + payload);
    });
    return () => {
      socket.close();
    };
  }, [device]);
  return {error, output, send, state};
};
