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
export function assert(value) {
  if (!value) {
    throw new Error("Assertation Error");
  }
}
class Queue {
  constructor(value = null) {
    this.value = value;
    this.resolve = () => {
    };
    this.next = new Promise((resolve) => this.resolve = resolve);
  }
  add(value) {
    const next = new Queue(value);
    this.resolve(next);
    this.resolve = next.resolve;
  }
  end() {
    this.resolve(new Queue());
  }
  async *[Symbol.asyncIterator]() {
    while (true) {
      const current = await this.next;
      this.next = current.next;
      if (current.value === null)
        break;
      yield current.value;
    }
  }
}
export class Socket extends Queue {
  constructor(device, signal) {
    super();
    this.device = device;
    this.listeners = new Set();
    if (signal.aborted) {
      this.disconnect();
    } else {
      signal.addEventListener("abort", () => this.disconnect());
    }
    (async () => {
      assert(this.device.gatt);
      const gatt = await this.device.gatt.connect();
      const service = await gatt.getPrimaryService(NORDIC_SERVICE);
      const tx = await service.getCharacteristic(NORDIC_TX);
      const rx = await service.getCharacteristic(NORDIC_RX);
      const onValueChanged = (event) => {
        const value = new TextDecoder().decode(event.target.value);
        console.log("Socket: [RX] \u2193 ", value);
        for (const listener of this.listeners) {
          listener(value);
        }
      };
      rx.addEventListener("characteristicvaluechanged", onValueChanged);
      rx.startNotifications();
      console.log("socket: connected");
      for await (const value of this) {
        const u8 = new TextEncoder().encode(value);
        console.log("Socket: [TX] \u2191 ", value);
        await tx.writeValue(u8);
      }
      rx.removeEventListener("characteristicvaluechanged", onValueChanged);
      rx.stopNotifications();
      console.log("socket: disconnected");
    })();
  }
  send(val) {
    this.add(val);
  }
  listen(cb) {
    this.listeners.add(cb);
  }
  disconnect() {
    this.end();
  }
}
export class LSocket extends Socket {
  send(value) {
    for (let i = 0; i < value.length; i += CHUNKSIZE) {
      super.send(value.substring(i, i + CHUNKSIZE));
    }
  }
}
export const repl = (device, opts) => {
  const signal = opts?.signal || new AbortController().signal;
  const sock = new Socket(device, signal);
  return {
    eval(code) {
      sock.send(code + "\n");
      return Promise.resolve("Not implemented");
    }
  };
};
