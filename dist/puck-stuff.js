import {useCallback, useEffect, useState} from "../_snowpack/pkg/react.js";
import {assert, Queue} from "./util.js";
const NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NORDIC_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const CHUNKSIZE = 16;
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
    (async () => {
      assert(this.device.gatt);
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
      rx.startNotifications();
      console.log("socket: connected");
      this.state = "connected";
      for await (const value of this.queue) {
        const u8 = new TextEncoder().encode(value);
        console.log("Socket: [TX] \u2191 ", value);
        await tx.writeValue(u8);
      }
      rx.removeEventListener("characteristicvaluechanged", onValueChanged);
      rx.stopNotifications();
      console.log("socket: disconnected");
    })().then(() => {
      this.state = "closed";
      this.dispatchEvent(new CloseEvent("close"));
    }, (error) => {
      console.error(error);
      this.state = "error";
      this.dispatchEvent(new ErrorEvent("error", {error}));
    });
  }
  send(value) {
    for (let i = 0; i < value.length; i += CHUNKSIZE) {
      this.queue.add(value.substring(i, i + CHUNKSIZE));
    }
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
  useEffect(() => {
    setError(null);
    if (!device)
      return;
    const socket = new Socket(device, queue);
    socket.addEventListener("error", (event) => {
      setError(String(event.error) || "Error");
    });
    socket.addEventListener("close", (event) => {
      setError("closed");
    });
    socket.addEventListener("data", (event) => {
      const payload = event.data;
      setOutput((prev) => prev + payload);
    });
    return () => {
      socket.close();
    };
  }, [device]);
  return {error, output, send};
};
