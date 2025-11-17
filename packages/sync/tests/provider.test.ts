import { describe, it, expect, vi } from 'vitest';
import { LSyncProvider } from '../provider';
import { AbstractLocalAdapter, AbstractRemoteAdapter } from '../types';

class MockLocalAdapter extends AbstractLocalAdapter {
  get = vi.fn();
  getAll = vi.fn();
  put = vi.fn();
  putAll = vi.fn();
  delete = vi.fn();
  deleteAll = vi.fn();
}

class MockRemoteAdapter extends AbstractRemoteAdapter {
  watch = vi.fn();
  send = vi.fn();
  getSnapshot = vi.fn();
}

import { ElectionStrategy } from '../strategies/election-strategy';
import * as Y from 'yjs';

describe('LSyncProvider', () => {
  it('should instantiate', () => {
    const localAdapter = new MockLocalAdapter();
    const remoteAdapter = new MockRemoteAdapter();
    const provider = new LSyncProvider('test', localAdapter, remoteAdapter);
    expect(provider).toBeInstanceOf(LSyncProvider);
  });

  it('should bootstrap and load data from local adapter', async () => {
    const localAdapter = new MockLocalAdapter();
    const remoteAdapter = new MockRemoteAdapter();
    remoteAdapter.getSnapshot.mockResolvedValue({});
    const provider = new LSyncProvider('test', localAdapter, remoteAdapter);

    await provider.bootstrap();

    expect(localAdapter.get).toHaveBeenCalledWith('test', 'doc');
  });


  it('should create snapshot if janitor', () => {
    const localAdapter = new MockLocalAdapter();
    const remoteAdapter = new MockRemoteAdapter();
    const electionStrategy = new ElectionStrategy(new Y.Doc());
    electionStrategy.isJanitor = vi.fn().mockReturnValue(true);
    const provider = new LSyncProvider(
      'test',
      localAdapter,
      remoteAdapter,
      new Y.Doc(),
      undefined,
      undefined,
      electionStrategy
    );

    const snapshot = provider.createSnapshot();

    expect(snapshot).toBeInstanceOf(Uint8Array);
  });

  it('should not create snapshot if not janitor', () => {
    const localAdapter = new MockLocalAdapter();
    const remoteAdapter = new MockRemoteAdapter();
    const electionStrategy = new ElectionStrategy(new Y.Doc());
    electionStrategy.isJanitor = vi.fn().mockReturnValue(false);
    const provider = new LSyncProvider(
      'test',
      localAdapter,
      remoteAdapter,
      new Y.Doc(),
      undefined,
      undefined,
      electionStrategy
    );

    const snapshot = provider.createSnapshot();

    expect(snapshot).toBeNull();
  });

  it('should create state vector if janitor', () => {
    const localAdapter = new MockLocalAdapter();
    const remoteAdapter = new MockRemoteAdapter();
    const electionStrategy = new ElectionStrategy(new Y.Doc());
    electionStrategy.isJanitor = vi.fn().mockReturnValue(true);
    const provider = new LSyncProvider(
      'test',
      localAdapter,
      remoteAdapter,
      new Y.Doc(),
      undefined,
      undefined,
      electionStrategy
    );

    const stateVector = provider.createStateVector();

    expect(stateVector).toBeInstanceOf(Uint8Array);
  });

  it('should not create state vector if not janitor', () => {
    const localAdapter = new MockLocalAdapter();
    const remoteAdapter = new MockRemoteAdapter();
    const electionStrategy = new ElectionStrategy(new Y.Doc());
    electionStrategy.isJanitor = vi.fn().mockReturnValue(false);
    const provider = new LSyncProvider(
      'test',
      localAdapter,
      remoteAdapter,
      new Y.Doc(),
      undefined,
      undefined,
      electionStrategy
    );

    const stateVector = provider.createStateVector();

    expect(stateVector).toBeNull();
  });

  it('should send state vector request on online', () => {
    const localAdapter = new MockLocalAdapter();
    const remoteAdapter = new MockRemoteAdapter();
    const electionStrategy = new ElectionStrategy(new Y.Doc());
    const provider = new LSyncProvider(
      'test',
      localAdapter,
      remoteAdapter,
      new Y.Doc(),
      undefined,
      undefined,
      electionStrategy
    );

    // Manually trigger online event
    provider['handleOnline']();

    expect(remoteAdapter.send).toHaveBeenCalledWith(
      'test',
      'state-vector-request',
      expect.any(Uint8Array),
      electionStrategy.getClientId().toString()
    );
  });

  it('janitor should handle state vector request', () => {
    const localAdapter = new MockLocalAdapter();
    const remoteAdapter = new MockRemoteAdapter();
    const electionStrategy = new ElectionStrategy(new Y.Doc());
    electionStrategy.isJanitor = vi.fn().mockReturnValue(true);
    const provider = new LSyncProvider(
      'test',
      localAdapter,
      remoteAdapter,
      new Y.Doc(),
      undefined,
      undefined,
      electionStrategy
    );

    const clientDoc = new Y.Doc();
    const stateVector = Y.encodeStateVector(clientDoc);

    // Manually trigger remote update
    provider['handleRemoteUpdate']('state-vector-request', stateVector, '123');

    expect(remoteAdapter.send).toHaveBeenCalledWith(
      'test',
      'state-vector-response:123',
      expect.any(Uint8Array)
    );
  });
});
