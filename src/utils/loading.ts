import cliSpinners from 'cli-spinners';
import ora from 'ora';

const spinner = ora({
  spinner: cliSpinners.dots,
  text: 'Loading...',
});

export function start(text = 'Loading...') {
  spinner.text = text;
  spinner.start();
}

export function stop() {
  spinner.stop();
}
