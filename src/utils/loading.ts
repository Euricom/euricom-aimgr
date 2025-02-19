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
