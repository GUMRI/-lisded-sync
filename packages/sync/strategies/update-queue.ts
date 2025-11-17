export class UpdateQueue {
  private queue: Uint8Array[] = [];

  enqueue(update: Uint8Array): void {
    this.queue.push(update);
  }

  dequeue(): Uint8Array | undefined {
    return this.queue.shift();
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  getQueue(): Uint8Array[] {
    return this.queue;
  }
}
