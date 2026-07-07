export class CleanupScheduler {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly job: () => Promise<void>,
    private readonly intervalMs: number,
  ) {}

  start() {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      void this.job();
    }, this.intervalMs);
  }

  stop() {
    if (!this.timer) {
      return;
    }

    clearInterval(this.timer);
    this.timer = undefined;
  }
}
