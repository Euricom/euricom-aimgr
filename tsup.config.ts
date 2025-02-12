import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  minify: true,
  noExternal: ['better-console', 'cli-spinners', 'cli-table3', 'picocolors'],
  shims: true,
  sourcemap: true,
  splitting: false,
  target: 'node18',
  treeshake: true,
});
