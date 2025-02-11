#!/usr/bin/env node

if ('development' === process.env.NODE_ENV) {
  // In development, we'll let the dev script handle it
  console.error('Please use "pnpm dev" for development mode');
  process.exit(1);
} else {
  // Use compiled version for production
  require('../dist/index.js');
}
