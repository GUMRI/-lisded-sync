
/**
 * Represents a document stored locally or remotely.
 * The document is stored as a binary representation of an Automerge document.
 */
export interface LocalDocument {
  /** The unique identifier of the document. */
  id: string;
  /** The binary representation of the Automerge document. */
  binary: Uint8Array;
}

/**
 * Represents the interface for a local storage adapter (e.g., IndexedDB, SQLite).
 * It is responsible for storing and retrieving Automerge documents as binary blobs.
 */
export interface LocalAdapter {
  /**
   * Retrieves a document by its ID.
   * @param id The ID of the document to retrieve.
   * @returns A promise that resolves to the document's binary data, or null if not found.
   */
  get(id: string): Promise<Uint8Array | null>;
  /**
   * Retrieves all documents from the local storage.
   * @returns A promise that resolves to an array of all local documents.
   */
  getAll(): Promise<LocalDocument[]>;
  /**
   * Saves a document to the local storage.
   * @param id The ID of the document to save.
   * @param binary The binary data of the document.
   * @returns A promise that resolves when the document is saved.
   */
  put(id: string, binary: Uint8Array): Promise<void>;
  /**
   * Saves multiple documents to the local storage.
   * @param docs The documents to save.
   * @returns A promise that resolves when all documents are saved.
   */
  putAll(docs: LocalDocument[]): Promise<void>;
  /**
   * Deletes a document from the local storage.
   * @param id The ID of the document to delete.
   * @returns A promise that resolves when the document is deleted.
   */
  delete(id: string): Promise<void>;
  /**
   * Deletes multiple documents from the local storage.
   * @param ids The IDs of the documents to delete.
   * @returns A promise that resolves when all documents are deleted.
   */
  deleteAll(ids: string[]): Promise<void>;
}

/**
 * Represents the interface for a remote storage adapter (e.g., a WebSocket server, Firestore).
 * It is responsible for sending and receiving full document binaries.
 */
export interface RemoteAdapter {
  /**
   * Subscribes to incoming document changes from the remote peer.
   * @param callback A function to handle incoming documents.
   * @returns An unsubscribe function.
   */
  watch(callback: (doc: LocalDocument) => void): () => void;

  /**
   * Sends a full document binary to the remote peer.
   * @param doc The document to send.
   * @returns {Promise<void>}
   */
  send(doc: LocalDocument): Promise<void>;

  /**
   * Fetches the initial state of all documents from the remote peer.
   * This is used during the bootstrap process.
   * @returns A promise that resolves to an array of all remote documents.
   */
  getSnapshot(): Promise<LocalDocument[]>;
}