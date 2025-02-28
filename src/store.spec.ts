import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as store from './store';

const STORE_PATH = path.join(process.cwd(), '.store.json');

describe('Store', () => {
  beforeEach(() => {
    // Clear the store before each test
    if (fs.existsSync(STORE_PATH)) {
      fs.unlinkSync(STORE_PATH);
    }
  });

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(STORE_PATH)) {
      fs.unlinkSync(STORE_PATH);
    }
  });

  describe('set and get', () => {
    it('should set and get a value', () => {
      store.set('key1', 'value1');
      expect(store.get<string>('key1')).toBe('value1');
    });

    it('should return undefined for a non-existing key', () => {
      expect(store.get<string>('nonExistingKey')).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should remove an existing key', () => {
      store.set('key2', 'value2');
      store.remove('key2');
      expect(store.get<string>('key2')).toBeUndefined();
    });

    it('should not throw an error when removing a non-existing key', () => {
      expect(() => store.remove('nonExistingKey')).not.toThrow();
    });
  });

  it('should persist data between calls', () => {
    store.set('key3', 'value3');
    expect(store.get<string>('key3')).toBe('value3');
    store.set('key3', 'newValue3');
    expect(store.get<string>('key3')).toBe('newValue3');
  });

  describe('error handling', () => {
    it('should handle corrupted store file', () => {
      fs.writeFileSync(STORE_PATH, 'invalid json');
      expect(() => store.get('key')).toThrow();
    });

    it('should handle permission errors', () => {
      store.set('key', 'value');
      fs.chmodSync(STORE_PATH, 0o444);
      expect(() => store.set('key2', 'value2')).toThrow();
      fs.chmodSync(STORE_PATH, 0o666);
    });
  });

  describe('data persistence', () => {
    it('should correctly persist nested objects', () => {
      const complexObj = {
        nested: {
          array: [1, 2, 3],
          object: { a: 1, b: 2 },
        },
      };
      store.set('complex', complexObj);
      expect(store.get('complex')).toEqual(complexObj);
    });

    it('should handle multiple set operations', () => {
      store.set('key1', 'value1');
      store.set('key2', 'value2');
      store.set('key1', 'value3');

      expect(store.get('key1')).toBe('value3');
      expect(store.get('key2')).toBe('value2');
    });
    it('should handle concurrent access', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => store.set(`key${i}`, `value${i}`));
      await Promise.all(promises);

      for (let i = 0; i < 10; i++) {
        expect(store.get(`key${i}`)).toBe(`value${i}`);
      }
    });
  });

  describe('type safety', () => {
    it('should preserve types correctly', () => {
      const date = new Date();
      store.set('date', date.toISOString());
      const retrieved = store.get<string>('date');
      expect(new Date(retrieved!)).toEqual(date);
    });
  });
});
