export class NetworkObserver {
  private online: boolean = navigator.onLine;
  private onlineCallbacks: (() => void)[] = [];
  private offlineCallbacks: (() => void)[] = [];

  constructor() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  isOnline(): boolean {
    return this.online;
  }

  onOnline(callback: () => void): () => void {
    this.onlineCallbacks.push(callback);
    return () => {
      this.onlineCallbacks = this.onlineCallbacks.filter((cb) => cb !== callback);
    };
  }

  onOffline(callback: () => void): () => void {
    this.offlineCallbacks.push(callback);
    return () => {
      this.offlineCallbacks = this.offlineCallbacks.filter((cb) => cb !== callback);
    };
  }

  private handleOnline = () => {
    this.online = true;
    this.onlineCallbacks.forEach((cb) => cb());
  };

  private handleOffline = () => {
    this.online = false;
    this.offlineCallbacks.forEach((cb) => cb());
  };

  destroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}
