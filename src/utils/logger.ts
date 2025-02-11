import console from 'better-console';

export const logger = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  table: console.table,
  time: console.time,
  timeEnd: console.timeEnd,
  clear: console.clear,
  dir: console.dir,
};

export default logger;
