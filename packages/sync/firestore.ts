
import {
  collection,
  onSnapshot,
  doc as fireDoc,
  setDoc,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import { RemoteAdapter, LocalDocument } from './types.js';

/**
 * An implementation of the RemoteAdapter interface for Firestore.
 * @implements {RemoteAdapter}
 */
export class LFirestore implements RemoteAdapter {
  private firestore: Firestore;
  private collectionName: string;
  /**
   * Creates an instance of LFirestore.
   * @param firestore The Firestore instance.
   * @param collectionName The name of the collection to use for storing documents.
   */
  constructor(firestore: Firestore, collectionName: string) {
    this.firestore = firestore;
    this.collectionName = collectionName;
  }
  /**
   * Watches for changes in the Firestore collection.
   * @param callback A callback function to handle incoming documents.
   * @returns An unsubscribe function.
   */
  watch(callback: (doc: LocalDocument) => void): () => void {
    const q = collection(this.firestore, this.collectionName);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          const doc: LocalDocument = {
            id: change.doc.id,
            binary: new Uint8Array(data.binary),
          };
          callback(doc);
        }
      });
    });
    return unsubscribe;
  }

  /**
   * Sends a document to Firestore.
   * @param doc The document to send.
   * @returns {Promise<void>}
   */
  async send(doc: LocalDocument): Promise<void> {
    const { id, binary } = doc;
    const docRef = fireDoc(this.firestore, this.collectionName, id);
    await setDoc(docRef, { binary: Array.from(binary) });
  }

  /**
   * Gets a snapshot of all documents from Firestore.
   * @returns {Promise<LocalDocument[]>} A promise that resolves to an array of documents.
   */
  async getSnapshot(): Promise<LocalDocument[]> {
    const q = collection(this.firestore, this.collectionName);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      binary: new Uint8Array(doc.data().binary),
    }));
  }
}