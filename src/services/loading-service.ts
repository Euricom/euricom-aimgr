import cliSpinners from 'cli-spinners';

export class LoadingService {
  private static interval: NodeJS.Timeout | null = null;
  private static currentFrame = 0;
  private static spinner = cliSpinners.dots;

  static start(text: string = 'Loading...') {
    // Clear any existing spinner
    this.stop();

    // Get the frames and interval from the spinner
    const { frames, interval } = this.spinner;

    process.stdout.write('\x1B[?25l'); // Hide cursor

    this.interval = setInterval(() => {
      // Clear the previous line
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);

      // Write the new frame
      process.stdout.write(`${frames[this.currentFrame]} ${text}`);

      // Update frame index
      this.currentFrame = (this.currentFrame + 1) % frames.length;
    }, interval);
  }

  static stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.currentFrame = 0;

      // Clear the line and reset cursor
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write('\x1B[?25h'); // Show cursor
    }
  }
}
