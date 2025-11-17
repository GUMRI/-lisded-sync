import * as Y from 'yjs';

export class StateVectorStrategy {
  constructor() {}

  createStateVector(doc: Y.Doc): Uint8Array {
    return Y.encodeStateVector(doc);
  }
}
