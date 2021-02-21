import { Dexie } from 'dexie';

// https://dexie.org/docs/Typescript

export class AppDB extends Dexie {
  devices: Dexie.Table<IDevice, string>;
  messages: Dexie.Table<IMessage, number>;

  constructor() {
    super('AppDB');
    this.version(1).stores({
      devices: '&id, name, createdAt',
      messages: '++id, deviceId, createdAt',
    });

    this.devices = this.table('devices');
    this.messages = this.table('messages');
  }
}

interface IDevice {
  id: string;
  name: string;
  createdAt: number;
  nickname: string;
  notes: string;
}

interface IMessage {
  id: string;
  deviceId: string;
  createdAt: number;

  nickname: string;
  notes: string;
}
