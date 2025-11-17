import * as Y from 'yjs';

export class SnapshotStrategy {
  constructor() {}

  createSnapshot(doc: Y.Doc): Uint8Array {
    return Y.encodeStateAsUpdate(doc);
  }
}
