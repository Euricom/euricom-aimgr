import ora from 'ora';

const spinner = ora({
  text: 'Loading...',
});

export function start(text = 'Loading...') {
  spinner.text = text;
  spinner.start();
}

export function stop() {
  spinner.stop();
}

export function fail(text: string) {
  spinner.fail(text);
}

export function warn(text: string) {
  spinner.warn(text);
}

export function succeed(text: string) {
  spinner.succeed(text);
}
