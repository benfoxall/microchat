import { Dexie } from 'dexie';

// https://dexie.org/docs/Typescript

export class AppDB extends Dexie {
  devices: Dexie.Table<IDevice, string>;
  sessions: Dexie.Table<IOutput, number>;
  messages: Dexie.Table<IRepl, number>;

  constructor() {
    super('AppDB');
    this.version(1).stores({
      devices: '&id, name, createdAt',
      messages: '++id, deviceId, createdAt',
      output: '++id, deviceId, createdAt',
    });

    this.devices = this.table('devices');
    this.messages = this.table('messages');
    this.sessions = this.table('output');
  }
}

export interface IDevice {
  id: string;
  name: string;
  createdAt: number;

  nickname: string;
  notes: string;
}

export interface IOutput {
  id: number;
  deviceId: string;
  createdAt: number;
  content: string;
}

export interface IRepl {
  id: number;
  deviceId: string;
  createdAt: number;

  tx: string;
  rx: string;
}

export const db = new AppDB();
