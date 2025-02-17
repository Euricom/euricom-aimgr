import fs from 'node:fs';
import path from 'node:path';

const STORE_PATH = path.join(process.cwd(), '.store.json');

function readStore(): { [key: string]: unknown } {
  if (!fs.existsSync(STORE_PATH)) return {};
  return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
}

function writeStore(data: { [key: string]: unknown }): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, undefined, 2));
}

export function get<T>(key: string): T | undefined {
  const data = readStore();
  return data[key] as T;
}

export function set<T>(key: string, value: T): void {
  const data = readStore();
  data[key] = value;
  writeStore(data);
}

export function remove(key: string): void {
  const data = readStore();
  delete data[key];
  writeStore(data);
}
