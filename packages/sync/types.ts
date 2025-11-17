export abstract class AbstractLocalAdapter {
  abstract get(listName: string, docId: string): Promise<Uint8Array | null>;
  abstract getAll(listName: string): Promise<Record<string, Uint8Array>>;
  abstract put(listName: string, docId: string, binary: Uint8Array): Promise<void>;
  abstract putAll(listName: string, docs: Record<string, Uint8Array>): Promise<void>;
  abstract delete(listName: string, docId: string): Promise<void>;
  abstract deleteAll(listName: string, docIds: string[]): Promise<void>;
}

export abstract class AbstractRemoteAdapter {
  abstract watch(listName: string, callback: (docId: string, binary: Uint8Array, clientId?: string) => void): () => void;
  abstract send(listName: string, docId: string, binary: Uint8Array, clientId?: string): Promise<void>;
  abstract getSnapshot(listName: string): Promise<Record<string, Uint8Array>>;
}
