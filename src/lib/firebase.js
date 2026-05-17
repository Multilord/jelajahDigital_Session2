import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Syncs the student session to Firestore.
 * This allows the facilitator to see all games in one place.
 */
export async function syncSessionToFirestore(session) {
  if (!session?.sessionId) return;
  
  try {
    const sessionRef = doc(db, 'sessions', session.sessionId);
    await setDoc(sessionRef, {
      ...session,
      lastSync: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Firebase Sync Error:', error);
  }
}

/**
 * Records a specific game generation in a global collection.
 * Useful for a "Hall of Fame" display.
 */
export async function recordGameToGallery(session, config) {
  if (!session?.sessionId || !config) return;

  try {
    const gameRef = doc(db, 'games', session.sessionId);
    await setDoc(gameRef, {
      sessionId: session.sessionId,
      title: config.title,
      description: config.description,
      html: config.html,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Gallery Record Error:', error);
  }
}
