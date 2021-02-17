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
function assert(value) {
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
const socket = (device, signal) => {
  connect();
  const txq = new Queue();
  const listeners = new Set();
  return {
    async send(val) {
      txq.add(val);
    },
    listen(cb) {
      listeners.add(cb);
    }
  };
  async function connect() {
    assert(device.gatt);
    const gatt = await device.gatt.connect();
    const service = await gatt.getPrimaryService(NORDIC_SERVICE);
    const tx = await service.getCharacteristic(NORDIC_TX);
    const rx = await service.getCharacteristic(NORDIC_RX);
    function valueChanged(event) {
      const value = new TextDecoder().decode(event.target.value);
      console.log("Socket: [RX] \u2193 ", value);
      for (const listener of listeners) {
        listener(value);
      }
    }
    rx.addEventListener("characteristicvaluechanged", valueChanged);
    rx.startNotifications();
    console.log("socket: connected");
    function disconnect() {
      rx.removeEventListener("characteristicvaluechanged", valueChanged);
      gatt.disconnect();
      console.log("socket: disconnected");
      txq.end();
    }
    if (signal.aborted) {
      disconnect();
    } else {
      signal.addEventListener("abort", disconnect);
    }
    for await (const value of txq) {
      const u8 = new TextEncoder().encode(value);
      console.log("Socket: [TX] \u2191 ", value);
      await tx.writeValue(u8);
      console.log("written");
    }
    console.log("ENDED");
  }
};
export const repl = (device, opts) => {
  const signal = opts?.signal || new AbortController().signal;
  const sock = socket(device, signal);
  return {
    eval(code) {
      sock.send(code + "\n");
      return Promise.resolve("Not implemented");
    }
  };
};
