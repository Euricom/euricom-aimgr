import cliSpinners from 'cli-spinners';
import ora from 'ora';

export const LoadingService = {
  spinner: ora({
    spinner: cliSpinners.dots,
    text: 'Loading...',
  }),

  start(text = 'Loading...') {
    this.spinner.text = text;
    this.spinner.start();
  },

  stop() {
    this.spinner.stop();
  },
};
