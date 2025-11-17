import { describe, it, expect, vi } from 'vitest';
import { ElectionStrategy } from '../strategies/election-strategy';
import * as Y from 'yjs';

// Mock Web APIs
vi.stubGlobal('navigator', {
  connection: {
    downlink: 10,
    rtt: 50,
  },
  deviceMemory: 8,
});

vi.stubGlobal('window', {
  ComputePressureObserver: class {
    observe() {}
    unobserve() {}
  },
});

describe('ElectionStrategy', () => {
  it('should instantiate', () => {
    const doc = new Y.Doc();
    const strategy = new ElectionStrategy(doc);
    expect(strategy).toBeInstanceOf(ElectionStrategy);
  });

  it('should elect janitor based on metrics', () => {
    const doc1 = new Y.Doc();
    const strategy1 = new ElectionStrategy(doc1);
    const doc2 = new Y.Doc();
    const strategy2 = new ElectionStrategy(doc2);

    // Connect the two awareness instances
    const awareness1 = strategy1['awareness'];
    const awareness2 = strategy2['awareness'];

    awareness1.setLocalStateField('metrics', {
      downlink: 10,
      rtt: 100,
      deviceMemory: 4,
      cpuPressure: 'critical',
    });

    awareness2.setLocalStateField('metrics', {
      downlink: 100,
      rtt: 50,
      deviceMemory: 8,
      cpuPressure: 'nominal',
    });

    strategy1.elect();
    strategy2.elect();

    expect(strategy1.isJanitor()).toBe(false);
    expect(strategy2.isJanitor()).toBe(true);
  });
});
