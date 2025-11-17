import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';
import {
  getNetworkInfo,
  getDeviceMemory,
  getCpuPressure,
  ClientMetrics,
} from '../utils/client-metrics';

export class ElectionStrategy {
  private awareness: Awareness;
  private doc: Y.Doc;
  private janitorId: string | null = null;

  constructor(doc: Y.Doc) {
    this.doc = doc;
    this.awareness = new Awareness(this.doc);
    this.awareness.on('change', this.handleAwarenessChange);
    this.updateClientMetrics();
  }

  private updateClientMetrics() {
    const networkInfo = getNetworkInfo();
    this.awareness.setLocalStateField('metrics', {
      downlink: networkInfo.downlink,
      rtt: networkInfo.rtt,
      deviceMemory: getDeviceMemory(),
      cpuPressure: getCpuPressure(),
    });
  }

  elect(): void {
    const clients = Array.from(this.awareness.getStates().entries());
    if (clients.length === 0) {
      this.janitorId = null;
      return;
    }

    const bestClient = this.evaluateBestClient(clients);
    this.janitorId = bestClient ? bestClient[0].toString() : null;
  }

  isJanitor(): boolean {
    return this.janitorId === this.awareness.clientID.toString();
  }

  getClientId(): number {
    return this.awareness.clientID;
  }

  private handleAwarenessChange = () => {
    this.elect();
  };

  private evaluateBestClient(clients: [number, any][]): [number, any] | null {
    let bestClient: [number, any] | null = null;
    let bestScore = -1;

    for (const client of clients) {
      const metrics = this.getClientMetrics(client);
      if (metrics) {
        const score = this.calculateScore(metrics);

        if (score > bestScore) {
          bestScore = score;
          bestClient = client;
        }
      }
    }

    return bestClient;
  }

  private getClientMetrics(client: [number, any]): ClientMetrics | null {
    const state = this.awareness.getStates().get(client[0]);
    return state ? state.metrics : null;
  }

  private calculateScore(metrics: ClientMetrics): number {
    let score = 0;
    if (metrics.downlink > -1) score += metrics.downlink;
    if (metrics.rtt > -1) score -= metrics.rtt;
    if (metrics.deviceMemory > -1) score += metrics.deviceMemory;
    if (metrics.cpuPressure === 'nominal') score += 100;
    if (metrics.cpuPressure === 'fair') score += 50;
    return score;
  }

  destroy(): void {
    this.awareness.off('change', this.handleAwarenessChange);
    this.awareness.destroy();
  }
}
