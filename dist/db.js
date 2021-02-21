import {Dexie} from "../_snowpack/pkg/dexie.js";
export class AppDB extends Dexie {
  constructor() {
    super("AppDB");
    this.version(1).stores({
      devices: "&id, name, createdAt",
      messages: "++id, deviceId, createdAt",
      output: "++id, deviceId, createdAt"
    });
    this.devices = this.table("devices");
    this.messages = this.table("messages");
    this.sessions = this.table("output");
  }
}
export const db = new AppDB();
