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
class PuckSocket {
  constructor(device, signal) {
    this.queue = Promise.resolve();
    this.recieve = (event) => {
      var dataview = event.target.value;
      const str = new TextDecoder().decode(dataview);
      console.log("BLE: [RX] \u2193 ", str);
    };
    this.connect(device).then(() => {
      if (signal.aborted)
        this.disconnect();
      else
        signal.addEventListener("abort", this.disconnect);
    });
  }
  async send(value) {
    await (this.queue = this.queue.then(() => {
      const u8 = new TextEncoder().encode(value);
      console.log("BLE: [TX] \u2191 ", value, u8);
      return this.tx?.writeValue(u8);
    }));
  }
  async connect(device) {
    this.gatt = await device.gatt?.connect();
    const service = await this.gatt?.getPrimaryService(NORDIC_SERVICE);
    this.tx = await service?.getCharacteristic(NORDIC_TX);
    this.rx = await service?.getCharacteristic(NORDIC_RX);
    this.rx.startNotifications();
    this.rx.addEventListener("characteristicvaluechanged", this.recieve);
    console.log("BLE: connected...", this);
  }
  async disconnect() {
    this.gatt?.disconnect();
    this.rx?.removeEventListener("characteristicvaluechanged", this.recieve);
    this.rx?.stopNotifications();
    delete this.gatt;
    delete this.tx;
    delete this.rx;
    console.log("BLE: disconnected...", this);
  }
}
export const repl = (device, opts) => {
  const signal = opts?.signal || new AbortController().signal;
  const socket = new PuckSocket(device, signal);
  return {
    eval(code) {
      socket.send(code + "\n");
      return Promise.resolve("Not implemented");
    }
  };
};
