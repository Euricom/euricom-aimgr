import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  target: 'node18',
  noExternal: ['better-console', 'cli-spinners', 'cli-table3', 'picocolors'],
  shims: true,
  treeshake: true,
});
