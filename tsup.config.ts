import dotenv from 'dotenv';
import { defineConfig } from 'tsup';

dotenv.config();
export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  minify: true,
  noExternal: ['cli-table3', 'ora', 'chalk'],
  shims: true,
  sourcemap: true,
  splitting: false,
  target: 'node18',
  treeshake: true,
  define: {
    'process.env.OPENAI_ADMIN_KEY': JSON.stringify(process.env.OPENAI_ADMIN_KEY),
    'process.env.ANTHROPIC_ADMIN_KEY': JSON.stringify(process.env.ANTHROPIC_ADMIN_KEY),
  },
});
