import dotenv from 'dotenv';
import { defineConfig } from 'tsup';

dotenv.config();
export default defineConfig({
  clean: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  minify: true,
  noExternal: ['cli-table3', 'ora', 'chalk'],
  shims: true,
  splitting: false,
  target: 'node18',
  treeshake: true,
});
