import fs from 'node:fs';
import path from 'node:path';
import { User } from './domain/user';

const STORE_PATH = path.join(process.cwd(), '.store.json');

interface StoreSchema {
  users: User[];

  // New data types can be added here without changing implementation
}

class JsonFileStore {
  private async readStore(): Promise<Partial<StoreSchema>> {
    if (!fs.existsSync(STORE_PATH)) return {};
    return JSON.parse(await fs.promises.readFile(STORE_PATH, 'utf8'));
  }

  private writeStore(data: Partial<StoreSchema>): void {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, undefined, 2));
  }

  async get<K extends keyof StoreSchema>(key: K): Promise<StoreSchema[K] | undefined> {
    const data = await this.readStore();
    return data[key];
  }

  async set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): Promise<void> {
    const data = await this.readStore();
    data[key] = value;
    this.writeStore(data);
  }

  async delete<K extends keyof StoreSchema>(key: K): Promise<void> {
    const data = await this.readStore();
    delete data[key];
    this.writeStore(data);
  }
}

// Create an instance of the store
export const store = new JsonFileStore();
