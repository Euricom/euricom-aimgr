declare module 'better-console' {
  export interface Console {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
    table: typeof console.table;
    time: typeof console.time;
    timeEnd: typeof console.timeEnd;
    clear: typeof console.clear;
    dir: typeof console.dir;
  }
  const console: Console;
  export default console;
}
