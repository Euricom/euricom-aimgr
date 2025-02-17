import { User } from '@/domain/user';
import fs from 'node:fs';
import path from 'node:path';

const STORE_PATH = path.join(process.cwd(), '.store.json');

interface StoreData {
  users: User[];
  providers: string[];
}

function readStore(): Partial<StoreData> {
  if (!fs.existsSync(STORE_PATH)) return {};
  return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
}

function writeStore(data: Partial<StoreData>): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, undefined, 2));
}

export const store = {
  get<K extends keyof StoreData>(key: K): StoreData[K] | undefined {
    return readStore()[key];
  },

  set<K extends keyof StoreData>(key: K, value: StoreData[K]): void {
    const data = readStore();
    data[key] = value;
    writeStore(data);
  },
};
