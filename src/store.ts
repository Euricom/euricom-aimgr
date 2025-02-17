import fs from 'node:fs';
import path from 'node:path';

const STORE_PATH = path.join(process.cwd(), '.store.json');

// Abstract store interface
interface IStore {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  delete(key: string): void;
}

// Concrete implementation of the store
class JsonFileStore implements IStore {
  private readStore(): { [key: string]: unknown } {
    if (!fs.existsSync(STORE_PATH)) return {};
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  }

  private writeStore(data: { [key: string]: unknown }): void {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, undefined, 2));
  }

  get<T>(key: string): T | undefined {
    const data = this.readStore();
    return data[key] as T | undefined;
  }

  set<T>(key: string, value: T): void {
    const data = this.readStore();
    data[key] = value;
    this.writeStore(data);
  }

  delete(key: string): void {
    const data = this.readStore();
    delete data[key];
    this.writeStore(data);
  }
}

// Create an instance of the store
export const store: IStore = new JsonFileStore();
