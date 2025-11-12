
import { LocalAdapter, LocalDocument } from './types.js';

/**
 * An in-memory implementation of the LocalAdapter interface for testing and demonstration.
 */
export class LMemory implements LocalAdapter {
  private documents: Map<string, Uint8Array> = new Map();
  /**
   * Gets a document from memory.
   * @param id The ID of the document to get.
   * @returns {Promise<Uint8Array | null>} A promise that resolves to the document, or null if not found.
   */
  async get(id: string): Promise<Uint8Array | null> {
    return this.documents.get(id) || null;
  }
  /**
   * Gets all documents from memory.
   * @returns {Promise<LocalDocument[]>} A promise that resolves to an array of all documents.
   */
  async getAll(): Promise<LocalDocument[]> {
    const docs: LocalDocument[] = [];
    for (const [id, binary] of this.documents.entries()) {
      docs.push({ id, binary });
    }
    return docs;
  }
  /**
   * Puts a document into memory.
   * @param id The ID of the document to put.
   * @param binary The binary data of the document.
   * @returns {Promise<void>}
   */
  async put(id: string, binary: Uint8Array): Promise<void> {
    this.documents.set(id, binary);
  }
  /**
   * Puts multiple documents into memory.
   * @param docs The documents to put.
   * @returns {Promise<void>}
   */
  async putAll(docs: LocalDocument[]): Promise<void> {
    for (const doc of docs) {
      this.documents.set(doc.id, doc.binary);
    }
  }
  /**
   * Deletes a document from memory.
   * @param id The ID of the document to delete.
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    this.documents.delete(id);
  }
  /**
   * Deletes multiple documents from memory.
   * @param ids The IDs of the documents to delete.
   * @returns {Promise<void>}
   */
  async deleteAll(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.documents.delete(id);
    }
  }
}