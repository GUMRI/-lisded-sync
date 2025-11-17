import * as Y from 'yjs';
import { AbstractLocalAdapter, AbstractRemoteAdapter } from './types.js';
import { NetworkObserver } from './strategies/network-observer.js';
import { UpdateQueue } from './strategies/update-queue.js';
import { ElectionStrategy } from './strategies/election-strategy.js';
import { SnapshotStrategy } from './strategies/snapshot-strategy.js';
import { StateVectorStrategy } from './strategies/state-vector-strategy.js';
import { CleanupStrategy } from './strategies/cleanup-strategy.js';

export class LSyncProvider {
  private localAdapter: AbstractLocalAdapter;
  private remoteAdapter: AbstractRemoteAdapter;
  private listName: string;
  private doc: Y.Doc;
  private networkObserver: NetworkObserver;
  private updateQueue: UpdateQueue;
  private electionStrategy: ElectionStrategy;
  private snapshotStrategy: SnapshotStrategy;
  private stateVectorStrategy: StateVectorStrategy;
  private cleanupStrategy: CleanupStrategy;

  constructor(
    listName: string,
    localAdapter: AbstractLocalAdapter,
    remoteAdapter: AbstractRemoteAdapter,
    doc: Y.Doc = new Y.Doc(),
    networkObserver: NetworkObserver = new NetworkObserver(),
    updateQueue: UpdateQueue = new UpdateQueue(),
    electionStrategy: ElectionStrategy | null = null,
    snapshotStrategy: SnapshotStrategy = new SnapshotStrategy(),
    stateVectorStrategy: StateVectorStrategy = new StateVectorStrategy(),
    cleanupStrategy: CleanupStrategy = new CleanupStrategy()
  ) {
    this.listName = listName;
    this.localAdapter = localAdapter;
    this.remoteAdapter = remoteAdapter;
    this.doc = doc;
    this.networkObserver = networkObserver;
    this.updateQueue = updateQueue;
    this.electionStrategy = electionStrategy || new ElectionStrategy(this.doc);
    this.snapshotStrategy = snapshotStrategy;
    this.stateVectorStrategy = stateVectorStrategy;
    this.cleanupStrategy = cleanupStrategy;
  }

  async bootstrap(): Promise<void> {
    this.electionStrategy.elect();
    const localDoc = await this.localAdapter.get(this.listName, 'doc');
    if (localDoc) {
      Y.applyUpdate(this.doc, localDoc);
    }

    if (this.networkObserver.isOnline()) {
      this.handleOnline();
    }

    this.networkObserver.onOnline(this.handleOnline);
    this.doc.on('update', this.handleLocalUpdate);
    this.remoteAdapter.watch(this.listName, this.handleRemoteUpdate);
  }

  private handleOnline = () => {
    const stateVector = this.stateVectorStrategy.createStateVector(this.doc);
    this.remoteAdapter.send(
      this.listName,
      'state-vector-request',
      stateVector,
      this.electionStrategy.getClientId().toString()
    );
  };

  private handleLocalUpdate = (update: Uint8Array) => {
    this.localAdapter.put(this.listName, 'doc', Y.encodeStateAsUpdate(this.doc));
    if (this.networkObserver.isOnline()) {
      this.remoteAdapter.send(this.listName, 'doc', update);
    } else {
      this.updateQueue.enqueue(update);
    }
  };

  private handleRemoteUpdate = (docId: string, binary: Uint8Array, clientId?: string) => {
    if (docId === 'state-vector-request' && this.electionStrategy.isJanitor() && clientId) {
      const update = Y.encodeStateAsUpdate(this.doc, binary);
      this.remoteAdapter.send(this.listName, `state-vector-response:${clientId}`, update);
    } else if (docId === `state-vector-response:${this.electionStrategy.getClientId()}`) {
      Y.applyUpdate(this.doc, binary);
    } else if (docId === 'doc') {
      Y.applyUpdate(this.doc, binary);
    }
  };

  createSnapshot(): Uint8Array | null {
    if (this.electionStrategy.isJanitor()) {
      return this.snapshotStrategy.createSnapshot(this.doc);
    }
    return null;
  }

  createStateVector(): Uint8Array | null {
    if (this.electionStrategy.isJanitor()) {
      return this.stateVectorStrategy.createStateVector(this.doc);
    }
    return null;
  }
}
