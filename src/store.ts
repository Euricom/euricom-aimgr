import fs from 'node:fs';
import path from 'node:path';
import { User } from './domain/user';

const STORE_PATH = path.join(process.cwd(), '.store.json');

interface StoreSchema {
  users: User[];
  // New data types can be added here without changing implementation
}

class JsonFileStore {
  private readStore(): Partial<StoreSchema> {
    if (!fs.existsSync(STORE_PATH)) return {};
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  }

  private writeStore(data: Partial<StoreSchema>): void {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, undefined, 2));
  }

  get<K extends keyof StoreSchema>(key: K): StoreSchema[K] | undefined {
    return this.readStore()[key];
  }

  set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): void {
    const data = this.readStore();
    data[key] = value;
    this.writeStore(data);
  }

  delete<K extends keyof StoreSchema>(key: K): void {
    const data = this.readStore();
    delete data[key];
    this.writeStore(data);
  }
}

// Create an instance of the store
export const store = new JsonFileStore();
