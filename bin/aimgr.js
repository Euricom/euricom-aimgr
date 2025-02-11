#!/usr/bin/env node

// TODO: don't use esbuild-register for production run
// TODO: use tsx for debug start, build and use ./dist/index.js for prod.

require("esbuild-register");
require("../src/index.ts");
