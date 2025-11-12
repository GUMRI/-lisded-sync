
import './style.css';
import { LSyncEngine, LFirestore, LMemory } from '@listed/sync';
import { firebaseConfig } from './config';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

interface TextDoc {
  text: string;
}

const editor = document.getElementById('editor') as HTMLTextAreaElement;
const state = document.getElementById('state') as HTMLPreElement;

const docId = 'collaborative-text-doc';

async function main() {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  // Initialize adapters
  const localAdapter = new LMemory();
  const remoteAdapter = new LFirestore(firestore, 'documents');

  // Initialize SyncManager
  const syncManager = new LSyncEngine<TextDoc>(localAdapter, remoteAdapter);

  // Subscribe to document changes
  syncManager.subscribe(docId, (doc) => {
    if (doc && editor.value !== doc.text) {
      editor.value = doc.text || '';
    }
    state.textContent = JSON.stringify(doc, null, 2);
  });

  // Bootstrap the SyncManager
  editor.value = 'Initializing...';
  await syncManager.bootstrap();

  let doc = syncManager.getDocument(docId);
  if (!doc) {
    // Create the document if it doesn't exist
    await syncManager.createDocument(docId, { text: '' });
  }

  editor.disabled = false;
  editor.focus();

  // Handle editor input
  editor.addEventListener('input', () => {
    syncManager.updateDocument(docId, (doc) => {
     doc.text = editor.value;
   });
  });
}

main();
